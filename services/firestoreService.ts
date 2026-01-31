import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Trip, Response, Contact, UserProfile } from '../types';

// ==================== TRIPS ====================

// Create a new trip
export const createTrip = async (trip: Trip): Promise<string> => {
  const tripRef = doc(db, 'trips', trip.id);
  await setDoc(tripRef, trip);
  return trip.id;
};

// Get a single trip by ID
export const getTrip = async (tripId: string): Promise<Trip | null> => {
  const tripRef = doc(db, 'trips', tripId);
  const tripSnap = await getDoc(tripRef);

  if (tripSnap.exists()) {
    return tripSnap.data() as Trip;
  }
  return null;
};

// Get all trips for a user
export const getUserTrips = async (userId: string): Promise<Trip[]> => {
  const tripsQuery = query(
    collection(db, 'trips'),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(tripsQuery);
  return snapshot.docs.map((doc) => doc.data() as Trip);
};

// Subscribe to user's trips (real-time updates)
export const subscribeToUserTrips = (
  userId: string,
  callback: (trips: Trip[]) => void
): Unsubscribe => {
  const tripsQuery = query(
    collection(db, 'trips'),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(tripsQuery, (snapshot) => {
    const trips = snapshot.docs.map((doc) => doc.data() as Trip);
    callback(trips);
  });
};

// Update a trip
export const updateTrip = async (tripId: string, updates: Partial<Trip>): Promise<void> => {
  const tripRef = doc(db, 'trips', tripId);
  await updateDoc(tripRef, updates);
};

// Delete a trip
export const deleteTrip = async (tripId: string): Promise<void> => {
  const tripRef = doc(db, 'trips', tripId);
  await deleteDoc(tripRef);
};

// ==================== RESPONSES ====================

// Create a response
export const createResponse = async (response: Response): Promise<string> => {
  const responsesRef = collection(db, 'responses');
  const docRef = await addDoc(responsesRef, response);
  return docRef.id;
};

// Get responses for a trip
export const getTripResponses = async (tripId: string): Promise<Response[]> => {
  const responsesQuery = query(
    collection(db, 'responses'),
    where('tripId', '==', tripId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(responsesQuery);
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Response));
};

// Subscribe to trip responses (real-time updates)
export const subscribeToTripResponses = (
  tripId: string,
  callback: (responses: Response[]) => void
): Unsubscribe => {
  const responsesQuery = query(
    collection(db, 'responses'),
    where('tripId', '==', tripId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(responsesQuery, (snapshot) => {
    const responses = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Response));
    callback(responses);
  });
};

// ==================== CONTACTS ====================

// Add a contact
export const addContact = async (ownerId: string, contact: Omit<Contact, 'id' | 'ownerId'>): Promise<string> => {
  const contactsRef = collection(db, 'users', ownerId, 'contacts');
  const docRef = await addDoc(contactsRef, {
    ...contact,
    ownerId,
  });
  return docRef.id;
};

// Add multiple contacts (batch import)
export const addContacts = async (
  ownerId: string,
  contacts: Omit<Contact, 'id' | 'ownerId'>[]
): Promise<string[]> => {
  const ids: string[] = [];
  for (const contact of contacts) {
    const id = await addContact(ownerId, contact);
    ids.push(id);
  }
  return ids;
};

// Get all contacts for a user
export const getUserContacts = async (userId: string): Promise<Contact[]> => {
  const contactsRef = collection(db, 'users', userId, 'contacts');
  const snapshot = await getDocs(contactsRef);
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Contact));
};

// Subscribe to user's contacts (real-time updates)
export const subscribeToUserContacts = (
  userId: string,
  callback: (contacts: Contact[]) => void
): Unsubscribe => {
  const contactsRef = collection(db, 'users', userId, 'contacts');

  return onSnapshot(contactsRef, (snapshot) => {
    const contacts = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Contact));
    callback(contacts);
  });
};

// Update a contact
export const updateContact = async (
  ownerId: string,
  contactId: string,
  updates: Partial<Contact>
): Promise<void> => {
  const contactRef = doc(db, 'users', ownerId, 'contacts', contactId);
  await updateDoc(contactRef, updates);
};

// Delete a contact
export const deleteContact = async (ownerId: string, contactId: string): Promise<void> => {
  const contactRef = doc(db, 'users', ownerId, 'contacts', contactId);
  await deleteDoc(contactRef);
};

// Match contacts against registered users by email/phone
export const matchContactsWithUsers = async (contacts: Contact[]): Promise<Contact[]> => {
  const matchedContacts: Contact[] = [];

  for (const contact of contacts) {
    let matchedUserId: string | undefined;

    // Try to match by email
    if (contact.email) {
      const emailQuery = query(
        collection(db, 'users'),
        where('email', '==', contact.email)
      );
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        matchedUserId = emailSnapshot.docs[0].id;
      }
    }

    // Try to match by phone if no email match
    if (!matchedUserId && contact.phone) {
      const phoneQuery = query(
        collection(db, 'users'),
        where('phone', '==', contact.phone)
      );
      const phoneSnapshot = await getDocs(phoneQuery);
      if (!phoneSnapshot.empty) {
        matchedUserId = phoneSnapshot.docs[0].id;
      }
    }

    matchedContacts.push({
      ...contact,
      matchedUserId,
    });
  }

  return matchedContacts;
};
