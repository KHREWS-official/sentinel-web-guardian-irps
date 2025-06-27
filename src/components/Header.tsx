
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, BookOpen, MessageCircle, Bell } from 'lucide-react';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';
import LearningSection from './LearningSection';
import ContactSection from './ContactSection';
import UpdatesSection from './UpdatesSection';

const Header = () => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLearning, setShowLearning] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);

  const handleAdminLogin = (success: boolean) => {
    setShowAdminLogin(false);
    if (success) {
      setShowAdmin(true);
    }
  };

  if (showAdmin) {
    return (
      <AdminPanel 
        onBack={() => setShowAdmin(false)} 
        onDataUpdate={() => {
          // Refresh data when admin makes changes
          window.location.reload();
        }} 
      />
    );
  }

  return (
    <>
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">IRPS_295</h1>
              <p className="text-sm text-blue-300">Ideological Realms Protecting Software</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowUpdates(true)}
                variant="outline"
                size="sm"
                className="bg-purple-600/20 border-purple-500/30 text-purple-200 hover:bg-purple-600/30"
              >
                <Bell className="mr-2 h-4 w-4" />
                Updates
              </Button>
              
              <Button
                onClick={() => setShowLearning(true)}
                variant="outline"
                size="sm"
                className="bg-blue-600/20 border-blue-500/30 text-blue-200 hover:bg-blue-600/30"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Learning AI
              </Button>
              
              <Button
                onClick={() => setShowContact(true)}
                variant="outline"
                size="sm"
                className="bg-green-600/20 border-green-500/30 text-green-200 hover:bg-green-600/30"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Admin
              </Button>
              
              <Button
                onClick={() => setShowAdminLogin(true)}
                variant="outline"
                size="sm"
                className="bg-red-600/20 border-red-500/30 text-red-200 hover:bg-red-600/30"
              >
                <Settings className="mr-2 h-4 w-4" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal Components */}
      {showAdminLogin && (
        <AdminLogin onLogin={handleAdminLogin} />
      )}
      
      {showLearning && (
        <LearningSection onClose={() => setShowLearning(false)} />
      )}
      
      {showContact && (
        <ContactSection onClose={() => setShowContact(false)} />
      )}
      
      {showUpdates && (
        <UpdatesSection onClose={() => setShowUpdates(false)} />
      )}
    </>
  );
};

export default Header;
