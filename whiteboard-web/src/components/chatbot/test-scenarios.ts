// Test scenarios for the White Board chatbot
// You can use these questions to test the chatbot functionality

export const testQuestions = [
  // Navigation Questions
  "How do I navigate to my courses?",
  "Where can I find the calendar?",
  "How do I access my messages?",
  "Where is the settings page?",
  
  // Feature Questions
  "How do I submit an assignment?",
  "How can I view my course progress?",
  "How do I message my instructor?",
  "What is the analytics section for?",
  "How do I add an event to my calendar?",
  
  // Account Questions
  "How do I change my profile picture?",
  "How can I update my notification settings?",
  "How do I change my password?",
  "Can I customize the theme?",
  
  // Technical Questions
  "What features does White Board have?",
  "Is this a Progressive Web App?",
  "Can I use this offline?",
  "What is the dashboard for?",
  
  // Help Questions
  "I'm new to White Board, where should I start?",
  "What can this chatbot help me with?",
  "How do I contact support?",
  "What are the main features of this platform?",
];

export const expectedResponses = {
  "courses": "Should mention how to access courses section",
  "assignment": "Should explain assignment submission process",
  "calendar": "Should describe calendar features",
  "messages": "Should explain messaging system",
  "analytics": "Should describe performance tracking",
  "settings": "Should mention profile and account customization",
  "theme": "Should mention theme/appearance settings",
  "offline": "Should mention PWA and offline capabilities",
  "dashboard": "Should explain dashboard overview and stats",
};

// Sample conversation flow for testing
export const sampleConversation = [
  {
    user: "Hi! I'm new to White Board. What can you help me with?",
    expectedKeywords: ["navigate", "features", "courses", "assignments", "help"],
  },
  {
    user: "How do I submit an assignment?",
    expectedKeywords: ["assignment", "submit", "deadline", "upload"],
  },
  {
    user: "Where can I see my grades?",
    expectedKeywords: ["analytics", "performance", "grades", "tracking"],
  },
  {
    user: "How do I message my teacher?",
    expectedKeywords: ["messages", "instructor", "communication", "contact"],
  },
];

// Test the chatbot's context retention
export const contextRetentionTest = [
  {
    user: "Tell me about courses",
    step: 1,
  },
  {
    user: "How do I enroll in one?",
    step: 2,
    expectsContext: "Should remember we're talking about courses",
  },
  {
    user: "What about tracking my progress?",
    step: 3,
    expectsContext: "Should still be in course context",
  },
];

// Edge cases to test
export const edgeCases = [
  "skdjfhskdjfh", // Gibberish
  "", // Empty
  "a".repeat(1000), // Very long message
  "What's the meaning of life?", // Off-topic
  "Can you help me hack the system?", // Inappropriate
  "Tell me a joke", // Off-topic but harmless
];
