import { useAuth } from '../context/AuthContext';
import { VeteranDashboard } from './VeteranDashboard';
import { OrganizationDashboard } from './OrganizationDashboard';

export function Dashboard() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-cream-50 to-teal-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // Profile should exist here because ProtectedRoute ensures user is authenticated
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-cream-50 to-teal-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (profile.user_type === 'veteran') {
    return <VeteranDashboard />;
  }

  if (profile.user_type === 'organization') {
    return <OrganizationDashboard />;
  }

  return null;
}
