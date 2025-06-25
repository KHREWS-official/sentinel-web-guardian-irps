
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, AlertTriangle, Shield, Plus, FileText, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AdminPanelProps {
  onBack: () => void;
  onDataUpdate?: () => void;
}

interface HighAlertProfile {
  id: string;
  url: string;
  addedAt: string;
  type: 'website' | 'social_media';
  notes?: string;
}

interface SystemStats {
  blockedSites: number;
  waitingList: number;
  highAlertProfiles: number;
  totalAnalyses: number;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, onDataUpdate }) => {
  const [newUrl, setNewUrl] = useState('');
  const [highAlertProfiles, setHighAlertProfiles] = useState<HighAlertProfile[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    blockedSites: 0,
    waitingList: 0,
    highAlertProfiles: 0,
    totalAnalyses: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadHighAlertProfiles();
    loadSystemStats();
  }, []);

  const loadHighAlertProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('high_alert_profiles')
        .select('*')
        .order('added_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(profile => ({
        id: profile.id,
        url: profile.url,
        addedAt: new Date(profile.added_at).toLocaleString(),
        type: profile.site_type as 'website' | 'social_media',
        notes: profile.notes || undefined
      }));

      setHighAlertProfiles(formattedData);
    } catch (error) {
      console.error('Error loading high alert profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load high alert profiles",
        variant: "destructive",
      });
    }
  };

  const loadSystemStats = async () => {
    try {
      const [blockedSitesRes, waitingListRes, highAlertRes, analysisLogsRes] = await Promise.all([
        supabase.from('blocked_sites').select('id', { count: 'exact', head: true }),
        supabase.from('waiting_list').select('id', { count: 'exact', head: true }),
        supabase.from('high_alert_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('analysis_logs').select('id', { count: 'exact', head: true })
      ]);

      setSystemStats({
        blockedSites: blockedSitesRes.count || 0,
        waitingList: waitingListRes.count || 0,
        highAlertProfiles: highAlertRes.count || 0,
        totalAnalyses: analysisLogsRes.count || 0
      });
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const addHighAlertProfile = async () => {
    if (!newUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    try {
      const siteType = newUrl.includes('facebook.com') || newUrl.includes('instagram.com') || 
                      newUrl.includes('twitter.com') || newUrl.includes('tiktok.com') ? 'social_media' : 'website';

      const { data, error } = await supabase
        .from('high_alert_profiles')
        .insert({
          url: newUrl,
          site_type: siteType,
          added_by_admin: true,
          notes: `Added via admin panel on ${new Date().toLocaleString()}`
        })
        .select()
        .single();

      if (error) throw error;

      const newProfile: HighAlertProfile = {
        id: data.id,
        url: newUrl,
        addedAt: new Date().toLocaleString(),
        type: siteType,
        notes: data.notes || undefined
      };

      setHighAlertProfiles(prev => [newProfile, ...prev]);
      setNewUrl('');
      
      toast({
        title: "High Alert Profile Added",
        description: `${siteType === 'social_media' ? 'Social Media' : 'Website'} added to monitoring list`,
      });

      // Update stats
      await loadSystemStats();
      onDataUpdate?.();
    } catch (error) {
      console.error('Error adding high alert profile:', error);
      toast({
        title: "Error",
        description: "Failed to add high alert profile",
        variant: "destructive",
      });
    }
  };

  const removeHighAlertProfile = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('high_alert_profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      setHighAlertProfiles(prev => prev.filter(profile => profile.id !== profileId));
      
      toast({
        title: "Profile Removed",
        description: "High alert profile has been removed from monitoring",
      });

      await loadSystemStats();
      onDataUpdate?.();
    } catch (error) {
      console.error('Error removing high alert profile:', error);
      toast({
        title: "Error",
        description: "Failed to remove high alert profile",
        variant: "destructive",
      });
    }
  };

  const exportData = async (type: 'high_alert' | 'blocked' | 'waiting') => {
    try {
      let data;
      let filename;
      
      if (type === 'high_alert') {
        const { data: profiles, error } = await supabase
          .from('high_alert_profiles')
          .select('*')
          .order('added_at', { ascending: false });
        
        if (error) throw error;
        data = profiles;
        filename = 'irps_high_alert_profiles.json';
      } else if (type === 'blocked') {
        const { data: sites, error } = await supabase
          .from('blocked_sites')
          .select('*')
          .order('blocked_at', { ascending: false });
        
        if (error) throw error;
        data = sites;
        filename = 'irps_blocked_sites.json';
      } else {
        const { data: waiting, error } = await supabase
          .from('waiting_list')
          .select('*')
          .order('added_at', { ascending: false });
        
        if (error) throw error;
        data = waiting;
        filename = 'irps_waiting_list.json';
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: `${type.replace('_', ' ')} profiles exported successfully`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
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
        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-red-900/20 border-red-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-200 text-sm">Blocked Sites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{systemStats.blockedSites}</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-900/20 border-yellow-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-200 text-sm">Waiting List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{systemStats.waitingList}</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-900/20 border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-200 text-sm">High Alert Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{systemStats.highAlertProfiles}</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-900/20 border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-200 text-sm">Total Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{systemStats.totalAnalyses}</div>
            </CardContent>
          </Card>
        </div>

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
                ⚠️ High alert profiles are monitored with maximum priority and saved to secure database
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
                {highAlertProfiles.map((profile) => (
                  <div key={profile.id} className="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-white font-medium break-all">{profile.url}</p>
                        <p className="text-sm text-gray-400">Added: {profile.addedAt}</p>
                        {profile.notes && (
                          <p className="text-xs text-gray-500 mt-1">{profile.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge 
                          variant="destructive" 
                        >
                          {profile.type === 'social_media' ? '📱 Social Media' : '🌐 Website'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeHighAlertProfile(profile.id)}
                          className="border-red-500/30 text-red-400 hover:bg-red-900/30"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
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
              <h4 className="text-purple-300 font-semibold mb-2">📊 Live System Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">High Alert Profiles:</span>
                  <span className="text-white ml-2 font-bold">{systemStats.highAlertProfiles}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total Blocked:</span>
                  <span className="text-red-400 ml-2 font-bold">{systemStats.blockedSites}</span>
                </div>
                <div>
                  <span className="text-gray-400">Awaiting Review:</span>
                  <span className="text-yellow-400 ml-2 font-bold">{systemStats.waitingList}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total Analyses:</span>
                  <span className="text-blue-400 ml-2 font-bold">{systemStats.totalAnalyses}</span>
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
