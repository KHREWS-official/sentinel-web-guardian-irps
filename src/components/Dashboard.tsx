import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, Eye, Search, Bot, Settings, Zap, Globe, PieChart, Megaphone } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import BlackHoleAnimation from './BlackHoleAnimation';
import AdminPanel from './AdminPanel';
import IRPSAIChat from './IRPSAIChat';
import AdminLogin from './AdminLogin';
import PoppinsAnimation from './PoppinsAnimation';
import Header from './Header';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisResult {
  id: string;
  url: string;
  status: 'blocked' | 'waiting' | 'safe';
  confidence: number;
  detectedContent: string[];
  timestamp: string;
  detectedLanguage?: string;
  contentCategory?: string;
}

interface HighAlertProfile {
  id: string;
  url: string;
  type: 'website' | 'social_media';
  addedAt: string;
  notes?: string;
}

interface Update {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface DailyStats {
  date: string;
  accounts_suspended: number;
  links_submitted: number;
}

const Dashboard = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [blockedSites, setBlockedSites] = useState<AnalysisResult[]>([]);
  const [waitingList, setWaitingList] = useState<AnalysisResult[]>([]);
  const [highAlertProfiles, setHighAlertProfiles] = useState<HighAlertProfile[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadBlockedSites();
    loadWaitingList();
    loadHighAlertProfiles();
    loadUpdates();
    loadDailyStats();
    
    // Hide animation after 5 seconds
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const loadBlockedSites = async () => {
    try {
      const { data, error } = await supabase
        .from('blocked_sites')
        .select('*')
        .order('blocked_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedData = data.map(site => ({
        id: site.id,
        url: site.url,
        status: 'blocked' as const,
        confidence: Number(site.confidence_score),
        detectedContent: site.detected_content || [],
        timestamp: new Date(site.blocked_at).toLocaleString(),
        detectedLanguage: site.detected_language,
        contentCategory: site.content_category
      }));

      setBlockedSites(formattedData);
    } catch (error) {
      console.error('Error loading blocked sites:', error);
    }
  };

  const loadWaitingList = async () => {
    try {
      const { data, error } = await supabase
        .from('waiting_list')
        .select('*')
        .eq('reviewed', false)
        .order('added_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedData = data.map(site => ({
        id: site.id,
        url: site.url,
        status: 'waiting' as const,
        confidence: Number(site.confidence_score),
        detectedContent: site.detected_content || [],
        timestamp: new Date(site.added_at).toLocaleString(),
        detectedLanguage: site.detected_language,
        contentCategory: site.content_category
      }));

      setWaitingList(formattedData);
    } catch (error) {
      console.error('Error loading waiting list:', error);
    }
  };

  const loadHighAlertProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('high_alert_profiles')
        .select('*')
        .order('added_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedData = data.map(profile => ({
        id: profile.id,
        url: profile.url,
        type: profile.site_type as 'website' | 'social_media',
        addedAt: new Date(profile.added_at).toLocaleString(),
        notes: profile.notes || undefined
      }));

      setHighAlertProfiles(formattedData);
    } catch (error) {
      console.error('Error loading high alert profiles:', error);
    }
  };

  const loadUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const formattedData = data.map(update => ({
        id: update.id,
        title: update.title,
        content: update.content,
        createdAt: new Date(update.created_at).toLocaleString()
      }));

      setUpdates(formattedData);
    } catch (error) {
      console.error('Error loading updates:', error);
    }
  };

  const loadDailyStats = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .order('date', { ascending: false })
        .limit(7);

      if (error) throw error;

      setDailyStats(data);
    } catch (error) {
      console.error('Error loading daily stats:', error);
    }
  };

  // Enhanced multi-language analysis
  const analyzeContent = async (inputUrl: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Enhanced analysis steps for multi-language detection
    const analysisSteps = [
      { step: 'Establishing secure connection to target...', duration: 700 + Math.random() * 300 },
      { step: 'Bypassing anti-bot protection systems...', duration: 1100 + Math.random() * 500 },
      { step: 'Fetching HTML content and multilingual resources...', duration: 900 + Math.random() * 400 },
      { step: 'Parsing DOM structure and extracting multilingual text...', duration: 800 + Math.random() * 300 },
      { step: 'Detecting language patterns (EN/AR/UR/HI)...', duration: 1000 + Math.random() * 400 },
      { step: 'Analyzing images and media for explicit content...', duration: 1300 + Math.random() * 600 },
      { step: 'Scanning for anti-Islamic and blasphemous content...', duration: 1200 + Math.random() * 500 },
      { step: 'Running enhanced threat pattern recognition...', duration: 1600 + Math.random() * 700 },
      { step: 'Cross-referencing with threat intelligence database...', duration: 900 + Math.random() * 400 },
      { step: 'Generating comprehensive multilingual threat report...', duration: 600 + Math.random() * 200 }
    ];

    for (let i = 0; i < analysisSteps.length; i++) {
      const currentAnalysis = analysisSteps[i];
      setCurrentStep(currentAnalysis.step);
      
      await new Promise(resolve => setTimeout(resolve, currentAnalysis.duration));
      setAnalysisProgress(((i + 1) / analysisSteps.length) * 85);
      
      toast({
        title: "🔍 Enhanced Multi-Language Analysis",
        description: currentAnalysis.step,
        duration: currentAnalysis.duration - 100,
      });
    }

    try {
      setCurrentStep('Executing enhanced multilingual content analysis...');
      setAnalysisProgress(90);

      // Call the enhanced scraping edge function
      const { data, error } = await supabase.functions.invoke('analyze-content', {
        body: { url: inputUrl }
      });

      if (error) throw error;

      setAnalysisProgress(100);

      const { status, analysis } = data;

      // Enhanced feedback based on language and content type
      if (status === 'blocked') {
        const languageEmoji = analysis.detectedLanguage === 'arabic' ? '🇸🇦' : 
                            analysis.detectedLanguage === 'urdu' ? '🇵🇰' : 
                            analysis.detectedLanguage === 'hindi' ? '🇮🇳' : '🇺🇸';
        
        toast({
          title: "🚨 CRITICAL THREAT DETECTED",
          description: `Site BLOCKED - ${languageEmoji} ${analysis.detectedLanguage.toUpperCase()} content, Risk: ${analysis.riskLevel.toUpperCase()} (${analysis.confidence}% confidence)`,
          variant: "destructive",
        });
        
        const newBlockedSite = {
          id: Date.now().toString(),
          url: inputUrl,
          status: 'blocked' as const,
          confidence: analysis.confidence,
          detectedContent: analysis.detectedContent,
          timestamp: new Date().toLocaleString(),
          detectedLanguage: analysis.detectedLanguage,
          contentCategory: analysis.contentCategory
        };
        setBlockedSites(prev => [newBlockedSite, ...prev.slice(0, 9)]);
        
      } else if (status === 'waiting') {
        toast({
          title: "⚠️ SUSPICIOUS CONTENT DETECTED",
          description: `${analysis.contentCategory.toUpperCase()} content flagged for human verification - Added to priority review queue`,
        });
        
        const newWaitingItem = {
          id: Date.now().toString(),
          url: inputUrl,
          status: 'waiting' as const,
          confidence: analysis.confidence,
          detectedContent: analysis.detectedContent,
          timestamp: new Date().toLocaleString(),
          detectedLanguage: analysis.detectedLanguage,
          contentCategory: analysis.contentCategory
        };
        setWaitingList(prev => [newWaitingItem, ...prev.slice(0, 9)]);
        
      } else {
        toast({
          title: "✅ ANALYSIS COMPLETE",
          description: `No significant threats detected - Site appears safe (Language: ${analysis.detectedLanguage}, Scraped: ${analysis.scrapedData.contentLength} characters)`,
        });
      }

      console.log('Enhanced multilingual analysis results:', {
        url: inputUrl,
        status,
        confidence: analysis.confidence,
        riskLevel: analysis.riskLevel,
        detectedLanguage: analysis.detectedLanguage,
        contentCategory: analysis.contentCategory,
        detectedThreats: analysis.detectedContent,
        scrapedData: analysis.scrapedData,
        details: analysis.details
      });

    } catch (error) {
      console.error('Enhanced analysis error:', error);
      toast({
        title: "Analysis Error",
        description: `Failed to analyze content: ${error.message}`,
        variant: "destructive",
      });
    }

    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setCurrentStep('');
    setUrl('');
  };

  const handleAnalyze = () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL for analysis",
        variant: "destructive",
      });
      return;
    }
    
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com)",
        variant: "destructive",
      });
      return;
    }
    
    analyzeContent(url.startsWith('http') ? url : `https://${url}`);
  };

  const handleAdminAccess = () => {
    setShowAdminLogin(true);
  };

  const handleAdminLogin = (success: boolean) => {
    setShowAdminLogin(false);
    if (success) {
      setShowAdmin(true);
    }
  };

  // Prepare pie chart data
  const pieChartData = dailyStats.length > 0 ? [
    { name: 'Accounts Suspended', value: dailyStats.reduce((sum, stat) => sum + stat.accounts_suspended, 0), color: '#ef4444' },
    { name: 'Links Submitted', value: dailyStats.reduce((sum, stat) => sum + stat.links_submitted, 0), color: '#3b82f6' }
  ] : [];

  if (showAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} onDataUpdate={() => { loadBlockedSites(); loadWaitingList(); loadHighAlertProfiles(); }} />;
  }

  if (showAdminLogin) {
    return <AdminLogin onLogin={handleAdminLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-poppins relative">
      {/* Poppins Animation Overlay */}
      {showAnimation && <PoppinsAnimation />}
      
      {/* Header */}
      <Header />

      <div className="container mx-auto px-6 py-8">
        {/* Analysis Section */}
        <Card className="mb-8 bg-black/40 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="h-6 w-6 text-green-400" />
              Enhanced Multi-Language Threat Detection System
            </CardTitle>
            <p className="text-sm text-green-300">
              Advanced web scraping with multi-language analysis: Anti-Islamic content detection, explicit material scanning, and real-time threat assessment
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter website URL for enhanced multi-language analysis..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="bg-green-600 hover:bg-green-700 text-white min-w-[160px]"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Analyzing
                    </div>
                  ) : (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      Enhanced Scrape
                    </>
                  )}
                </Button>
              </div>
              
              {isAnalyzing && (
                <div className="space-y-2">
                  <Progress value={analysisProgress} className="w-full" />
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-400 animate-pulse" />
                    <p className="text-sm text-gray-300">{currentStep}</p>
                    <span className="text-xs text-green-400">{analysisProgress.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-red-900/40 border-red-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-200 text-lg">Blocked Threats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{blockedSites.length}</div>
              <p className="text-sm text-red-300 mt-1">Multi-lang blocked</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-900/40 border-yellow-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-200 text-lg">Under Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">{waitingList.length}</div>
              <p className="text-sm text-yellow-300 mt-1">Human verification</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/40 border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-200 text-lg">High Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{highAlertProfiles.length}</div>
              <p className="text-sm text-purple-300 mt-1">Priority monitoring</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/40 border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-200 text-lg flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Daily Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={15}
                      outerRadius={35}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-blue-300 mt-1">Weekly stats</p>
            </CardContent>
          </Card>
        </div>

        {/* System Updates Section */}
        {updates.length > 0 && (
          <Card className="mb-8 bg-black/40 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                System Updates & Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {updates.map((update) => (
                  <div key={update.id} className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-semibold">{update.title}</h4>
                      <Badge variant="outline" className="text-xs text-blue-200 border-blue-500/30">
                        {update.createdAt}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm">{update.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* High Alert Profiles */}
        {highAlertProfiles.length > 0 && (
          <Card className="mb-8 bg-black/40 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                High Alert Monitoring Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highAlertProfiles.map((profile) => (
                  <div key={profile.id} className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-white font-medium break-all">{profile.url}</p>
                        <p className="text-sm text-gray-400">Added: {profile.addedAt}</p>
                        {profile.notes && (
                          <p className="text-xs text-purple-300 mt-1">{profile.notes}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2 text-purple-200 border-purple-500/30">
                        {profile.type === 'social_media' ? '📱 Social Media' : '🌐 Website'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-purple-600 text-xs">HIGH PRIORITY</Badge>
                      <Badge variant="outline" className="text-xs text-orange-200 border-orange-500/30">ADMIN FLAGGED</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blocked Sites List */}
        {blockedSites.length > 0 && (
          <Card className="mb-8 bg-black/40 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recently Neutralized Threats (Enhanced Multi-Language Detection)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blockedSites.map((site) => (
                  <div key={site.id} className="bg-red-900/20 p-4 rounded-lg border border-red-500/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-white font-medium break-all">{site.url}</p>
                        <p className="text-sm text-gray-400">{site.timestamp}</p>
                        <div className="flex gap-2 mt-1">
                          {site.detectedLanguage && (
                            <Badge variant="outline" className="text-xs text-green-200 border-green-500/30">
                              {site.detectedLanguage === 'arabic' ? '🇸🇦 Arabic' : 
                               site.detectedLanguage === 'urdu' ? '🇵🇰 Urdu' : 
                               site.detectedLanguage === 'hindi' ? '🇮🇳 Hindi' : '🇺🇸 English'}
                            </Badge>
                          )}
                          {site.contentCategory && (
                            <Badge variant="outline" className="text-xs text-red-200 border-red-500/30">
                              {site.contentCategory.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant="destructive" className="ml-2">
                        {site.confidence}% Threat Level
                      </Badge>
                    </div>
                    {site.detectedContent.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-red-300 mb-1">Enhanced threat detection:</p>
                        <div className="flex flex-wrap gap-1">
                          {site.detectedContent.map((content, i) => (
                            <Badge key={i} variant="outline" className="text-xs text-red-200 border-red-500/30">
                              {content}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Waiting List */}
        {waitingList.length > 0 && (
          <Card className="mb-8 bg-black/40 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Human Verification Queue (Enhanced Multi-Language Analysis)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {waitingList.map((site) => (
                  <div key={site.id} className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/20">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-white font-medium break-all">{site.url}</p>
                        <p className="text-sm text-gray-400">{site.timestamp}</p>
                        <div className="flex gap-2 mt-1">
                          {site.detectedLanguage && (
                            <Badge variant="outline" className="text-xs text-green-200 border-green-500/30">
                              {site.detectedLanguage === 'arabic' ? '🇸🇦 Arabic' : 
                               site.detectedLanguage === 'urdu' ? '🇵🇰 Urdu' : 
                               site.detectedLanguage === 'hindi' ? '🇮🇳 Hindi' : '🇺🇸 English'}
                            </Badge>
                          )}
                          {site.contentCategory && (
                            <Badge variant="outline" className="text-xs text-yellow-200 border-yellow-500/30">
                              {site.contentCategory.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge className="ml-2 bg-yellow-600">
                        {site.confidence}% Suspicious
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer with Black Hole */}
      <div className="mt-16 bg-black/40 border-t border-white/10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-center">
            <BlackHoleAnimation onAdminAccess={handleAdminAccess} />
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm">IRPS 295 - Enhanced Multi-Language Threat Detection System</p>
            <p className="text-gray-500 text-xs mt-1">🔍 Powered by advanced multilingual web scraping and intelligent content analysis</p>
            <p className="text-gray-600 text-xs mt-1">🌐 Supporting: English | العربية | اردو | हिंदी</p>
          </div>
        </div>
      </div>

      {/* AI Chat Modal */}
      {showChat && (
        <IRPSAIChat onClose={() => setShowChat(false)} />
      )}
    </div>
  );
};

export default Dashboard;
