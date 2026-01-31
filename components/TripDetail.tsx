
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, MapPin, Calendar, Clock, User, Check, Smartphone, Loader2, ArrowRight, Star, RefreshCw, X, MessageCircle, Sparkles, Coffee, Beer, Utensils, Zap, Users, Edit3 } from 'lucide-react';
import { Trip, Venue, Activity, Contact } from '../types';
import { getVenueSuggestions } from '../services/geminiService';
import { getTrip, updateTrip, subscribeToUserContacts } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';

const INSPIRATION_IDEAS = [
  { id: 1, title: 'Quick Catchup', type: 'Coffee', icon: <Coffee className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700', description: 'Meet at a central cafe for 45 mins.' },
  { id: 2, title: 'Happy Hour', type: 'Cocktails', icon: <Beer className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700', description: 'Check out local breweries or a rooftop bar.' },
  { id: 3, title: 'Proper Dinner', type: 'Food', icon: <Utensils className="w-4 h-4" />, color: 'bg-green-100 text-green-700', description: 'Book a table at that new spot everyone talks about.' },
  { id: 4, title: 'Activity', type: 'Sport', icon: <Zap className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700', description: 'Bouldering, a walk in the park, or bowling.' },
];

const TripDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityStep, setActivityStep] = useState(1);

  // Activity Creation State
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [suggestedVenues, setSuggestedVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [showCustomVenue, setShowCustomVenue] = useState(false);
  const [customVenueName, setCustomVenueName] = useState('');
  const [customVenueAddress, setCustomVenueAddress] = useState('');

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

  useEffect(() => {
    if (!user) return;

    // Subscribe to user's contacts
    const unsubscribe = subscribeToUserContacts(user.uid, (updatedContacts) => {
      setContacts(updatedContacts);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!trip) return <div className="p-10 text-center">Trip not found</div>;

  const handleStartActivity = () => {
    setShowActivityModal(true);
    setActivityStep(1);
    setSelectedContact(null);
    setSelectedTime('');
    setSelectedVenue(null);
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setActivityStep(2);
  };

  const handleTimeSelect = async (time: string) => {
    setSelectedTime(time);
    setActivityStep(3);
    setLoadingVenues(true);
    const venues = await getVenueSuggestions(trip.city);
    setSuggestedVenues(venues);
    setLoadingVenues(false);
  };

  const handleVenueSelect = (venue: Venue) => {
    setSelectedVenue(venue);
    setActivityStep(4);
  };

  const sendInvite = async (platform: 'sms' | 'whatsapp') => {
    if (!selectedContact || !selectedVenue || !selectedTime) return;

    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      tripId: trip.id,
      friendId: selectedContact.id,
      friendName: selectedContact.name,
      timeSlot: selectedTime,
      venue: selectedVenue,
      status: 'pending'
    };

    const updatedTrip = { ...trip, activities: [...trip.activities, newActivity] };
    setTrip(updatedTrip);

    // Save to Firestore
    await updateTrip(trip.id, { activities: updatedTrip.activities });

    const responseUrl = `${window.location.origin}${window.location.pathname}#/respond/${trip.id}`;
    const msg = `Hey ${selectedContact.name}! I'm in ${trip.city} on ${new Date(trip.startDate).toLocaleDateString()}. Want to grab a drink at ${selectedVenue.name} around ${selectedTime}? Let me know here: ${responseUrl}`;

    if (platform === 'sms') {
      const phoneNumber = selectedContact.phone || '';
      window.open(`sms:${phoneNumber}?body=${encodeURIComponent(msg)}`);
    } else {
      const phoneNumber = selectedContact.phone?.replace(/\D/g, '') || '';
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`);
    }

    setShowActivityModal(false);
  };

  // Available time slots
  const timeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 relative min-h-screen">
      {/* Top Header */}
      <div className="bg-white p-6 pb-4 border-b border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate('/')} className="text-slate-400 p-1 hover:bg-slate-50 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-blue-100">
            Live Trip
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">{trip.city}</h1>
        <div className="flex items-center text-slate-500 text-sm mt-2 font-medium">
          <Calendar className="w-4 h-4 mr-2 text-slate-400" />
          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
        </div>
      </div>

      {/* Activities List */}
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Activities</h3>
          {trip.activities.length > 0 && (
            <button
              onClick={handleStartActivity}
              className="text-xs font-bold text-blue-600 flex items-center bg-blue-50 py-1.5 px-3 rounded-full hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Activity
            </button>
          )}
        </div>

        {trip.activities.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-10 border-2 border-slate-100 text-center space-y-6 border-dashed animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
              <Sparkles className="w-10 h-10 text-blue-500" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-slate-900">Make it a trip to remember</h4>
              <p className="text-slate-500 text-sm leading-relaxed px-4">
                {contacts.length > 0 ? (
                  <>You have <span className="text-blue-600 font-bold">{contacts.length} contacts</span> ready to invite. Reach out and grab a coffee!</>
                ) : (
                  <>Import your contacts to start inviting friends on this trip.</>
                )}
              </p>
            </div>
            {contacts.length > 0 ? (
              <button
                onClick={handleStartActivity}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-3 shadow-xl shadow-blue-100 transition-all active:scale-95 group"
              >
                <span>Invite a Friend</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/contacts/import')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-3 shadow-xl shadow-blue-100 transition-all active:scale-95 group"
              >
                <Users className="w-5 h-5" />
                <span>Import Contacts</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {trip.activities.map(act => (
              <div key={act.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex justify-between items-center group hover:border-blue-200 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                    {act.friendName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight">{act.friendName}</h4>
                    <p className="text-xs text-slate-500 flex items-center mt-0.5">
                      <MapPin className="w-3 h-3 mr-1 text-slate-400" /> {act.venue.name} • {act.timeSlot}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ring-1 ${
                    act.status === 'pending' ? 'bg-orange-50 text-orange-600 ring-orange-100' : 'bg-green-50 text-green-600 ring-green-100'
                  }`}>
                    {act.status.toUpperCase()}
                  </span>
                  <div className="flex space-x-1.5 mt-2.5 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Smartphone className="w-3.5 h-3.5" />
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Inspiration Section */}
      <div className="px-6 py-4 pb-24 space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Activity Inspiration</h3>
        <div className="grid grid-cols-2 gap-4">
          {INSPIRATION_IDEAS.map(idea => (
            <div
              key={idea.id}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={handleStartActivity}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${idea.color}`}>
                {idea.icon}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{idea.title}</h4>
                <p className="text-[10px] text-slate-500 leading-normal">{idea.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      {trip.activities.length > 0 && (
        <button
          onClick={handleStartActivity}
          className="fixed bottom-8 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-400 flex items-center justify-center animate-in slide-in-from-bottom-8 duration-500 active:scale-90 transition-transform"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}

      {/* Activity Creation Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom duration-300">
          <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
            <h2 className="text-xl font-bold">Create Activity</h2>
            <button onClick={() => setShowActivityModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Step 1: Select Contact */}
            {activityStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">Who do you want to meet?</h3>
                  <p className="text-sm text-slate-500">Select a contact to invite.</p>
                </div>
                {contacts.length === 0 ? (
                  <div className="text-center py-10 space-y-4">
                    <Users className="w-12 h-12 text-slate-200 mx-auto" />
                    <div className="space-y-2">
                      <p className="text-slate-500 text-sm">No contacts imported yet.</p>
                      <button
                        onClick={() => {
                          setShowActivityModal(false);
                          navigate('/contacts/import');
                        }}
                        className="text-blue-600 font-bold text-sm"
                      >
                        Import Contacts
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contacts.map(contact => (
                      <button
                        key={contact.id}
                        onClick={() => handleContactSelect(contact)}
                        className="w-full bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between hover:border-blue-500 hover:shadow-md transition-all active:scale-[0.98]"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 font-bold ring-1 ring-slate-100">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-slate-900">{contact.name}</h4>
                            <p className="text-xs text-slate-500">{contact.email || contact.phone || 'No contact info'}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Select Time */}
            {activityStep === 2 && selectedContact && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="space-y-2 text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-50 mx-auto flex items-center justify-center ring-8 ring-blue-50/30">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg">When works for you?</h3>
                  <p className="text-sm text-slate-500 px-8">Pick a time to suggest to {selectedContact.name}.</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className="p-4 rounded-2xl border-2 border-slate-50 font-bold text-slate-700 bg-white shadow-sm hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-[0.98]"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Pick Venue */}
            {activityStep === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">Pick a Spot</h3>
                  <p className="text-sm text-slate-500">Hand-picked top-rated venues in {trip.city}.</p>
                </div>
                {loadingVenues ? (
                  <div className="flex flex-col items-center justify-center p-12">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <p className="text-sm text-slate-400 mt-4 font-medium">Generating recommendations...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {suggestedVenues.map((venue, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleVenueSelect(venue)}
                        className="w-full text-left bg-white border border-slate-200 p-4 rounded-2xl space-y-3 hover:border-blue-500 hover:shadow-md transition-all active:scale-[0.98]"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{venue.type}</span>
                            <h4 className="font-bold text-slate-900 text-lg mt-0.5">{venue.name}</h4>
                          </div>
                          <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center ring-1 ring-orange-100">
                            <Star className="w-3.5 h-3.5 mr-1 fill-orange-600" /> {venue.rating}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{venue.description}</p>
                        <div className="pt-2 flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-50">
                          <MapPin className="w-3 h-3 mr-1.5" /> {venue.address}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Final Confirmation */}
            {activityStep === 4 && selectedContact && selectedVenue && (
              <div className="space-y-8 py-4 animate-in zoom-in duration-300">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-green-50 rounded-full mx-auto flex items-center justify-center ring-8 ring-green-50/30">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="font-bold text-2xl text-slate-900">Invite Ready!</h3>
                  <div className="bg-slate-50 p-7 rounded-[2rem] space-y-6 text-left border border-slate-100 shadow-inner">
                    <div className="flex items-center space-x-4">
                      <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 ring-1 ring-slate-100">
                        <User className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inviting</p>
                        <p className="font-bold text-slate-900">{selectedContact.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 ring-1 ring-slate-100">
                        <MapPin className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Venue</p>
                        <p className="font-bold text-slate-900">{selectedVenue.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 ring-1 ring-slate-100">
                        <Clock className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</p>
                        <p className="font-bold text-slate-900">{selectedTime}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <button
                    onClick={() => sendInvite('sms')}
                    className="w-full bg-blue-600 text-white font-bold py-5 rounded-[1.5rem] flex items-center justify-center space-x-3 shadow-xl shadow-blue-100 active:scale-[0.98] transition-all"
                  >
                    <Smartphone className="w-6 h-6" />
                    <span>Send SMS Invite</span>
                  </button>
                  <button
                    onClick={() => sendInvite('whatsapp')}
                    className="w-full bg-green-600 text-white font-bold py-5 rounded-[1.5rem] flex items-center justify-center space-x-3 shadow-xl shadow-green-100 active:scale-[0.98] transition-all"
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span>Send WhatsApp Invite</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetail;
