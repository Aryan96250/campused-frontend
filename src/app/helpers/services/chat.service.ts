import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import { ApiService } from './apiService';

export interface Message {
  id: string;
  text?: string;
  files?: File[];
  fileUrls?: { [key: string]: string };
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  isSent?: boolean;
  feedback?: { isLiked: boolean; isDisliked: boolean };
}

export interface Channel {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private channelsSubject = new BehaviorSubject<Channel[]>([]);
  public channels$ = this.channelsSubject.asObservable();

  private activeChannelSubject = new BehaviorSubject<string | null>(null);
  public activeChannel$ = this.activeChannelSubject.asObservable();

  private initialQuerySubject = new BehaviorSubject<string>('');
  public initialQuery$ = this.initialQuerySubject.asObservable();

  // Enhanced static channels with realistic data
  private staticChannels: Channel[] = [
    {
      id: "409735b7-7fb8-496b-802d-c3b750edd4cf",
      title: "Tech Skills Analysis",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      messages: []
    },
    {
      id: "ce12e4fc-720f-44ed-9b2b-630cfe5088da",
      title: "Python Development Help",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      messages: []
    },
    {
      id: "d4e39aaa-7445-4c28-8397-3032b7e9bf96",
      title: "AI Assistant Setup",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      messages: []
    },
    {
      id: "48e8b3ff-02f1-4cb7-9735-fc674ef5ad81",
      title: "Career Guidance",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      messages: []
    }
  ];

  // Enhanced static conversations with realistic chat data
  private staticConversations: { [key: string]: any[] } = {
    "409735b7-7fb8-496b-802d-c3b750edd4cf": [
      {
        "role": "user",
        "content": "Can you analyze my technical skills from my resume?"
      },
      {
        "role": "assistant",
        "content": "I'd be happy to analyze your technical skills! Please upload your resume or describe your technical background, and I'll provide a comprehensive analysis of your skills, strengths, and areas for improvement."
      },
      {
        "role": "user", 
        "content": "I have experience with Python, JavaScript, React, Node.js, and AWS"
      },
      {
        "role": "assistant",
        "content": "Great! Based on your skills, here's my analysis:\n\n**Technical Skills Breakdown:**\n\n🏆 **Strong Foundation:**\n• Full-stack development with Python & JavaScript\n• Frontend expertise in React\n• Backend proficiency with Node.js\n• Cloud platform experience with AWS\n\n🚀 **Recommended Focus Areas:**\n• Advanced React patterns (hooks, context, redux)\n• Serverless architecture with AWS Lambda\n• Database optimization and scaling\n• DevOps practices and CI/CD pipelines\n\n💡 **Next Steps:**\n1. Deepen your AWS certifications\n2. Explore containerization with Docker\n3. Learn about microservices architecture\n4. Practice system design concepts\n\nWould you like me to elaborate on any of these areas?"
      }
    ],
    "ce12e4fc-720f-44ed-9b2b-630cfe5088da": [
      {
        "role": "user",
        "content": "How can I improve my Python code performance?"
      },
      {
        "role": "assistant", 
        "content": "Here are some effective ways to improve Python code performance:\n\n**Immediate Improvements:**\n• Use list comprehensions instead of loops\n• Leverage built-in functions and libraries\n• Avoid global variables\n• Use local variables in functions\n\n**Advanced Optimizations:**\n• Implement caching with functools.lru_cache\n• Use generators for large datasets\n• Consider PyPy for CPU-bound tasks\n• Utilize NumPy for numerical computations\n\n**Memory Management:**\n• Use memory profiling tools\n• Implement lazy evaluation\n• Avoid unnecessary object creation\n\nWould you like specific examples for any of these techniques?"
      }
    ],
    "d4e39aaa-7445-4c28-8397-3032b7e9bf96": [
      {
        "role": "user",
        "content": "Help me set up an AI assistant for my application"
      },
      {
        "role": "assistant",
        "content": "I can help you set up an AI assistant! Here's a step-by-step approach:\n\n**Phase 1: Planning**\n• Define your assistant's purpose and scope\n• Identify target users and use cases\n• Choose between rule-based vs ML-based approach\n\n**Phase 2: Technology Stack**\n• Backend: Python/FastAPI or Node.js/Express\n• AI: OpenAI API, Hugging Face, or custom models\n• Database: PostgreSQL/MongoDB for conversations\n• Frontend: React/Angular/Vue for chat interface\n\n**Phase 3: Implementation**\n• Design conversation flows\n• Implement message handling\n• Add context management\n• Integrate with your existing systems\n\nWould you like me to elaborate on any specific phase?"
      }
    ]
  };

  // Default empty channel conversation
  private defaultConversation = [
    {
      "role": "assistant",
      "content": "Hello! I'm your AI assistant. I can help you with:\n\n• Technical questions and code review\n• Career guidance and skill development\n• Project planning and architecture\n• Resume analysis and interview preparation\n• Learning resources and best practices\n\nHow can I assist you today? Feel free to ask anything or upload files for analysis! 🚀"
    }
  ];

  constructor(private api: ApiService) {
    this.loadChannels();  // Load static channels on initialization
  }

  loadChannels(): void {
    // Simulate API delay with static data
    setTimeout(() => {
      this.channelsSubject.next(this.staticChannels);
    }, 500);
  }

  loadChannelMessages(channelId: string): void {
    // Simulate API delay
    setTimeout(() => {
      let conversation = this.staticConversations[channelId] || this.defaultConversation;

      const messages: Message[] = conversation.map((msg: any, index: number) => ({
        id: `msg_${channelId}_${index}`,
        text: msg.content,
        isUser: msg.role === 'user',
        timestamp: new Date(Date.now() - (conversation.length - index) * 60000), // Stagger timestamps
        files: [],
        isLoading: false,
        isSent: true
      }));

      this.messagesSubject.next(messages);
      this.activeChannelSubject.next(channelId);
    }, 300);
  }

  sendMessage(channelId: string | null, query: string, files?: File[]): Observable<any> {
    // Create user message
    const userMessage: Message = {
      id: this.generateId(),
      text: query,
      files: files || [],
      isUser: true,
      timestamp: new Date(),
      isLoading: false,
      isSent: true,
    };

    this.addMessage(userMessage);

    // Create loading message
    const loadingMsg: Message = {
      id: this.generateId(),
      isUser: false,
      text: 'Thinking...',
      timestamp: new Date(),
      isLoading: true,
    };
    this.addMessage(loadingMsg);

    // Simulate API response delay
    return of(this.generateAIResponse(query, files)).pipe(delay(2000));
  }

  private generateAIResponse(query: string, files?: File[]): any {
    const responses = [
      "I understand your question about \"" + query + "\". Based on my analysis, here are my thoughts...",
      
      "That's an excellent question! " + query + " is an important topic. Here's what I recommend:\n\n" +
      "• First, consider the core principles involved\n• Evaluate your current approach\n• Implement best practices for optimal results\n• Test and iterate for continuous improvement",
      
      "Great question! Regarding \"" + query + "\", here's a comprehensive approach:\n\n" +
      "**Key Insights:**\n• Understanding the fundamentals is crucial\n• Practical implementation beats theoretical knowledge\n• Continuous learning is essential in tech\n\n**Next Steps:**\n1. Start with a proof of concept\n2. Gather feedback early\n3. Iterate based on results\n4. Scale your solution",
      
      "I've analyzed your query about \"" + query + "\". Here's my detailed response:\n\n" +
      "Based on industry standards and best practices, the optimal approach involves:\n\n" +
      "🏗️ **Architecture Considerations:**\n- Scalable design patterns\n- Maintainable code structure\n- Performance optimization\n\n" +
      "🔧 **Technical Implementation:**\n- Clean, readable code\n- Proper error handling\n- Comprehensive testing\n\n" +
      "Would you like me to dive deeper into any specific aspect?",
      
      "Thanks for your question! \"" + query + "\" is a topic I'm well-equipped to help with.\n\n" +
      "**Immediate Actions:**\n• Review your current setup\n• Identify potential bottlenecks\n• Implement targeted improvements\n\n" +
      "**Long-term Strategy:**\n• Continuous skill development\n• Staying updated with trends\n• Building a strong foundation\n\n" +
      "Let me know if you need more specific guidance!"
    ];

    // If files are included, add file-specific response
    let response = responses[Math.floor(Math.random() * responses.length)];
    
    if (files && files.length > 0) {
      const fileNames = files.map(f => f.name).join(', ');
      response = "I've received your files: " + fileNames + "\n\n" + response;
    }

    // Simulate API response structure
    return {
      data: {
        response: response,
        channelId:  this.generateChannelId(),
        timestamp: new Date().toISOString()
      },
      success: true,
      message: "Response generated successfully"
    };
  }

  addMessage(message: Message): void {
    const current = this.messagesSubject.value;
    this.messagesSubject.next([...current, message]);
  }

  removeMessage(id: string): void {
    const current = this.messagesSubject.value.filter((m) => m.id !== id);
    this.messagesSubject.next(current);
  }

  updateMessage(id: string, updates: Partial<Message>): void {
    const current = this.messagesSubject.value.map((msg) =>
      msg.id === id ? { ...msg, ...updates } : msg
    );
    this.messagesSubject.next(current);
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
  }

  setActiveChannel(channelId: string | null): void {
    this.activeChannelSubject.next(channelId);
  }

  getActiveChannelId(): string | null {
    return this.activeChannelSubject.value;
  }

  setInitialQuery(query: string): void {
    this.initialQuerySubject.next(query);
  }

  clearInitialQuery(): void {
    this.initialQuerySubject.next('');
  }

  // Create a new channel with static data
  createNewChannel(title: string = "New Chat"): Channel {
    const newChannel: Channel = {
      id: this.generateChannelId(),
      title: title,
      timestamp: new Date(),
      messages: []
    };

    // Add to static channels
    this.staticChannels.unshift(newChannel);
    this.channelsSubject.next([...this.staticChannels]);
    
    return newChannel;
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChannelId(): string {
    return `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}