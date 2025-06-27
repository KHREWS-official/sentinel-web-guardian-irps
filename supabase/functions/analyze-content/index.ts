
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

// Enhanced multi-language threat detection patterns
const THREAT_PATTERNS = {
  // Anti-Islamic and blasphemous content detection
  antiIslamic: {
    english: [
      /\b(anti[\s\-]?islam|hate[\s\-]?islam|fuck[\s\-]?islam|islam[\s\-]?sucks)\b/gi,
      /\b(muhammad[\s\-]?terrorist|prophet[\s\-]?fake|quran[\s\-]?fake|allah[\s\-]?fake)\b/gi,
      /\b(jihad[\s\-]?terror|muslim[\s\-]?terrorist|islamic[\s\-]?terror)\b/gi,
      /\b(bomb[\s\-]?allah|death[\s\-]?islam|destroy[\s\-]?mosque)\b/gi,
    ],
    arabic: [
      /\b(كافر|مرتد|زنديق|ملحد|كفر|إرهابي|تكفير)\b/gi,
      /\b(محمد[\s\-]?إرهابي|نبي[\s\-]?كاذب|قرآن[\s\-]?كاذب|الله[\s\-]?كاذب)\b/gi,
      /\b(اسلام[\s\-]?سيء|دين[\s\-]?باطل|مسلم[\s\-]?إرهابي)\b/gi,
    ],
    urdu: [
      /\b(کافر|مرتد|زندیق|ملحد|کفر|دہشت گرد|تکفیر)\b/gi,
      /\b(محمد[\s\-]?دہشت گرد|نبی[\s\-]?جھوٹا|قرآن[\s\-]?جھوٹا|اللہ[\s\-]?جھوٹا)\b/gi,
      /\b(اسلام[\s\-]?برا|دین[\s\-]?باطل|مسلمان[\s\-]?دہشت گرد)\b/gi,
    ],
    hindi: [
      /\b(काफिर|मुर्तद|धर्मद्रोही|नास्तिक|आतंकवादी)\b/gi,
      /\b(मुहम्मद[\s\-]?आतंकवादी|नबी[\s\-]?झूठा|कुरान[\s\-]?झूठा|अल्लाह[\s\-]?झूठा)\b/gi,
      /\b(इस्लाम[\s\-]?बुरा|धर्म[\s\-]?झूठा|मुसलमान[\s\-]?आतंकवादी)\b/gi,
    ]
  },
  // Enhanced explicit content detection
  explicit: [
    /\b(porn|xxx|adult|nude|naked|sex|sexual|erotic|fuck|shit|damn|bitch)\b/gi,
    /\b(orgasm|masturbat|dick|cock|pussy|tits|ass|boobs|penis|vagina)\b/gi,
    /\b(cumshot|blowjob|handjob|threesome|gangbang|hardcore|softcore)\b/gi,
    /\b(milf|teen[\s\-]?sex|barely[\s\-]?legal|18\+|mature[\s\-]?content)\b/gi,
  ],
  violence: [
    /\b(kill|murder|violence|blood|gore|torture|abuse|assault|rape)\b/gi,
    /\b(weapon|gun|knife|bomb|terror|shoot|stab|suicide[\s\-]?bomb)\b/gi,
    /\b(death[\s\-]?threat|mass[\s\-]?killing|serial[\s\-]?killer)\b/gi,
  ],
  hate: [
    /\b(hate|racist|nazi|supremacist|discrimination|bigot|prejudice)\b/gi,
    /\b(slur|offensive|xenophobia|homophobia|transphobia)\b/gi,
    /\b(ethnic[\s\-]?cleansing|genocide|apartheid|segregation)\b/gi,
  ],
  scam: [
    /\b(scam|fraud|phishing|fake|illegal|stolen|money[\s\-]?laundering)\b/gi,
    /\b(click[\s\-]?here|urgent|limited[\s\-]?time|Act[\s\-]?now|get[\s\-]?rich[\s\-]?quick)\b/gi,
    /\b(bitcoin[\s\-]?scam|crypto[\s\-]?fraud|investment[\s\-]?scam)\b/gi,
  ],
  malware: [
    /\b(malware|virus|trojan|spyware|ransomware|keylogger|rootkit)\b/gi,
    /\b(download|install|exe|suspicious|unsafe|infected|backdoor)\b/gi,
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

function detectLanguage(text: string): string {
  const arabicPattern = /[\u0600-\u06FF]/;
  const urduPattern = /[\u0600-\u06FF\u0750-\u077F]/;
  const hindiPattern = /[\u0900-\u097F]/;
  
  if (arabicPattern.test(text) && !urduPattern.test(text)) return 'arabic';
  if (urduPattern.test(text)) return 'urdu';
  if (hindiPattern.test(text)) return 'hindi';
  return 'english';
}

function categorizeContent(detectedThreats: string[]): string {
  if (detectedThreats.includes('antiIslamic')) return 'anti-islamic';
  if (detectedThreats.includes('explicit')) return 'explicit';
  if (detectedThreats.includes('violence')) return 'violence';
  if (detectedThreats.includes('hate')) return 'hate-speech';
  if (detectedThreats.includes('scam')) return 'scam';
  if (detectedThreats.includes('malware')) return 'malware';
  return 'general';
}

async function scrapeContent(url: string): Promise<{
  content: string;
  title: string;
  description: string;
  images: string[];
  links: string[];
}> {
  try {
    console.log(`Starting enhanced scraping: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5,ar;q=0.4,ur;q=0.3,hi;q=0.2',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} - ${response.statusText}`);
      // Return minimal data for analysis even if scraping fails
      return {
        content: url, // Use URL as content for pattern matching
        title: '',
        description: '',
        images: [],
        links: []
      };
    }

    const html = await response.text();
    console.log(`Successfully fetched ${html.length} characters of HTML`);

    // Enhanced content extraction
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract meta content for better analysis
    const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)/i);
    const keywords = keywordsMatch ? keywordsMatch[1] : '';

    // Enhanced text extraction with better cleaning - FIX: Use let instead of const
    let textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Enhanced image extraction with alt text
    const imgRegex = /<img[^>]*(?:src=["']([^"']*))(?:[^>]*alt=["']([^"']*))?[^>]*>/gi;
    const images: string[] = [];
    let imgMatch;
    while ((imgMatch = imgRegex.exec(html)) !== null) {
      images.push(imgMatch[1]);
      if (imgMatch[2]) {
        // Include alt text in content analysis - FIX: Properly append to textContent
        textContent += ' ' + imgMatch[2];
      }
    }

    // Enhanced link extraction
    const linkRegex = /<a[^>]*href=["']([^"']*)[^>]*>([^<]*)<\/a>/gi;
    const links: string[] = [];
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      links.push(linkMatch[1]);
      // Include link text in content analysis - FIX: Properly append to textContent
      if (linkMatch[2]) {
        textContent += ' ' + linkMatch[2];
      }
    }

    const combinedContent = `${title} ${description} ${keywords} ${textContent}`;

    console.log(`Enhanced extraction: ${combinedContent.length} chars, ${images.length} images, ${links.length} links`);

    return {
      content: combinedContent,
      title,
      description,
      images: images.slice(0, 15),
      links: links.slice(0, 25),
    };
  } catch (error) {
    console.error('Enhanced scraping error:', error);
    // Return URL as content for analysis even if scraping completely fails
    return {
      content: url,
      title: '',
      description: '',
      images: [],
      links: []
    };
  }
}

function analyzeContent(scrapedData: any): {
  detectedThreats: string[];
  confidenceScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  detectedLanguage: string;
  contentCategory: string;
  details: any;
} {
  const { content, title, description, images, links, url } = scrapedData;
  const allText = `${title} ${description} ${content}`.toLowerCase();
  
  const detectedThreats: string[] = [];
  let totalMatches = 0;
  const detectedLanguage = detectLanguage(allText);

  console.log(`Analyzing content: ${allText.length} characters, detected language: ${detectedLanguage}`);

  // Enhanced multi-language analysis
  Object.entries(THREAT_PATTERNS).forEach(([category, patterns]) => {
    let categoryMatches = 0;
    
    if (category === 'antiIslamic') {
      // Check language-specific patterns
      const langPatterns = patterns[detectedLanguage] || patterns.english;
      langPatterns.forEach(pattern => {
        const matches = allText.match(pattern);
        if (matches) {
          categoryMatches += matches.length * 3; // Higher weight for anti-Islamic content
          totalMatches += matches.length * 3;
          console.log(`Anti-Islamic pattern matched: ${pattern}, matches: ${matches.length}`);
        }
      });
    } else {
      // Regular pattern matching for other categories
      patterns.forEach(pattern => {
        const matches = allText.match(pattern);
        if (matches) {
          categoryMatches += matches.length;
          totalMatches += matches.length;
          console.log(`${category} pattern matched: ${pattern}, matches: ${matches.length}`);
        }
      });
    }
    
    if (categoryMatches > 0) {
      detectedThreats.push(category);
    }
  });

  // Enhanced confidence calculation
  const contentLength = allText.length;
  const threatDensity = contentLength > 0 ? (totalMatches / contentLength) * 1000 : 0;
  const uniqueThreats = detectedThreats.length;
  
  // Additional risk factors
  const suspiciousUrlPatterns = [
    /\d+\.\d+\.\d+\.\d+/, // IP addresses
    /[a-z0-9]{20,}/, // Long random strings
    /\.(tk|ml|ga|cf|cc)$/, // Suspicious TLDs
    /adult|xxx|porn|sex/i, // Adult content in URL
  ];
  
  const urlSuspicious = suspiciousUrlPatterns.some(pattern => pattern.test(url));
  
  // Image analysis for adult content
  const suspiciousImageCount = images.filter(img => 
    /adult|xxx|porn|sex|nude|naked/i.test(img)
  ).length;
  
  let confidenceScore = Math.min(98, 
    (threatDensity * 35) + 
    (uniqueThreats * 20) + 
    (urlSuspicious ? 25 : 0) +
    (suspiciousImageCount * 10) +
    (detectedThreats.includes('antiIslamic') ? 30 : 0) + // Extra weight for anti-Islamic content
    (detectedThreats.includes('explicit') ? 25 : 0) + // Extra weight for explicit content
    (images.length > 30 ? 15 : 0) // Many images suspicious
  );

  // Determine risk level with enhanced criteria
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (detectedThreats.includes('antiIslamic') || confidenceScore >= 85) {
    riskLevel = 'critical';
  } else if (confidenceScore >= 65 || detectedThreats.includes('explicit')) {
    riskLevel = 'high';
  } else if (confidenceScore >= 35) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  const contentCategory = categorizeContent(detectedThreats);

  console.log(`Analysis complete: ${detectedThreats.length} threats, confidence: ${confidenceScore}, risk: ${riskLevel}`);

  return {
    detectedThreats,
    confidenceScore: Math.round(confidenceScore),
    riskLevel,
    detectedLanguage,
    contentCategory,
    details: {
      totalMatches,
      threatDensity: Math.round(threatDensity * 100) / 100,
      uniqueThreats,
      urlSuspicious,
      suspiciousImageCount,
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

    console.log(`Analyzing URL with enhanced detection: ${url}`);

    const startTime = Date.now();

    // Step 1: Enhanced scraping with better error handling
    const scrapedData = await scrapeContent(url);
    
    // Step 2: Enhanced multi-language analysis
    const analysis = analyzeContent({ ...scrapedData, url });
    
    const processingTime = Date.now() - startTime;
    
    // Step 3: Determine status with enhanced criteria
    const status = analysis.riskLevel === 'critical' ? 'blocked' :
                  analysis.riskLevel === 'high' ? 'waiting' : 'safe';

    // Step 4: Enhanced logging
    await supabase.from('analysis_logs').insert({
      url,
      analysis_result: status,
      confidence_score: analysis.confidenceScore,
      detected_keywords: analysis.detectedThreats,
      processing_time_ms: processingTime,
      ai_model_version: 'IRPS_Enhanced_MultiLang_v2.1_Fixed'
    });

    // Step 5: Store results with enhanced data
    const siteType = getSiteType(url);
    
    if (status === 'blocked') {
      await supabase.from('blocked_sites').insert({
        url,
        detected_content: analysis.detectedThreats,
        confidence_score: analysis.confidenceScore,
        site_type: siteType,
        detected_language: analysis.detectedLanguage,
        content_category: analysis.contentCategory,
        analysis_details: {
          model: 'IRPS_Enhanced_MultiLang_v2.1_Fixed',
          timestamp: new Date().toISOString(),
          analysis_depth: 'deep_multilang_scrape',
          threat_level: analysis.riskLevel,
          language_detected: analysis.detectedLanguage,
          content_category: analysis.contentCategory,
          scraping_details: analysis.details
        }
      });
    } else if (status === 'waiting') {
      await supabase.from('waiting_list').insert({
        url,
        detected_content: analysis.detectedThreats,
        confidence_score: analysis.confidenceScore,
        site_type: siteType,
        detected_language: analysis.detectedLanguage,
        content_category: analysis.contentCategory,
        analysis_details: {
          model: 'IRPS_Enhanced_MultiLang_v2.1_Fixed',
          timestamp: new Date().toISOString(),
          requires_human_review: true,
          language_detected: analysis.detectedLanguage,
          content_category: analysis.contentCategory,
          scraping_details: analysis.details
        }
      });
    }

    console.log(`Analysis completed successfully for ${url}: ${status} (${analysis.confidenceScore}% confidence)`);

    return new Response(JSON.stringify({
      success: true,
      status,
      analysis: {
        confidence: analysis.confidenceScore,
        detectedContent: analysis.detectedThreats,
        riskLevel: analysis.riskLevel,
        detectedLanguage: analysis.detectedLanguage,
        contentCategory: analysis.contentCategory,
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
    console.error('Enhanced analysis error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
