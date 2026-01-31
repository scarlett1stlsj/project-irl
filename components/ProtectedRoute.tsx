import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, needsProfileSetup } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page, preserving the intended destination
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (needsProfileSetup && location.pathname !== '/profile/setup') {
    // Check if profile setup was just completed (bypass flag)
    const setupComplete = sessionStorage.getItem('profileSetupComplete');
    if (setupComplete) {
      sessionStorage.removeItem('profileSetupComplete');
      // Profile was just set up, don't redirect back
    } else {
      // Redirect to profile setup if name is not set
      return <Navigate to="/profile/setup" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
