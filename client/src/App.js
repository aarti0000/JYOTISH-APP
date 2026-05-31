import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layout
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import RatingPage from './pages/RatingPage';
import CalendarPage from './pages/CalendarPage';
import HoroscopePage from './pages/HoroscopePage';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AstrologerList from './pages/AstrologerList';
import AstrologerProfile from './pages/AstrologerProfile';
import BookAppointment from './pages/BookAppointment';
import UserDashboard from './pages/UserDashboard';
import AstrologerDashboard from './pages/AstrologerDashboard';
import ConsultationRoom from './pages/ConsultationRoom';
import KundaliPage from './pages/KundaliPage';
import AppointmentDetail from './pages/AppointmentDetail';
import ProfilePage from './pages/ProfilePage';
import PaymentPage from './pages/PaymentPage';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/astrologers" element={<AstrologerList />} />
        <Route path="/astrologers/:id" element={<AstrologerProfile />} />
        <Route path="/horoscope" element={<HoroscopePage />} />
        <Route path="/book/:astrologerId" element={
          <PrivateRoute><BookAppointment /></PrivateRoute>
        } />
        <Route path="/payment/:appointmentId" element={
          <PrivateRoute><PaymentPage /></PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute roles={['user']}><UserDashboard /></PrivateRoute>
        } />
        <Route path="/rate/:appointmentId" element={
  <PrivateRoute><RatingPage /></PrivateRoute>
} />
        <Route path="/astrologer/dashboard" element={
          <PrivateRoute roles={['astrologer']}><AstrologerDashboard /></PrivateRoute>
        } />
        <Route path="/appointments/:id" element={
          <PrivateRoute><AppointmentDetail /></PrivateRoute>
        } />
        <Route path="/consultation/:id" element={
          <PrivateRoute><ConsultationRoom /></PrivateRoute>
        } />
        <Route path="/kundali" element={
          <PrivateRoute><KundaliPage /></PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute><ProfilePage /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
