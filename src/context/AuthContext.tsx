import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: {
    user_type: 'veteran' | 'organization';
    full_name: string;
    profession?: string;
    organization_name?: string;
    city?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Check for mock auth in localStorage first (development mode)
    const mockUser = localStorage.getItem('mock_auth_user');
    const mockProfile = localStorage.getItem('mock_auth_profile');

    if (mockUser && mockProfile) {
      try {
        setUser(JSON.parse(mockUser));
        setProfile(JSON.parse(mockProfile));
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing mock auth:', error);
        localStorage.removeItem('mock_auth_user');
        localStorage.removeItem('mock_auth_profile');
      }
    }

    // Fall back to Supabase auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
        setLoading(false);
      })();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Development mode: Auto-login with any valid email/password format
    // Check if user exists in profiles table
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (profileError) {
      console.error('Error checking profile:', profileError);
    }

    if (existingProfile) {
      // User exists, create mock auth user and set profile
      const mockUser: User = {
        id: existingProfile.id,
        email: email,
        created_at: existingProfile.created_at,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        role: 'authenticated',
      } as User;

      setUser(mockUser);
      setProfile(existingProfile);
      
      // Store in localStorage for persistence
      localStorage.setItem('mock_auth_user', JSON.stringify(mockUser));
      localStorage.setItem('mock_auth_profile', JSON.stringify(existingProfile));
      return;
    }

    // If no profile exists, try actual Supabase auth (for new signups)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        // If Supabase auth fails but email format is valid, show helpful message
        if (email.includes('@') && password.length >= 6) {
          throw new Error('Account not found. Please sign up first or use an existing account.');
        }
        throw error;
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: {
      user_type: 'veteran' | 'organization';
      full_name: string;
      profession?: string;
      organization_name?: string;
      city?: string;
    }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('User creation failed');

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      ...userData,
    });

    if (profileError) throw profileError;
  };

  const signOut = async () => {
    // Clear mock auth
    localStorage.removeItem('mock_auth_user');
    localStorage.removeItem('mock_auth_profile');
    
    // Also sign out from Supabase if authenticated
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Supabase signout error:', error);
    
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
