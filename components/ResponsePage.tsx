
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Clock, Calendar, MapPin, Send, MessageCircle, Plane, Home, Star, Loader2 } from 'lucide-react';
import { Trip, Response, ResponseStatus, TimeWindow, Venue } from '../types';
import { getTrip, createResponse } from '../services/firestoreService';

const ResponsePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [selectedWindows, setSelectedWindows] = useState<string[]>([]);
  const [preferredVenue, setPreferredVenue] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadTrip = async () => {
      if (!id) return;
      const tripData = await getTrip(id);
      if (tripData) {
        setTrip(tripData);
      }
      setLoading(false);
    };
    loadTrip();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!trip) return (
    <div className="p-10 text-center space-y-4">
      <Plane className="w-12 h-12 text-slate-200 mx-auto" />
      <h2 className="text-xl font-bold">Trip not found</h2>
    </div>
  );

  const toggleWindow = (windowId: string) => {
    setSelectedWindows(prev =>
      prev.includes(windowId) ? prev.filter(wid => wid !== windowId) : [...prev, windowId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedWindows.length === 0) return;

    setSubmitting(true);

    const newResponse: Response = {
      id: Math.random().toString(36).substr(2, 9),
      tripId: trip.id,
      responderName: name,
      status: ResponseStatus.Confirmed,
      selectedWindowIds: selectedWindows,
      preferredVenueName: preferredVenue || undefined,
      note,
      createdAt: new Date().toISOString()
    };

    // Save to Firestore
    await createResponse(newResponse);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
          <Check className="w-10 h-10 text-green-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">See you soon!</h2>
          <p className="text-slate-500">Your response has been sent. You'll get a text when plans are locked.</p>
        </div>
        <button onClick={() => navigate('/')} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl">
          Get Trip Mode
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="bg-slate-900 text-white p-8 pt-12 pb-10 rounded-b-[40px] shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-xl font-bold">
              {trip.city.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Invitation</p>
              <h1 className="text-2xl font-bold">Trip to {trip.city}</h1>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center text-slate-400 text-sm">
              <Calendar className="w-4 h-4 mr-2 text-blue-400" />
              <span>{new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
            {trip.stayingLocations.length > 0 && (
              <div className="flex items-center text-slate-400 text-xs">
                <Home className="w-3.5 h-3.5 mr-2 text-blue-400" />
                <span>Staying in: {trip.stayingLocations.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8 pb-24">
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Your Name</label>
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-xl py-4 px-4 font-medium shadow-sm"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        {trip.timeWindows.length > 0 && (
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Choose your free slots</label>
            {Array.from(new Set(trip.timeWindows.map(w => w.date))).map((date: string) => (
              <div key={date} className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-400 ml-1 uppercase">
                  {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {trip.timeWindows.filter(w => w.date === date).map(window => (
                    <button
                      key={window.id}
                      type="button"
                      onClick={() => toggleWindow(window.id)}
                      className={`py-3 px-1 rounded-xl text-[10px] font-bold border transition-all ${
                        selectedWindows.includes(window.id)
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-500 shadow-sm'
                      }`}
                    >
                      {window.timeLabel}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {trip.selectedVenues.length > 0 && (
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Any of these look good?</label>
            <div className="space-y-3">
              {trip.selectedVenues.map((v, i) => (
                <div
                  key={i}
                  onClick={() => setPreferredVenue(v.name)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    preferredVenue === v.name ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-blue-500 uppercase">{v.type}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{v.name}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{v.description}</p>
                    </div>
                    {preferredVenue === v.name && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Note (optional)</label>
          <textarea
            className="w-full bg-white border border-slate-200 rounded-xl py-4 px-4 font-medium shadow-sm resize-none"
            rows={3}
            placeholder="Any preferences or notes..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !name}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Confirm Availability'
          )}
        </button>
      </form>
    </div>
  );
};

export default ResponsePage;
