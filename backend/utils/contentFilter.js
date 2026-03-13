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
      'hello', 'hi', 'hey', 'hii', 'hiii', 'helo',
      'how are you', 'how r u', 'how r you', 'how are u',
      'good morning', 'good afternoon', 'good evening', 'good night',
      'whats up', "what's up", 'wassup', 'sup',
      'nice to meet', 'pleased to meet',
      'thank you', 'thanks', 'thx', 'thanx',
      'bye', 'goodbye', 'see you', 'see ya',
      'lol', 'lmao', 'haha', 'hehe',
      'chat', 'chatting', 'lets chat', "let's chat",
      'talk to me', 'can we talk', 'wanna talk',
      'friend', 'friendship', 'be friends',
      'love you', 'i love', 'luv u',
      'miss you', 'i miss',
      'call me', 'text me', 'message me', 'dm me',
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
    this.chatPatterns = [
      /^(hi|hello|hey|hii|hiii)\s*[!.?]*$/i,  // Just "hi" or "hello"
      /^(how are you|how r u|how r you)\s*[!.?]*$/i,  // Just "how are you"
      /\b(are you there|r u there|anyone there)\b/i,
      /\b(can you hear me|do you understand)\b/i,
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
    
    // Check for chat/greeting keywords
    for (const keyword of this.chatKeywords) {
      if (fullText.includes(keyword.toLowerCase())) {
        return {
          isBlocked: true,
          reason: `This appears to be a chat message, not a complaint. Please submit only legitimate civic issues like infrastructure problems, sanitation issues, or public service concerns.`,
          keyword: keyword
        };
      }
    }
    
    // Check for chat patterns
    for (const pattern of this.chatPatterns) {
      if (pattern.test(fullText)) {
        return {
          isBlocked: true,
          reason: `This appears to be a chat message, not a complaint. Please submit only legitimate civic issues like infrastructure problems, sanitation issues, or public service concerns.`,
          pattern: pattern.toString()
        };
      }
    }
    
    // Check for blocked keywords
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
    
    // Check for too short content (likely spam)
    if (title.trim().length < 5 || description.trim().length < 10) {
      return {
        isBlocked: true,
        reason: 'Please provide more details. Title must be at least 5 characters and description at least 10 characters.'
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
