
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface BlackHoleAnimationProps {
  onAdminAccess: () => void;
}

const BlackHoleAnimation: React.FC<BlackHoleAnimationProps> = ({ onAdminAccess }) => {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleBlackHoleClick = () => {
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = () => {
    if (password === 'irps295') {
      setShowPasswordDialog(false);
      setPassword('');
      onAdminAccess();
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the IRPS Admin Panel",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid password",
        variant: "destructive",
      });
      setPassword('');
    }
  };

  return (
    <>
      <div 
        className="relative cursor-pointer group"
        onClick={handleBlackHoleClick}
      >
        {/* Outer event horizon */}
        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 animate-spin-slow opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
        
        {/* Accretion disk */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 animate-spin opacity-60 group-hover:animate-pulse-glow"></div>
        
        {/* Inner black hole */}
        <div className="absolute inset-6 rounded-full bg-black border-2 border-purple-400 group-hover:border-purple-300 transition-colors duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-800 to-black animate-pulse"></div>
        </div>
        
        {/* Gravitational lensing effect */}
        <div className="absolute inset-0 rounded-full border border-blue-400/20 animate-ping"></div>
        <div className="absolute inset-1 rounded-full border border-purple-400/10 animate-ping animation-delay-75"></div>
        
        {/* Tooltip */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Admin Access Portal
          </div>
        </div>
      </div>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-gray-900 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">🔒 Admin Access Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">Enter the admin password to access the control panel:</p>
            <Input
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/40 border-purple-500/30 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handlePasswordSubmit}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Access Admin Panel
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPassword('');
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BlackHoleAnimation;
