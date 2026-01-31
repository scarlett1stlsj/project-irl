import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Mail, Phone, LogOut, Users, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      await updateProfile({ name: name.trim() });
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/auth');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white p-6 pb-4 border-b border-slate-100">
        <div className="flex items-center">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-400">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold ml-2">Profile</h1>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSave}
                    disabled={loading || !name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{profile?.name || 'User'}</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-blue-600 font-medium"
                  >
                    Edit
                  </button>
                </div>
              )}
              <p className="text-slate-500 text-sm mt-1">
                Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            {profile?.email && (
              <div className="flex items-center space-x-3 text-slate-600">
                <Mail className="w-5 h-5 text-slate-400" />
                <span>{profile.email}</span>
              </div>
            )}
            {profile?.phone && (
              <div className="flex items-center space-x-3 text-slate-600">
                <Phone className="w-5 h-5 text-slate-400" />
                <span>{profile.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <button
            onClick={() => navigate('/contacts')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">My Contacts</p>
                <p className="text-xs text-slate-500">Manage imported contacts</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-center space-x-3 text-red-600 font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {loggingOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
