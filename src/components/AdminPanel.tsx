import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, AlertTriangle, Shield, Plus, FileText, Trash2, Edit, Save, X, Mail, MessageSquare, BookOpen, Megaphone } from 'lucide-react';
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

interface Update {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  published: boolean;
  created_at: string;
}

interface LearningContent {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url?: string;
  updated_at: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read_status: boolean;
  created_at: string;
}

interface SystemStats {
  blockedSites: number;
  waitingList: number;
  highAlertProfiles: number;
  totalAnalyses: number;
  contactMessages: number;
  updates: number;
  learningContent: number;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, onDataUpdate }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newUrl, setNewUrl] = useState('');
  const [highAlertProfiles, setHighAlertProfiles] = useState<HighAlertProfile[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [learningContent, setLearningContent] = useState<LearningContent[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    blockedSites: 0,
    waitingList: 0,
    highAlertProfiles: 0,
    totalAnalyses: 0,
    contactMessages: 0,
    updates: 0,
    learningContent: 0
  });
  
  // Form states for updates
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    content: '',
    image_url: '',
    published: true
  });
  const [editingUpdate, setEditingUpdate] = useState<string | null>(null);
  
  // Form states for learning content
  const [newLearning, setNewLearning] = useState({
    title: '',
    description: '',
    content: '',
    image_url: ''
  });
  const [editingLearning, setEditingLearning] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadHighAlertProfiles(),
      loadSystemStats(),
      loadUpdates(),
      loadLearningContent(),
      loadContactMessages()
    ]);
  };

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
      const [blockedSitesRes, waitingListRes, highAlertRes, analysisLogsRes, contactMessagesRes, updatesRes, learningRes] = await Promise.all([
        supabase.from('blocked_sites').select('id', { count: 'exact', head: true }),
        supabase.from('waiting_list').select('id', { count: 'exact', head: true }),
        supabase.from('high_alert_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('analysis_logs').select('id', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
        supabase.from('updates').select('id', { count: 'exact', head: true }),
        supabase.from('learning_content').select('id', { count: 'exact', head: true })
      ]);

      setSystemStats({
        blockedSites: blockedSitesRes.count || 0,
        waitingList: waitingListRes.count || 0,
        highAlertProfiles: highAlertRes.count || 0,
        totalAnalyses: analysisLogsRes.count || 0,
        contactMessages: contactMessagesRes.count || 0,
        updates: updatesRes.count || 0,
        learningContent: learningRes.count || 0
      });
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const loadUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error loading updates:', error);
      toast({
        title: "Error",
        description: "Failed to load updates",
        variant: "destructive",
      });
    }
  };

  const loadLearningContent = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_content')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setLearningContent(data || []);
    } catch (error) {
      console.error('Error loading learning content:', error);
      toast({
        title: "Error",
        description: "Failed to load learning content",
        variant: "destructive",
      });
    }
  };

  const loadContactMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContactMessages(data || []);
    } catch (error) {
      console.error('Error loading contact messages:', error);
      toast({
        title: "Error",
        description: "Failed to load contact messages",
        variant: "destructive",
      });
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

  const createUpdate = async () => {
    if (!newUpdate.title.trim() || !newUpdate.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('updates')
        .insert({
          title: newUpdate.title,
          content: newUpdate.content,
          image_url: newUpdate.image_url || null,
          published: newUpdate.published
        });

      if (error) throw error;

      toast({
        title: "Update Created",
        description: "System update has been created successfully",
      });

      setNewUpdate({ title: '', content: '', image_url: '', published: true });
      await loadUpdates();
      await loadSystemStats();
      onDataUpdate?.();
    } catch (error) {
      console.error('Error creating update:', error);
      toast({
        title: "Error",
        description: "Failed to create update",
        variant: "destructive",
      });
    }
  };

  const updateUpdate = async (id: string, updateData: Partial<Update>) => {
    try {
      const { error } = await supabase
        .from('updates')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Update Modified",
        description: "System update has been updated successfully",
      });

      setEditingUpdate(null);
      await loadUpdates();
      onDataUpdate?.();
    } catch (error) {
      console.error('Error updating update:', error);
      toast({
        title: "Error",
        description: "Failed to update update",
        variant: "destructive",
      });
    }
  };

  const deleteUpdate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('updates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Update Deleted",
        description: "System update has been deleted",
      });

      await loadUpdates();
      await loadSystemStats();
      onDataUpdate?.();
    } catch (error) {
      console.error('Error deleting update:', error);
      toast({
        title: "Error",
        description: "Failed to delete update",
        variant: "destructive",
      });
    }
  };

  const createLearningContent = async () => {
    if (!newLearning.title.trim() || !newLearning.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('learning_content')
        .insert({
          title: newLearning.title,
          description: newLearning.description,
          content: newLearning.content,
          image_url: newLearning.image_url || null
        });

      if (error) throw error;

      toast({
        title: "Learning Content Created",
        description: "New learning content has been added successfully",
      });

      setNewLearning({ title: '', description: '', content: '', image_url: '' });
      await loadLearningContent();
      await loadSystemStats();
      onDataUpdate?.();
    } catch (error) {
      console.error('Error creating learning content:', error);
      toast({
        title: "Error",
        description: "Failed to create learning content",
        variant: "destructive",
      });
    }
  };

  const updateLearningContent = async (id: string, contentData: Partial<LearningContent>) => {
    try {
      const { error } = await supabase
        .from('learning_content')
        .update(contentData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Learning Content Updated",
        description: "Learning content has been updated successfully",
      });

      setEditingLearning(null);
      await loadLearningContent();
      onDataUpdate?.();
    } catch (error) {
      console.error('Error updating learning content:', error);
      toast({
        title: "Error",
        description: "Failed to update learning content",
        variant: "destructive",
      });
    }
  };

  const deleteLearningContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('learning_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Learning Content Deleted",
        description: "Learning content has been deleted",
      });

      await loadLearningContent();
      await loadSystemStats();
      onDataUpdate?.();
    } catch (error) {
      console.error('Error deleting learning content:', error);
      toast({
        title: "Error",
        description: "Failed to delete learning content",
        variant: "destructive",
      });
    }
  };

  const markMessageAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read_status: true })
        .eq('id', id);

      if (error) throw error;

      await loadContactMessages();
      await loadSystemStats();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Message Deleted",
        description: "Contact message has been deleted",
      });

      await loadContactMessages();
      await loadSystemStats();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const TabButton = ({ tabId, icon: Icon, label, count }: { tabId: string; icon: any; label: string; count?: number }) => (
    <Button
      onClick={() => setActiveTab(tabId)}
      variant={activeTab === tabId ? "default" : "outline"}
      className={`flex items-center gap-2 ${
        activeTab === tabId 
          ? "bg-red-600 text-white" 
          : "border-gray-600 text-gray-300 hover:bg-gray-800"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {count !== undefined && (
        <Badge variant={activeTab === tabId ? "secondary" : "outline"} className="ml-1">
          {count}
        </Badge>
      )}
    </Button>
  );

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
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <TabButton tabId="dashboard" icon={Shield} label="Dashboard" />
          <TabButton tabId="alerts" icon={AlertTriangle} label="High Alerts" count={systemStats.highAlertProfiles} />
          <TabButton tabId="updates" icon={Megaphone} label="Updates" count={systemStats.updates} />
          <TabButton tabId="learning" icon={BookOpen} label="Learning AI" count={systemStats.learningContent} />
          <TabButton tabId="messages" icon={Mail} label="Messages" count={systemStats.contactMessages} />
          <TabButton tabId="data" icon={FileText} label="Data Export" />
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-green-900/20 border-green-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-200 text-sm">Contact Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{systemStats.contactMessages}</div>
                </CardContent>
              </Card>
              <Card className="bg-orange-900/20 border-orange-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-orange-200 text-sm">System Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-400">{systemStats.updates}</div>
                </CardContent>
              </Card>
              <Card className="bg-indigo-900/20 border-indigo-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-indigo-200 text-sm">Learning Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-400">{systemStats.learningContent}</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* High Alerts Tab */}
        {activeTab === 'alerts' && (
          <>
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
            <Card className="bg-black/40 border-red-500/30">
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
                            <Badge variant="destructive">
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
          </>
        )}

        {/* Updates Tab */}
        {activeTab === 'updates' && (
          <>
            {/* Create New Update */}
            <Card className="mb-8 bg-orange-900/20 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <Plus className="h-6 w-6" />
                  Create New System Update
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="Update title..."
                    value={newUpdate.title}
                    onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                    className="bg-black/40 border-orange-500/30 text-white placeholder:text-gray-400"
                  />
                  <Textarea
                    placeholder="Update content..."
                    value={newUpdate.content}
                    onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
                    className="bg-black/40 border-orange-500/30 text-white placeholder:text-gray-400 min-h-[100px]"
                  />
                  <Input
                    placeholder="Image URL (optional)..."
                    value={newUpdate.image_url}
                    onChange={(e) => setNewUpdate({ ...newUpdate, image_url: e.target.value })}
                    className="bg-black/40 border-orange-500/30 text-white placeholder:text-gray-400"
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-white">
                      <input
                        type="checkbox"
                        checked={newUpdate.published}
                        onChange={(e) => setNewUpdate({ ...newUpdate, published: e.target.checked })}
                        className="rounded"
                      />
                      Publish immediately
                    </label>
                    <Button
                      onClick={createUpdate}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Update
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Updates List */}
            <Card className="bg-black/40 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  System Updates ({updates.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div key={update.id} className="bg-orange-900/20 p-4 rounded-lg border border-orange-500/20">
                      {editingUpdate === update.id ? (
                        <div className="space-y-3">
                          <Input
                            value={update.title}
                            onChange={(e) => setUpdates(prev => prev.map(u => u.id === update.id ? { ...u, title: e.target.value } : u))}
                            className="bg-black/40 border-orange-500/30 text-white"
                          />
                          <Textarea
                            value={update.content}
                            onChange={(e) => setUpdates(prev => prev.map(u => u.id === update.id ? { ...u, content: e.target.value } : u))}
                            className="bg-black/40 border-orange-500/30 text-white min-h-[100px]"
                          />
                          <Input
                            value={update.image_url || ''}
                            onChange={(e) => setUpdates(prev => prev.map(u => u.id === update.id ? { ...u, image_url: e.target.value } : u))}
                            placeholder="Image URL (optional)..."
                            className="bg-black/40 border-orange-500/30 text-white"
                          />
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 text-white">
                              <input
                                type="checkbox"
                                checked={update.published}
                                onChange={(e) => setUpdates(prev => prev.map(u => u.id === update.id ? { ...u, published: e.target.checked } : u))}
                                className="rounded"
                              />
                              Published
                            </label>
                            <div className="flex gap-2 ml-auto">
                              <Button
                                size="sm"
                                onClick={() => updateUpdate(update.id, updates.find(u => u.id === update.id)!)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingUpdate(null)}
                                className="border-gray-600 text-gray-300"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="text-white font-semibold">{update.title}</h4>
                              <p className="text-gray-300 text-sm mt-1">{update.content}</p>
                              {update.image_url && (
                                <p className="text-xs text-gray-500 mt-1">Image: {update.image_url}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <Badge variant={update.published ? "default" : "outline"}>
                                {update.published ? "Published" : "Draft"}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingUpdate(update.id)}
                                className="border-orange-500/30 text-orange-400"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteUpdate(update.id)}
                                className="border-red-500/30 text-red-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Created: {new Date(update.created_at).toLocaleString()}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Learning AI Tab */}
        {activeTab === 'learning' && (
          <>
            {/* Create New Learning Content */}
            <Card className="mb-8 bg-indigo-900/20 border-indigo-500/30">
              <CardHeader>
                <CardTitle className="text-indigo-400 flex items-center gap-2">
                  <Plus className="h-6 w-6" />
                  Create New Learning Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="Content title..."
                    value={newLearning.title}
                    onChange={(e) => setNewLearning({ ...newLearning, title: e.target.value })}
                    className="bg-black/40 border-indigo-500/30 text-white placeholder:text-gray-400"
                  />
                  <Input
                    placeholder="Description..."
                    value={newLearning.description}
                    onChange={(e) => setNewLearning({ ...newLearning, description: e.target.value })}
                    className="bg-black/40 border-indigo-500/30 text-white placeholder:text-gray-400"
                  />
                  <Textarea
                    placeholder="Learning content..."
                    value={newLearning.content}
                    onChange={(e) => setNewLearning({ ...newLearning, content: e.target.value })}
                    className="bg-black/40 border-indigo-500/30 text-white placeholder:text-gray-400 min-h-[120px]"
                  />
                  <Input
                    placeholder="Image URL (optional)..."
                    value={newLearning.image_url}
                    onChange={(e) => setNewLearning({ ...newLearning, image_url: e.target.value })}
                    className="bg-black/40 border-indigo-500/30 text-white placeholder:text-gray-400"
                  />
                  <Button
                    onClick={createLearningContent}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Learning Content
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Learning Content List */}
            <Card className="bg-black/40 border-indigo-500/30">
              <CardHeader>
                <CardTitle className="text-indigo-400 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Learning AI Content ({learningContent.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningContent.map((content) => (
                    <div key={content.id} className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/20">
                      {editingLearning === content.id ? (
                        <div className="space-y-3">
                          <Input
                            value={content.title}
                            onChange={(e) => setLearningContent(prev => prev.map(c => c.id === content.id ? { ...c, title: e.target.value } : c))}
                            className="bg-black/40 border-indigo-500/30 text-white"
                          />
                          <Input
                            value={content.description}
                            onChange={(e) => setLearningContent(prev => prev.map(c => c.id === content.id ? { ...c, description: e.target.value } : c))}
                            className="bg-black/40 border-indigo-500/30 text-white"
                          />
                          <Textarea
                            value={content.content}
                            onChange={(e) => setLearningContent(prev => prev.map(c => c.id === content.id ? { ...c, content: e.target.value } : c))}
                            className="bg-black/40 border-indigo-500/30 text-white min-h-[120px]"
                          />
                          <Input
                            value={content.image_url || ''}
                            onChange={(e) => setLearningContent(prev => prev.map(c => c.id === content.id ? { ...c, image_url: e.target.value } : c))}
                            placeholder="Image URL (optional)..."
                            className="bg-black/40 border-indigo-500/30 text-white"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateLearningContent(content.id, learningContent.find(c => c.id === content.id)!)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingLearning(null)}
                              className="border-gray-600 text-gray-300"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="text-white font-semibold">{content.title}</h4>
                              <p className="text-indigo-300 text-sm">{content.description}</p>
                              <p className="text-gray-300 text-sm mt-1">{content.content.substring(0, 150)}...</p>
                              {content.image_url && (
                                <p className="text-xs text-gray-500 mt-1">Image: {content.image_url}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingLearning(content.id)}
                                className="border-indigo-500/30 text-indigo-400"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteLearningContent(content.id)}
                                className="border-red-500/30 text-red-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Updated: {new Date(content.updated_at).toLocaleString()}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <Card className="bg-black/40 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact Messages ({contactMessages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contactMessages.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No contact messages yet</p>
                ) : (
                  contactMessages.map((message) => (
                    <div key={message.id} className={`p-4 rounded-lg border ${
                      message.read_status 
                        ? 'bg-gray-900/20 border-gray-500/20' 
                        : 'bg-green-900/20 border-green-500/20'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-semibold">{message.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {message.email}
                            </Badge>
                            {!message.read_status && (
                              <Badge className="bg-green-600 text-xs">NEW</Badge>
                            )}
                          </div>
                          <h5 className="text-green-300 font-medium">{message.subject}</h5>
                          <p className="text-gray-300 text-sm mt-2">{message.message}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {!message.read_status && (
                            <Button
                              size="sm"
                              onClick={() => markMessageAsRead(message.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Mark Read
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMessage(message.id)}
                            className="border-red-500/30 text-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Received: {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Export Tab */}
        {activeTab === 'data' && (
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
                  <div>
                    <span className="text-gray-400">Contact Messages:</span>
                    <span className="text-green-400 ml-2 font-bold">{systemStats.contactMessages}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">System Updates:</span>
                    <span className="text-orange-400 ml-2 font-bold">{systemStats.updates}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
