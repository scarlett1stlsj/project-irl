import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, getUserProfile, createUserProfile, signOut } from '../services/authService';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  needsProfileSetup: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Try to get existing profile
        const existingProfile = await getUserProfile(firebaseUser.uid);

        if (existingProfile) {
          setProfile(existingProfile);
        } else {
          // Create initial profile from auth data
          const initialProfile: Partial<UserProfile> = {
            id: firebaseUser.uid,
            email: firebaseUser.email || undefined,
            phone: firebaseUser.phoneNumber || undefined,
            name: firebaseUser.displayName || '',
            createdAt: new Date().toISOString(),
          };
          await createUserProfile(firebaseUser.uid, initialProfile);
          setProfile(initialProfile as UserProfile);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    await createUserProfile(user.uid, updates);
    setProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setProfile(null);
  };

  // User needs profile setup if they're authenticated but have no name
  const needsProfileSetup = !!user && (!profile?.name || profile.name.trim() === '');

  const value: AuthContextType = {
    user,
    profile,
    loading,
    updateProfile,
    logout,
    needsProfileSetup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
