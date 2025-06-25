
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const ADMIN_PASSWORD = 'KHREWSIRPS1181852219**LCBP';

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

    // Simulate authentication delay for security
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (password === ADMIN_PASSWORD) {
      toast({
        title: "Access Granted",
        description: "Welcome to IRPS Admin Control Panel",
      });
      onLogin(true);
    } else {
      toast({
        title: "Access Denied",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 font-poppins flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        <Card className="bg-black/60 border-red-500/30 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-900/30 rounded-full border border-red-500/30">
                <Shield className="h-12 w-12 text-red-400" />
              </div>
            </div>
            <CardTitle className="text-red-400 text-2xl font-bold">
              🔒 RESTRICTED ACCESS
            </CardTitle>
            <p className="text-red-300 text-sm mt-2">
              IRPS Admin Control Panel Authentication
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="text-red-200 text-sm font-medium">
                Administrator Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter secure admin password..."
                  className="pl-10 bg-black/40 border-red-500/30 text-white placeholder:text-gray-400 focus:border-red-400"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Authenticating...
                  </div>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Access Admin Panel
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
            </div>

            <div className="text-center pt-4 border-t border-red-500/20">
              <p className="text-xs text-red-300/70">
                ⚠️ Unauthorized access attempts are logged and monitored
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
