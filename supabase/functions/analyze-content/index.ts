
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Enhanced content detection patterns
const THREAT_PATTERNS = {
  explicit: [
    /\b(porn|xxx|adult|nude|naked|sex|sexual|erotic)\b/gi,
    /\b(orgasm|masturbat|fuck|dick|cock|pussy|tits|ass)\b/gi,
  ],
  violence: [
    /\b(kill|murder|violence|blood|gore|torture|abuse)\b/gi,
    /\b(weapon|gun|knife|bomb|terror|shoot|stab)\b/gi,
  ],
  hate: [
    /\b(hate|racist|nazi|supremacist|discrimination)\b/gi,
    /\b(slur|offensive|bigot|prejudice)\b/gi,
  ],
  scam: [
    /\b(scam|fraud|phishing|fake|illegal|stolen)\b/gi,
    /\b(click here|urgent|limited time|act now)\b/gi,
  ],
  malware: [
    /\b(malware|virus|trojan|spyware|ransomware)\b/gi,
    /\b(download|install|exe|suspicious|unsafe)\b/gi,
  ]
};

const SOCIAL_MEDIA_PATTERNS = {
  facebook: /facebook\.com|fb\.com/i,
  twitter: /twitter\.com|x\.com/i,
  instagram: /instagram\.com/i,
  tiktok: /tiktok\.com/i,
  youtube: /youtube\.com|youtu\.be/i,
  linkedin: /linkedin\.com/i,
  reddit: /reddit\.com/i,
  snapchat: /snapchat\.com/i,
};

async function scrapeContent(url: string): Promise<{
  content: string;
  title: string;
  description: string;
  images: string[];
  links: string[];
}> {
  try {
    console.log(`Starting to scrape: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Successfully fetched ${html.length} characters of HTML`);

    // Extract content using regex patterns (lightweight HTML parsing)
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract text content (remove HTML tags)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Extract images
    const imgRegex = /<img[^>]*src=["']([^"']*)/gi;
    const images: string[] = [];
    let imgMatch;
    while ((imgMatch = imgRegex.exec(html)) !== null) {
      images.push(imgMatch[1]);
    }

    // Extract links
    const linkRegex = /<a[^>]*href=["']([^"']*)/gi;
    const links: string[] = [];
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      links.push(linkMatch[1]);
    }

    console.log(`Extracted: ${textContent.length} chars, ${images.length} images, ${links.length} links`);

    return {
      content: textContent,
      title,
      description,
      images: images.slice(0, 10), // Limit to first 10 images
      links: links.slice(0, 20), // Limit to first 20 links
    };
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to scrape content: ${error.message}`);
  }
}

function analyzeContent(scrapedData: any): {
  detectedThreats: string[];
  confidenceScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  details: any;
} {
  const { content, title, description, images, links } = scrapedData;
  const allText = `${title} ${description} ${content}`.toLowerCase();
  
  const detectedThreats: string[] = [];
  let totalMatches = 0;

  // Analyze against threat patterns
  Object.entries(THREAT_PATTERNS).forEach(([category, patterns]) => {
    let categoryMatches = 0;
    patterns.forEach(pattern => {
      const matches = allText.match(pattern);
      if (matches) {
        categoryMatches += matches.length;
        totalMatches += matches.length;
      }
    });
    
    if (categoryMatches > 0) {
      detectedThreats.push(category);
    }
  });

  // Calculate confidence score based on multiple factors
  const contentLength = allText.length;
  const threatDensity = contentLength > 0 ? (totalMatches / contentLength) * 1000 : 0;
  const uniqueThreats = detectedThreats.length;
  
  // Suspicious URL patterns
  const suspiciousUrlPatterns = [
    /\d+\.\d+\.\d+\.\d+/, // IP addresses
    /[a-z0-9]{20,}/, // Long random strings
    /\.(tk|ml|ga|cf)$/, // Suspicious TLDs
  ];
  
  const urlSuspicious = suspiciousUrlPatterns.some(pattern => pattern.test(scrapedData.url));
  
  let confidenceScore = Math.min(95, 
    (threatDensity * 30) + 
    (uniqueThreats * 15) + 
    (urlSuspicious ? 20 : 0) +
    (images.length > 50 ? 10 : 0) // Many images can indicate adult content
  );

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (confidenceScore >= 80) riskLevel = 'critical';
  else if (confidenceScore >= 60) riskLevel = 'high';
  else if (confidenceScore >= 30) riskLevel = 'medium';
  else riskLevel = 'low';

  return {
    detectedThreats,
    confidenceScore: Math.round(confidenceScore),
    riskLevel,
    details: {
      totalMatches,
      threatDensity: Math.round(threatDensity * 100) / 100,
      uniqueThreats,
      urlSuspicious,
      contentLength,
      imageCount: images.length,
      linkCount: links.length,
    }
  };
}

function getSiteType(url: string): 'website' | 'social_media' {
  const urlLower = url.toLowerCase();
  return Object.values(SOCIAL_MEDIA_PATTERNS).some(pattern => pattern.test(urlLower)) 
    ? 'social_media' 
    : 'website';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      throw new Error('Valid URL is required');
    }

    console.log(`Analyzing URL: ${url}`);

    // Step 1: Scrape content
    const scrapedData = await scrapeContent(url);
    
    // Step 2: Analyze content
    const analysis = analyzeContent({ ...scrapedData, url });
    
    // Step 3: Determine status
    const status = analysis.riskLevel === 'critical' ? 'blocked' :
                  analysis.riskLevel === 'high' ? 'waiting' : 'safe';

    // Step 4: Log analysis
    await supabase.from('analysis_logs').insert({
      url,
      analysis_result: status,
      confidence_score: analysis.confidenceScore,
      detected_keywords: analysis.detectedThreats,
      processing_time_ms: Date.now() - Date.now(), // Placeholder
      ai_model_version: 'IRPS_RealScraper_v1.0'
    });

    // Step 5: Store results based on status
    const siteType = getSiteType(url);
    
    if (status === 'blocked') {
      await supabase.from('blocked_sites').insert({
        url,
        detected_content: analysis.detectedThreats,
        confidence_score: analysis.confidenceScore,
        site_type: siteType,
        analysis_details: {
          model: 'IRPS_RealScraper_v1.0',
          timestamp: new Date().toISOString(),
          analysis_depth: 'deep_scrape',
          threat_level: analysis.riskLevel,
          scraping_details: analysis.details
        }
      });
    } else if (status === 'waiting') {
      await supabase.from('waiting_list').insert({
        url,
        detected_content: analysis.detectedThreats,
        confidence_score: analysis.confidenceScore,
        site_type: siteType,
        analysis_details: {
          model: 'IRPS_RealScraper_v1.0',
          timestamp: new Date().toISOString(),
          requires_human_review: true,
          scraping_details: analysis.details
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      status,
      analysis: {
        confidence: analysis.confidenceScore,
        detectedContent: analysis.detectedThreats,
        riskLevel: analysis.riskLevel,
        details: analysis.details,
        scrapedData: {
          title: scrapedData.title,
          contentLength: scrapedData.content.length,
          imageCount: scrapedData.images.length,
          linkCount: scrapedData.links.length
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
