
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Shield, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter the admin password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (password === 'KHREWS') {
      toast({
        title: "🔓 Admin Access Granted",
        description: "Welcome to IRPS Admin Control Panel",
      });
      onLogin(true);
    } else {
      toast({
        title: "❌ Access Denied",
        description: "Invalid admin credentials",
        variant: "destructive",
      });
      setPassword('');
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center font-poppins">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <Card className="w-full max-w-md bg-black/60 border-red-500/30 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-red-400 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-400">
            🔒 ADMIN ACCESS CONTROL
          </CardTitle>
          <p className="text-gray-300 text-sm mt-2">
            Enhanced Multi-Language Protection System
          </p>
          <p className="text-gray-400 text-xs">
            Restricted Area - Authorized Personnel Only
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Admin Password
            </label>
            <Input
              type="password"
              placeholder="Enter admin password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-black/40 border-red-500/30 text-white placeholder:text-gray-500 focus:border-red-400"
            />
          </div>
          
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white h-12"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Authenticating...
              </div>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                ACCESS ADMIN PANEL
              </>
            )}
          </Button>
          
          <Button
            onClick={() => onLogin(false)}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              🛡️ IRPS 295 - Administrative Control System
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Dedicated to Allama Khadim Hussain Rizvi
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 border border-red-500 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-16 h-16 border border-red-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-red-600 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-10 right-10 w-12 h-12 border border-red-300 rounded-full animate-pulse delay-3000"></div>
      </div>
    </div>
  );
};

export default AdminLogin;
