
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Code, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LearningContent {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url?: string;
  updated_at: string;
}

interface LearningSectionProps {
  onClose: () => void;
}

const LearningSection = ({ onClose }: LearningSectionProps) => {
  const [learningContent, setLearningContent] = useState<LearningContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLearningContent();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-blue-900 border-blue-500/30">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-400" />
            Learning AI Coding
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-300 mt-2">Loading learning content...</p>
            </div>
          ) : (
            <>
              {/* Hero Section */}
              <Card className="bg-blue-900/40 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-300 flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Master AI-Powered Development
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Discover the cutting-edge world of AI coding with comprehensive tutorials, resources, and hands-on examples. 
                    Learn how to build intelligent applications using the latest AI technologies.
                  </p>
                </CardContent>
              </Card>

              {/* Learning Content */}
              {learningContent.map((content) => (
                <Card key={content.id} className="bg-black/40 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-400" />
                      {content.title}
                    </CardTitle>
                    <p className="text-blue-300">{content.description}</p>
                  </CardHeader>
                  <CardContent>
                    {content.image_url && (
                      <img 
                        src={content.image_url} 
                        alt={content.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <div className="text-gray-300 whitespace-pre-wrap">
                      {content.content}
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      Last updated: {new Date(content.updated_at).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}

              {/* Quick Tips */}
              <Card className="bg-green-900/40 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-300">Quick Tips for AI Coding</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-gray-300 space-y-2">
                    <li>• Start with understanding the problem before choosing AI solutions</li>
                    <li>• Always validate and test your AI models thoroughly</li>
                    <li>• Keep your training data clean and representative</li>
                    <li>• Monitor AI performance in production environments</li>
                    <li>• Stay updated with the latest AI frameworks and libraries</li>
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LearningSection;
