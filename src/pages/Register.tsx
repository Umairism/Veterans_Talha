import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Heart } from 'lucide-react';

export function Register() {
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState<'veteran' | 'organization'>(
    (searchParams.get('type') as 'veteran' | 'organization') || 'veteran'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [profession, setProfession] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'veteran' || type === 'organization') {
      setUserType(type);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, {
        user_type: userType,
        full_name: fullName,
        profession: userType === 'veteran' ? profession : undefined,
        organization_name: userType === 'organization' ? organizationName : undefined,
        city,
      });
      // Don't manually navigate - PublicRoute will handle redirect
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to create account. Please try again.');
      } else {
        setError('Failed to create account. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-cream-50 to-teal-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <Heart className="text-amber-600" size={40} />
            <h1 className="text-4xl font-serif font-bold text-gray-800">VeteranMeet</h1>
          </Link>
          <h2 className="text-3xl font-serif font-bold text-gray-800 mb-2">Join Our Community</h2>
          <p className="text-gray-600 text-lg">Create your account to get started</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setUserType('veteran')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                userType === 'veteran'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Veteran
            </button>
            <button
              type="button"
              onClick={() => setUserType('organization')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                userType === 'organization'
                  ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Organization
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
            />

            {userType === 'veteran' ? (
              <>
                <Input
                  label="Full Name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Smith"
                  required
                />
                <Input
                  label="Profession"
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g., Teacher, Engineer, Doctor"
                  required
                />
              </>
            ) : (
              <Input
                label="Organization Name"
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Community Helpers Inc."
                required
              />
            )}

            <Input
              label="City"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="New York"
              required
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
              variant={userType === 'organization' ? 'secondary' : 'primary'}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
