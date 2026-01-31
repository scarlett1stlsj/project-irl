
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Plane, MapPin, Calendar, ChevronRight, User, Users } from 'lucide-react';
import { Trip } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToUserTrips } from '../services/firestoreService';

const Welcome: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Subscribe to real-time updates from Firestore
    const unsubscribe = subscribeToUserTrips(user.uid, (updatedTrips) => {
      setTrips(updatedTrips);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="flex-1 flex flex-col p-6 pb-24">
      {/* User Profile Header */}
      <header className="mb-8 mt-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Trip Mode</h1>
            <p className="text-slate-500 mt-1">See more friends on every trip.</p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center"
          >
            <span className="text-lg font-bold text-blue-600">
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </button>
        </div>

        {/* Import Contacts CTA */}
        <button
          onClick={() => navigate('/contacts/import')}
          className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between hover:border-blue-200 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900 text-sm">Import Contacts</p>
              <p className="text-xs text-slate-500">Add friends to invite on trips</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </button>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : trips.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
            <Plane className="w-10 h-10 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">No trips yet</h2>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              Ready to coordinate? Create your first trip and share the link with friends.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">My Trips</h3>
          {trips.map(trip => (
            <Link
              key={trip.id}
              to={`/trip/${trip.id}`}
              className="block p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center text-blue-600 font-bold mb-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {trip.city}
                  </div>
                  <div className="flex items-center text-slate-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <ChevronRight className="text-slate-300" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-6 bg-gradient-to-t from-white via-white to-transparent">
        <button
          onClick={() => navigate('/new')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>New Trip</span>
        </button>
      </div>
    </div>
  );
};

export default Welcome;
