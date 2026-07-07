import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
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

function App() {
  const [phase, setPhase] = useState('splash');
  // phases: splash → welcome → onboarding → app

  const handleSplashComplete = () => {
    const authed = localStorage.getItem('lumora_authed');
    const onboarded = localStorage.getItem('lumora_onboarded');
    if (authed && onboarded) {
      setPhase('app');
    } else if (authed) {
      setPhase('onboarding');
    } else {
      setPhase('welcome');
    }
  };

  const handleAuthComplete = () => {
    localStorage.setItem('lumora_authed', 'true');
    const onboarded = localStorage.getItem('lumora_onboarded');
    if (onboarded) {
      setPhase('app');
    } else {
      setPhase('onboarding');
    }
  };

  const handleOnboardingComplete = (data) => {
    localStorage.setItem('lumora_onboarded', 'true');
    localStorage.setItem('lumora_user', JSON.stringify(data));
    setPhase('app');
  };

  return (
    <ThemeProvider>
      {/* Splash Screen */}
      {phase === 'splash' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {/* Welcome — Login/Signup */}
      {phase === 'welcome' && (
        <WelcomePage onAuthComplete={handleAuthComplete} />
      )}

      {/* Onboarding */}
      {phase === 'onboarding' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {/* Main App */}
      {phase === 'app' && (
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
      )}
    </ThemeProvider>
  );
}

export default App;