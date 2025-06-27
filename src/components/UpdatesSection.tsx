
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Update {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  published: boolean;
}

interface UpdatesSectionProps {
  onClose: () => void;
}

const UpdatesSection = ({ onClose }: UpdatesSectionProps) => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error loading updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUpdateIcon = (title: string) => {
    if (title.includes('🚨') || title.toLowerCase().includes('alert')) {
      return <AlertCircle className="h-5 w-5 text-red-400" />;
    }
    return <Bell className="h-5 w-5 text-purple-400" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl flex items-center gap-2">
            <Bell className="h-6 w-6 text-purple-400" />
            System Updates & Announcements
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-300 mt-2">Loading updates...</p>
            </div>
          ) : updates.length === 0 ? (
            <Card className="bg-black/40 border-white/20">
              <CardContent className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No updates available at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            updates.map((update) => (
              <Card key={update.id} className="bg-black/40 border-white/20 hover:border-purple-500/30 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white flex items-center gap-2 flex-1">
                      {getUpdateIcon(update.title)}
                      {update.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="outline" className="text-xs text-purple-200 border-purple-500/30">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(update.created_at)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {update.image_url && (
                    <img 
                      src={update.image_url} 
                      alt={update.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {update.content}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-white/10">
          <p className="text-sm text-gray-400">
            Stay updated with the latest system enhancements and security improvements
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdatesSection;
