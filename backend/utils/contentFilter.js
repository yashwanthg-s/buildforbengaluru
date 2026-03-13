// Content Filter - Blocks inappropriate complaints

class ContentFilter {
  constructor() {
    // Inappropriate keywords that should be blocked
    this.blockedKeywords = [
      // Violence & Harassment
      'kill', 'murder', 'assault', 'attack', 'beat', 'hit', 'punch', 'kick',
      'stab', 'shoot', 'gun', 'knife', 'weapon', 'threat', 'threaten',
      'harass', 'harassment', 'bully', 'bullying', 'abuse', 'abusive',
      
      // Sexual Content
      'rape', 'molest', 'sexual assault', 'sexual harassment', 'grope',
      'inappropriate touch', 'indecent', 'obscene', 'pornography', 'porn',
      
      // Hate Speech
      'hate', 'racist', 'racism', 'discrimination', 'discriminate',
      
      // Drugs & Illegal Activities
      'drug deal', 'selling drugs', 'buy drugs', 'cocaine', 'heroin', 'meth',
      
      // Personal Attacks
      'revenge', 'retaliate', 'get back at', 'teach a lesson',
      
      // Spam/Fake
      'test', 'testing', 'fake complaint', 'dummy', 'sample'
    ];
    
    // Chat/greeting words that indicate non-complaint content
    this.chatKeywords = [
      'hi', 'hello', 'hey', 'hii', 'hiii',
      'good morning', 'good afternoon', 'good evening',
      'hi there', 'hello there', 'greetings',
      'whatsapp', 'instagram', 'facebook', 'snapchat', 'tiktok'
    ];
    
    // Suspicious patterns
    this.suspiciousPatterns = [
      /\b(massage|massaging|touching|touched)\s+(someone|somebody|person|people|him|her)\b/i,
      /\b(hurt|harm|damage|injure)\s+(someone|somebody|person|people|him|her)\b/i,
      /\b(follow|following|followed|stalk|stalking)\s+(someone|somebody|person|people|him|her)\b/i,
      /\b(spy|spying|watch|watching)\s+(someone|somebody|person|people|him|her)\b/i,
    ];
    
    // Question patterns that indicate chat attempts
    // REMOVED: Most patterns to allow casual language in complaints
    this.chatPatterns = [
      /\b(are you there|r u there|anyone there)\b/i,
      /\b(who are you|what are you|who is this)\b/i,
    ];
  }
  
  /**
   * Check if content contains inappropriate material
   * @param {string} title - Complaint title
   * @param {string} description - Complaint description
   * @returns {Object} - { isBlocked: boolean, reason: string }
   */
  checkContent(title, description) {
    const fullText = `${title} ${description}`.toLowerCase();
    
    // Check for too short content (likely spam)
    if (title.trim().length < 3 || description.trim().length < 5) {
      return {
        isBlocked: true,
        reason: 'Please provide more details. Title must be at least 3 characters and description at least 5 characters.'
      };
    }
    
    // Check for blocked keywords (violence, hate speech, etc.)
    for (const keyword of this.blockedKeywords) {
      if (fullText.includes(keyword.toLowerCase())) {
        return {
          isBlocked: true,
          reason: `Your complaint contains inappropriate content and cannot be submitted. Please ensure your complaint is about legitimate civic issues only.`,
          keyword: keyword
        };
      }
    }
    
    // Check for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(fullText)) {
        return {
          isBlocked: true,
          reason: `Your complaint appears to describe personal matters or inappropriate behavior. This system is for reporting civic infrastructure and public service issues only.`,
          pattern: pattern.toString()
        };
      }
    }
    
    // Only block chat if it's ONLY chat (no civic content)
    // Check if it's a pure chat message (just greetings, no real content)
    const hasChatKeywords = this.chatKeywords.some(kw => fullText.includes(kw.toLowerCase()));
    const hasChatPattern = this.chatPatterns.some(pattern => pattern.test(fullText));
    
    // If it's ONLY chat (no other meaningful content), block it
    if ((hasChatKeywords || hasChatPattern) && fullText.length < 50) {
      // Very short and only chat keywords = likely spam
      return {
        isBlocked: true,
        reason: `This appears to be a chat message, not a complaint. Please submit only legitimate civic issues like infrastructure problems, sanitation issues, or public service concerns.`
      };
    }
    
    // Content is acceptable
    return {
      isBlocked: false,
      reason: null
    };
  }
  
  /**
   * Log blocked attempts for monitoring
   */
  logBlockedAttempt(userId, title, description, reason) {
    console.warn('🚫 BLOCKED COMPLAINT ATTEMPT:', {
      userId,
      title: title.substring(0, 50),
      description: description.substring(0, 100),
      reason,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new ContentFilter();
