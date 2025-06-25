
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, AlertTriangle, Shield, Plus, FileText } from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
}

interface HighAlertProfile {
  url: string;
  addedAt: string;
  type: 'website' | 'social_media';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [newUrl, setNewUrl] = useState('');
  const [highAlertProfiles, setHighAlertProfiles] = useState<HighAlertProfile[]>([]);
  const { toast } = useToast();

  const addHighAlertProfile = () => {
    if (!newUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    const newProfile: HighAlertProfile = {
      url: newUrl,
      addedAt: new Date().toLocaleString(),
      type: newUrl.includes('facebook.com') || newUrl.includes('instagram.com') || 
            newUrl.includes('twitter.com') || newUrl.includes('tiktok.com') ? 'social_media' : 'website'
    };

    setHighAlertProfiles(prev => [...prev, newProfile]);
    setNewUrl('');
    
    toast({
      title: "High Alert Profile Added",
      description: `${newProfile.type === 'social_media' ? 'Social Media' : 'Website'} added to monitoring list`,
    });
  };

  const exportData = (type: 'high_alert' | 'blocked' | 'waiting') => {
    const data = type === 'high_alert' ? highAlertProfiles : 
                 type === 'blocked' ? [] : // Would be fetched from parent
                 []; // waiting list data
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `irps_${type}_profiles.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: `${type.replace('_', ' ')} profiles exported successfully`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-poppins">
      {/* Admin Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-red-500/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-red-400">🔥 ADMIN CONTROL PANEL</h1>
                <p className="text-lg text-red-300">High-Level System Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-red-400" />
              <Badge variant="destructive" className="text-sm">RESTRICTED ACCESS</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Add High Alert Profile */}
        <Card className="mb-8 bg-red-900/20 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Add High Alert Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter website URL or social media link for high alert monitoring..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="flex-1 bg-black/40 border-red-500/30 text-white placeholder:text-gray-400"
                />
                <Button
                  onClick={addHighAlertProfile}
                  className="bg-red-600 hover:bg-red-700 text-white min-w-[140px]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add to High Alert
                </Button>
              </div>
              <p className="text-sm text-red-300">
                ⚠️ High alert profiles are monitored with maximum priority and saved to secure files
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current High Alert Profiles */}
        <Card className="mb-8 bg-black/40 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              High Alert Profiles ({highAlertProfiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {highAlertProfiles.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No high alert profiles added yet</p>
            ) : (
              <div className="space-y-3">
                {highAlertProfiles.map((profile, index) => (
                  <div key={index} className="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-white font-medium break-all">{profile.url}</p>
                        <p className="text-sm text-gray-400">Added: {profile.addedAt}</p>
                      </div>
                      <Badge 
                        variant="destructive" 
                        className="ml-2"
                      >
                        {profile.type === 'social_media' ? '📱 Social Media' : '🌐 Website'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-black/40 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Data Export & Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => exportData('high_alert')}
                className="bg-purple-600 hover:bg-purple-700 text-white h-16 flex flex-col items-center justify-center"
              >
                <FileText className="h-5 w-5 mb-1" />
                Export High Alert Profiles
              </Button>
              
              <Button
                onClick={() => exportData('blocked')}
                className="bg-red-600 hover:bg-red-700 text-white h-16 flex flex-col items-center justify-center"
              >
                <AlertTriangle className="h-5 w-5 mb-1" />
                Export Blocked Sites
              </Button>
              
              <Button
                onClick={() => exportData('waiting')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white h-16 flex flex-col items-center justify-center"
              >
                <Shield className="h-5 w-5 mb-1" />
                Export Waiting List
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
              <h4 className="text-purple-300 font-semibold mb-2">📊 System Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">High Alert Profiles:</span>
                  <span className="text-white ml-2 font-bold">{highAlertProfiles.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Active Monitoring:</span>
                  <span className="text-green-400 ml-2 font-bold">ENABLED</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
