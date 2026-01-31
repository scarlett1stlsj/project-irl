
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar as CalendarIcon, ChevronLeft, ArrowRight, Navigation, Loader2 } from 'lucide-react';
import { getCoordinatesForCity, getCityFromCoordinates } from '../services/geminiService';
import { createTrip } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { Trip } from '../types';

const TripForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const cityName = await getCityFromCoordinates(pos.coords.latitude, pos.coords.longitude);
      setCity(cityName);
      setIsLocating(false);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const coords = await getCoordinatesForCity(city);

    const newTrip: Trip = {
      id: Math.random().toString(36).substr(2, 9),
      ownerId: user.uid,
      city,
      lat: coords.lat,
      lng: coords.lng,
      startDate,
      endDate: endDate || startDate,
      createdAt: new Date().toISOString(),
      activities: [],
      stayingLocations: [],
      timeWindows: [],
      selectedVenues: []
    };

    // Save to Firestore
    await createTrip(newTrip);
    navigate(`/trip/${newTrip.id}`);
  };

  return (
    <div className="flex-1 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center mb-10">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold ml-2">Create Trip</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase text-slate-400">Destination</label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-[10px] font-bold text-blue-600 flex items-center bg-blue-50 px-2 py-1 rounded-md"
              >
                {isLocating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Navigation className="w-3 h-3 mr-1" />}
                Use Current
              </button>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input
                type="text"
                placeholder="Where are you going?"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={city}
                onChange={e => setCity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400">Start Date</label>
              <input
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400">End Date</label>
              <input
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-200"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Create Trip</span><ArrowRight className="w-5 h-5" /></>}
        </button>
      </form>
    </div>
  );
};

export default TripForm;
