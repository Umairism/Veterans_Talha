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
        const parsedUser = JSON.parse(mockUser);
        const parsedProfile = JSON.parse(mockProfile);
        setUser(parsedUser);
        setProfile(parsedProfile);
        setLoading(false);
        return; // Don't set up Supabase listeners for mock auth
      } catch (error) {
        console.error('Error parsing mock auth:', error);
        localStorage.removeItem('mock_auth_user');
        localStorage.removeItem('mock_auth_profile');
      }
    }

    // Set up Supabase auth listeners
    let mounted = true;

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      (async () => {
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          if (mounted) {
            // If user has a session but no profile, sign them out
            if (!profileData) {
              console.warn('Session found but no profile - clearing session');
              await supabase.auth.signOut();
              setUser(null);
              setProfile(null);
            } else {
              setProfile(profileData);
            }
            setLoading(false);
          }
        } else {
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        }
      })();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      // Don't process auth changes if we're using mock auth
      const hasMockAuth = localStorage.getItem('mock_auth_user');
      if (hasMockAuth) return;

      setUser(session?.user ?? null);
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        if (mounted) {
          setProfile(profileData);
          setLoading(false);
        }
      } else {
        if (mounted) {
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
      // Don't throw error, just continue to try Supabase auth
    }

    if (existingProfile) {
      // User exists in profiles table, use mock auth (works with any password)
      const mockUser: User = {
        id: existingProfile.id,
        email: email,
        created_at: existingProfile.created_at,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        role: 'authenticated',
      } as User;

      // Store in localStorage and update state together in a batch
      localStorage.setItem('mock_auth_user', JSON.stringify(mockUser));
      localStorage.setItem('mock_auth_profile', JSON.stringify(existingProfile));
      
      // Use React 18's automatic batching by updating in same tick
      setProfile(existingProfile); // Set profile first
      setUser(mockUser); // Then user - this ensures profile is always available when user is set
      return;
    }

    // If no profile exists, try actual Supabase auth (for newly verified users)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    // If login successful but no profile, wait and check again (trigger might be creating it)
    if (data.user) {
      // Wait a moment for the profile to be created by trigger
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!newProfile) {
        // Profile still doesn't exist, sign out and show error
        await supabase.auth.signOut();
        throw new Error('Account setup incomplete. Please contact support or try signing up again.');
      }
      
      // Profile exists, the auth state listener will handle setting user/profile
      // Just return successfully - don't manually set state here to avoid conflicts
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
    // Get the correct redirect URL based on environment
    const redirectUrl = window.location.origin + '/login';
    
    // Sign up with user metadata - the database trigger will create the profile
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          ...userData,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('User creation failed');
    
    // If there's a session, sign out immediately to prevent loading state issues
    if (data.session) {
      await supabase.auth.signOut();
    }
    
    // Always show verification message
    throw new Error('VERIFICATION_EMAIL_SENT');
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
