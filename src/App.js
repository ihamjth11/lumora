import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/global.css';

import Home from './pages/Home';
import Explore from './pages/Explore';
import Search from './pages/Search';
import Saved from './pages/Saved';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import ChatPage from './pages/ChatPage';
import Settings from './pages/Settings';
import CreatePost from './pages/CreatePost';
import Founder from './pages/Founder';
import BottomNav from './components/BottomNav';
import DesktopSidebar from './components/DesktopSidebar';
import SplashScreen from './components/SplashScreen';
import Onboarding from './components/Onboarding';
import WelcomePage from './pages/WelcomePage';
import EditProfile from './pages/EditProfile';
import UserProfile from './pages/UserProfile';

function MainAppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa' }}>
      <DesktopSidebar />
      <div style={{ flex: 1, minHeight: '100vh', background: '#fafafa' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/search" element={<Search />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/chat/:id" element={<ChatPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/founder" element={<Founder />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/u/:username" element={<UserProfile />} />
        </Routes>
        <BottomNav />
      </div>
    </div>
  );
}
function AppContent() {
  const { currentUser, userProfile, authLoading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return <SplashScreen onComplete={() => setSplashDone(true)} />;
  }

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#020208',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid rgba(108,99,255,0.2)',
          borderTop: '3px solid #6C63FF',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!currentUser) {
    return <WelcomePage onAuthComplete={() => {}} />;
  }

  if (!userProfile) {
    return <Onboarding />;
  }

  return (
    <Router>
      <MainAppLayout />
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;