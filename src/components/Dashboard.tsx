
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, Eye, Search, Bot, Settings } from 'lucide-react';
import BlackHoleAnimation from './BlackHoleAnimation';
import AdminPanel from './AdminPanel';
import IRPSAIChat from './IRPSAIChat';

interface AnalysisResult {
  url: string;
  status: 'blocked' | 'waiting' | 'safe';
  confidence: number;
  detectedContent: string[];
  timestamp: string;
}

const Dashboard = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [blockedSites, setBlockedSites] = useState<AnalysisResult[]>([]);
  const [waitingList, setWaitingList] = useState<AnalysisResult[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { toast } = useToast();

  // Simulated AI analysis
  const analyzeContent = async (inputUrl: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate progressive analysis
    const steps = [
      'Connecting to target...',
      'Scraping content...',
      'Analyzing text patterns...',
      'Checking image content...',
      'Running AI detection model...',
      'Generating confidence scores...',
      'Finalizing results...'
    ];

    for (let i = 0; i <= steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisProgress((i / steps.length) * 100);
      
      if (i < steps.length) {
        toast({
          title: "AI Analysis in Progress",
          description: steps[i],
          duration: 800,
        });
      }
    }

    // Simulate AI decision making
    const suspiciousKeywords = ['sex', 'xxx', 'abuse', 'inappropriate', 'explicit'];
    const detectedContent: string[] = [];
    const confidence = Math.random() * 100;
    
    // Simulate keyword detection
    suspiciousKeywords.forEach(keyword => {
      if (Math.random() > 0.7) {
        detectedContent.push(keyword);
      }
    });

    const result: AnalysisResult = {
      url: inputUrl,
      status: confidence > 75 && detectedContent.length > 0 ? 'blocked' : 
              confidence > 40 ? 'waiting' : 'safe',
      confidence: Math.round(confidence),
      detectedContent,
      timestamp: new Date().toLocaleString()
    };

    if (result.status === 'blocked') {
      setBlockedSites(prev => [...prev, result]);
      toast({
        title: "⚠️ Threat Detected",
        description: `URL blocked with ${result.confidence}% confidence`,
        variant: "destructive",
      });
    } else if (result.status === 'waiting') {
      setWaitingList(prev => [...prev, result]);
      toast({
        title: "🔍 Manual Review Required",
        description: "URL added to waiting list for manual verification",
      });
    } else {
      toast({
        title: "✅ Safe Content",
        description: "No harmful content detected",
      });
    }

    setIsAnalyzing(false);
    setAnalysisProgress(0);
  };

  const handleAnalyze = () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }
    analyzeContent(url);
  };

  if (showAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} />;
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
              AI Content Analysis System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter website URL or social media link..."
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
                      Analyzing
                    </div>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
              
              {isAnalyzing && (
                <div className="space-y-2">
                  <Progress value={analysisProgress} className="w-full" />
                  <p className="text-sm text-gray-400">AI Analysis: {analysisProgress.toFixed(0)}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-red-900/40 border-red-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-200 text-lg">Blocked Websites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{blockedSites.length}</div>
              <p className="text-sm text-red-300 mt-1">Permanently blocked</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-900/40 border-yellow-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-200 text-lg">Waiting List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">{waitingList.length}</div>
              <p className="text-sm text-yellow-300 mt-1">Manual review required</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/40 border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-200 text-lg">AI Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">98.7%</div>
              <p className="text-sm text-blue-300 mt-1">Detection accuracy</p>
            </CardContent>
          </Card>
        </div>

        {/* Blocked Sites List */}
        {blockedSites.length > 0 && (
          <Card className="mb-8 bg-black/40 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Blocked Profiles & Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blockedSites.map((site, index) => (
                  <div key={index} className="bg-red-900/20 p-4 rounded-lg border border-red-500/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-white font-medium break-all">{site.url}</p>
                        <p className="text-sm text-gray-400">{site.timestamp}</p>
                      </div>
                      <Badge variant="destructive" className="ml-2">
                        {site.confidence}% Confidence
                      </Badge>
                    </div>
                    {site.detectedContent.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-red-300 mb-1">Detected content:</p>
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
                Manual Review Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {waitingList.map((site, index) => (
                  <div key={index} className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/20">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-white font-medium break-all">{site.url}</p>
                        <p className="text-sm text-gray-400">{site.timestamp}</p>
                      </div>
                      <Badge className="ml-2 bg-yellow-600">
                        {site.confidence}% Confidence
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
            <BlackHoleAnimation onAdminAccess={() => setShowAdmin(true)} />
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm">IRPS 295 - Advanced AI Content Protection System</p>
            <p className="text-gray-500 text-xs mt-1">Securing digital environments through intelligent monitoring</p>
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
