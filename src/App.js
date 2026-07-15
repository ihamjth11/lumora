import UserProfile from './pages/UserProfile';
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

function AppContent() {
  const { currentUser, userProfile, authLoading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  // 1. Splash animation first (always shows once)
  if (!splashDone) {
    return <SplashScreen onComplete={() => setSplashDone(true)} />;
  }

  // 2. Firebase checking who's logged in
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

  // 3. Not logged in → Welcome/Login/Signup
  if (!currentUser) {
    return <WelcomePage onAuthComplete={() => {}} />;
  }

  // 4. Logged in but no Firestore profile yet → Onboarding
  if (!userProfile) {
    return <Onboarding />;
  }

  // 5. Fully set up → Main App
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa' }}>
        <DesktopSidebar />
        <div style={{ flex: 1, minHeight: '100vh', background: '#fafafa' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/search" element={<Search />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/u/:username" element={<UserProfile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/chat/:id" element={<ChatPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/founder" element={<Founder />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            
          </Routes>
          <BottomNav />
        </div>
      </div>
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