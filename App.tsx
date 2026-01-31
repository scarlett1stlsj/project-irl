
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthScreen from './components/auth/AuthScreen';
import ProfileSetup from './components/auth/ProfileSetup';
import Welcome from './components/Welcome';
import TripForm from './components/TripForm';
import TripDetail from './components/TripDetail';
import ResponsePage from './components/ResponsePage';
import UserProfile from './components/UserProfile';
import ContactsPage from './components/contacts/ContactsPage';
import ContactImport from './components/contacts/ContactImport';
import AddContact from './components/contacts/AddContact';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="mobile-container overflow-x-hidden min-h-screen flex flex-col">
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<AuthScreen />} />
            <Route path="/respond/:id" element={<ResponsePage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Welcome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/new"
              element={
                <ProtectedRoute>
                  <TripForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trip/:id"
              element={
                <ProtectedRoute>
                  <TripDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/setup"
              element={
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts"
              element={
                <ProtectedRoute>
                  <ContactsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts/import"
              element={
                <ProtectedRoute>
                  <ContactImport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts/add"
              element={
                <ProtectedRoute>
                  <AddContact />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
