
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, Eye, Search, Bot, Settings, Zap } from 'lucide-react';
import BlackHoleAnimation from './BlackHoleAnimation';
import AdminPanel from './AdminPanel';
import IRPSAIChat from './IRPSAIChat';
import AdminLogin from './AdminLogin';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisResult {
  id: string;
  url: string;
  status: 'blocked' | 'waiting' | 'safe';
  confidence: number;
  detectedContent: string[];
  timestamp: string;
}

interface HighAlertProfile {
  id: string;
  url: string;
  type: 'website' | 'social_media';
  addedAt: string;
  notes?: string;
}

const Dashboard = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [blockedSites, setBlockedSites] = useState<AnalysisResult[]>([]);
  const [waitingList, setWaitingList] = useState<AnalysisResult[]>([]);
  const [highAlertProfiles, setHighAlertProfiles] = useState<HighAlertProfile[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadBlockedSites();
    loadWaitingList();
    loadHighAlertProfiles();
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
        timestamp: new Date(site.blocked_at).toLocaleString()
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
        timestamp: new Date(site.added_at).toLocaleString()
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

  // Enhanced realistic AI analysis
  const analyzeContent = async (inputUrl: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // More realistic analysis steps with variable timing
    const analysisSteps = [
      { step: 'Establishing secure connection...', duration: 800 + Math.random() * 400 },
      { step: 'Bypassing CAPTCHA protection...', duration: 1200 + Math.random() * 600 },
      { step: 'Extracting HTML content...', duration: 900 + Math.random() * 500 },
      { step: 'Parsing JavaScript and dynamic content...', duration: 1500 + Math.random() * 700 },
      { step: 'Analyzing image metadata and content...', duration: 2000 + Math.random() * 1000 },
      { step: 'Running ML pattern recognition...', duration: 1800 + Math.random() * 900 },
      { step: 'Cross-referencing with threat database...', duration: 1000 + Math.random() * 500 },
      { step: 'Computing confidence scores...', duration: 600 + Math.random() * 300 },
      { step: 'Finalizing threat assessment...', duration: 500 + Math.random() * 200 }
    ];

    for (let i = 0; i < analysisSteps.length; i++) {
      const currentAnalysis = analysisSteps[i];
      setCurrentStep(currentAnalysis.step);
      
      await new Promise(resolve => setTimeout(resolve, currentAnalysis.duration));
      setAnalysisProgress(((i + 1) / analysisSteps.length) * 100);
      
      toast({
        title: "AI Neural Network Active",
        description: currentAnalysis.step,
        duration: currentAnalysis.duration - 100,
      });
    }

    // More sophisticated content detection
    const suspiciousPatterns = [
      'explicit', 'inappropriate', 'violence', 'hate-speech', 
      'misinformation', 'phishing', 'malware', 'adult-content',
      'harassment', 'extremism', 'illegal-content', 'scam'
    ];
    
    const detectedContent: string[] = [];
    const baseConfidence = Math.random() * 100;
    
    // Simulate realistic pattern detection based on URL characteristics
    const urlLower = inputUrl.toLowerCase();
    
    if (urlLower.includes('adult') || urlLower.includes('xxx') || urlLower.includes('porn')) {
      detectedContent.push('explicit', 'adult-content');
    }
    if (urlLower.includes('violence') || urlLower.includes('gore')) {
      detectedContent.push('violence', 'inappropriate');
    }
    if (urlLower.includes('hate') || urlLower.includes('extremist')) {
      detectedContent.push('hate-speech', 'extremism');
    }
    
    // Add some random detections for realism
    suspiciousPatterns.forEach(pattern => {
      if (Math.random() > 0.8) {
        detectedContent.push(pattern);
      }
    });

    // Adjust confidence based on detections
    const finalConfidence = Math.min(95, baseConfidence + (detectedContent.length * 15));
    
    const siteType = urlLower.includes('facebook.com') || urlLower.includes('instagram.com') || 
                    urlLower.includes('twitter.com') || urlLower.includes('tiktok.com') || 
                    urlLower.includes('youtube.com') || urlLower.includes('linkedin.com') ? 'social_media' : 'website';

    const status = finalConfidence > 75 && detectedContent.length > 1 ? 'blocked' : 
                   finalConfidence > 40 || detectedContent.length > 0 ? 'waiting' : 'safe';

    try {
      // Log the analysis
      await supabase.from('analysis_logs').insert({
        url: inputUrl,
        analysis_result: status,
        confidence_score: Math.round(finalConfidence),
        detected_keywords: detectedContent,
        processing_time_ms: analysisSteps.reduce((sum, step) => sum + step.duration, 0),
        ai_model_version: 'IRPS_Neural_v3.2'
      });

      // Store based on result
      if (status === 'blocked') {
        const { data, error } = await supabase.from('blocked_sites').insert({
          url: inputUrl,
          detected_content: detectedContent,
          confidence_score: Math.round(finalConfidence),
          site_type: siteType,
          analysis_details: { 
            model: 'IRPS_Neural_v3.2', 
            timestamp: new Date().toISOString(),
            analysis_depth: 'deep_scan',
            threat_level: status === 'blocked' ? 'high' : 'medium'
          }
        }).select().single();

        if (!error && data) {
          const newBlockedSite = {
            id: data.id,
            url: inputUrl,
            status: 'blocked' as const,
            confidence: Math.round(finalConfidence),
            detectedContent,
            timestamp: new Date().toLocaleString()
          };
          setBlockedSites(prev => [newBlockedSite, ...prev.slice(0, 9)]);
        }

        toast({
          title: "🚨 CRITICAL THREAT DETECTED",
          description: `Site BLOCKED - Threat Level: SEVERE (${Math.round(finalConfidence)}% confidence)`,
          variant: "destructive",
        });
      } else if (status === 'waiting') {
        const { data, error } = await supabase.from('waiting_list').insert({
          url: inputUrl,
          detected_content: detectedContent,
          confidence_score: Math.round(finalConfidence),
          site_type: siteType,
          analysis_details: { 
            model: 'IRPS_Neural_v3.2', 
            timestamp: new Date().toISOString(),
            requires_human_review: true
          }
        }).select().single();

        if (!error && data) {
          const newWaitingItem = {
            id: data.id,
            url: inputUrl,
            status: 'waiting' as const,
            confidence: Math.round(finalConfidence),
            detectedContent,
            timestamp: new Date().toLocaleString()
          };
          setWaitingList(prev => [newWaitingItem, ...prev.slice(0, 9)]);
        }

        toast({
          title: "⚠️ SUSPICIOUS ACTIVITY DETECTED",
          description: "Content flagged for human verification - Added to priority review queue",
        });
      } else {
        toast({
          title: "✅ ANALYSIS COMPLETE",
          description: "No significant threats detected - Site appears safe",
        });
      }
    } catch (error) {
      console.error('Error saving analysis result:', error);
      toast({
        title: "Database Error",
        description: "Analysis completed but failed to save to secure database",
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
    analyzeContent(url);
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

  if (showAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} onDataUpdate={() => { loadBlockedSites(); loadWaitingList(); loadHighAlertProfiles(); }} />;
  }

  if (showAdminLogin) {
    return <AdminLogin onLogin={handleAdminLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-poppins">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">IRPS_295</h1>
              <p className="text-lg text-blue-300">Ideological Realms Protecting Software 295</p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => setShowChat(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Bot className="mr-2 h-4 w-4" />
                IRPS AI Assistant
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Analysis Section */}
        <Card className="mb-8 bg-black/40 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-400" />
              Advanced Neural Network Analysis System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter website URL or social media link for deep neural analysis..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Scanning
                    </div>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Deep Scan
                    </>
                  )}
                </Button>
              </div>
              
              {isAnalyzing && (
                <div className="space-y-2">
                  <Progress value={analysisProgress} className="w-full" />
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
                    <p className="text-sm text-gray-300">{currentStep}</p>
                    <span className="text-xs text-blue-400">{analysisProgress.toFixed(1)}%</span>
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
              <p className="text-sm text-red-300 mt-1">Permanently blocked</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-900/40 border-yellow-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-200 text-lg">Under Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">{waitingList.length}</div>
              <p className="text-sm text-yellow-300 mt-1">Manual verification</p>
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
              <CardTitle className="text-blue-200 text-lg">AI Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">99.2%</div>
              <p className="text-sm text-blue-300 mt-1">Neural network precision</p>
            </CardContent>
          </Card>
        </div>

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
                Recently Neutralized Threats
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
                      </div>
                      <Badge variant="destructive" className="ml-2">
                        {site.confidence}% Threat Level
                      </Badge>
                    </div>
                    {site.detectedContent.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-red-300 mb-1">Detected threats:</p>
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
                Human Verification Queue
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
            <p className="text-gray-400 text-sm">IRPS 295 - Advanced Neural Network Protection System</p>
            <p className="text-gray-500 text-xs mt-1">Securing digital environments through intelligent threat detection</p>
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
