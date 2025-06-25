
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Send, Bot, User, AlertTriangle } from 'lucide-react';

interface IRPSAIChatProps {
  onClose: () => void;
}

interface Message {
  id: number;
  content: string;
  isBot: boolean;
  timestamp: string;
}

const IRPSAIChat: React.FC<IRPSAIChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! I'm IRPS AI, your digital safety assistant. I can help you understand how to report abusive and inappropriate content on various social media platforms and websites. How can I assist you today?",
      isBot: true,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const reportingGuides = {
    facebook: "To report on Facebook: 1) Click the three dots on the post/profile 2) Select 'Find support or report' 3) Choose the appropriate violation type 4) Follow the prompts to submit your report",
    instagram: "To report on Instagram: 1) Tap the three dots on the post/story 2) Select 'Report' 3) Choose why you're reporting 4) Follow the additional steps if prompted",
    twitter: "To report on Twitter/X: 1) Click the three dots on the tweet/profile 2) Select 'Report Tweet/Profile' 3) Choose the rule violation 4) Provide additional context if requested",
    tiktok: "To report on TikTok: 1) Long press the video 2) Tap 'Report' 3) Select the reason for reporting 4) Provide additional details if needed",
    youtube: "To report on YouTube: 1) Click the three dots below the video 2) Select 'Report' 3) Choose the issue type 4) Provide specific timestamps if relevant",
    google: "To report websites to Google: 1) Visit safebrowsing.google.com/safebrowsing/report_badware/ 2) Enter the harmful website URL 3) Describe the issue 4) Submit the report for review",
    general: "For general reporting: Always document evidence, report through official channels, block/unfollow harmful accounts, and contact platform support for serious violations."
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('facebook') || lowerMessage.includes('fb')) {
      return reportingGuides.facebook;
    } else if (lowerMessage.includes('instagram') || lowerMessage.includes('insta')) {
      return reportingGuides.instagram;
    } else if (lowerMessage.includes('twitter') || lowerMessage.includes('x.com')) {
      return reportingGuides.twitter;
    } else if (lowerMessage.includes('tiktok')) {
      return reportingGuides.tiktok;
    } else if (lowerMessage.includes('youtube')) {
      return reportingGuides.youtube;
    } else if (lowerMessage.includes('google') || lowerMessage.includes('website')) {
      return reportingGuides.google;
    } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return "I can help you report inappropriate content on various platforms. Just ask me about specific platforms like Facebook, Instagram, Twitter, TikTok, YouTube, or Google reporting. You can also ask general questions about digital safety.";
    } else if (lowerMessage.includes('abuse') || lowerMessage.includes('harassment')) {
      return "For abuse and harassment: 1) Document everything (screenshots, URLs) 2) Report immediately using platform tools 3) Block the user 4) Contact platform support for severe cases 5) Consider contacting local authorities for threats of violence. Remember: Your safety comes first.";
    } else if (lowerMessage.includes('child') || lowerMessage.includes('minor')) {
      return "⚠️ CRITICAL: Content involving minors requires immediate action: 1) DO NOT engage with the content 2) Report immediately to the platform 3) Report to NCMEC (National Center for Missing & Exploited Children) at CyberTipline.org 4) Contact local law enforcement if necessary. This is a serious legal matter.";
    } else {
      return reportingGuides.general + " Which specific platform would you like guidance on? I can help with Facebook, Instagram, Twitter, TikTok, YouTube, and general website reporting to Google.";
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      content: inputMessage,
      isBot: false,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        content: getAIResponse(inputMessage),
        isBot: true,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] bg-gray-900 border-blue-500/30 flex flex-col">
        <CardHeader className="border-b border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-blue-400">IRPS AI Assistant</CardTitle>
                <p className="text-sm text-gray-400">Digital Safety & Reporting Guidance</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-400 hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                {message.isBot && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.isBot
                      ? 'bg-blue-900/30 border border-blue-500/30 text-blue-100'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-60 mt-1">{message.timestamp}</p>
                </div>

                {!message.isBot && (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-blue-900/30 border border-blue-500/30 text-blue-100 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce animation-delay-100"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce animation-delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInputMessage("How do I report on Facebook?")}
                className="text-xs border-blue-500/30 text-blue-300 hover:bg-blue-900/20"
              >
                Facebook Reporting
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInputMessage("How do I report on Instagram?")}
                className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
              >
                Instagram Reporting
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInputMessage("How do I report websites to Google?")}
                className="text-xs border-green-500/30 text-green-300 hover:bg-green-900/20"
              >
                Website Reporting
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInputMessage("What should I do about abuse?")}
                className="text-xs border-red-500/30 text-red-300 hover:bg-red-900/20"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Abuse Help
              </Button>
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <Input
                placeholder="Ask me about reporting inappropriate content..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 bg-gray-800 border-gray-600 text-white"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IRPSAIChat;
