import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, catchError } from 'rxjs/operators'; // Added catchError for real API
import { HttpClient } from '@angular/common/http';

export interface Message {
  id: string;
  text?: string;
  files?: File[]; // New: Multiple files
  fileUrls?: { [key: string]: string }; // New: Blob URLs per file
  isUser : boolean; // Fixed: Removed extra colon/typo
  timestamp: Date;
  isLoading?: boolean;
  isSent?: boolean;
  feedback?: { isLiked: boolean; isDisliked: boolean }; // New: For like/unlike
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private initialQuerySubject = new BehaviorSubject<string | null>(null);
  public initialQuery$ = this.initialQuerySubject.asObservable();

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private apiUrl = 'YOUR_API_ENDPOINT'; // Replace with your text-only API endpoint (e.g., '/api/chat' or 'https://api.openai.com/v1/chat/completions')
  private fileUploadUrl = 'YOUR_FILE_UPLOAD_ENDPOINT'; // Replace with your file upload endpoint (e.g., '/api/chat/upload')
  private feedbackUrl = 'YOUR_FEEDBACK_ENDPOINT'; // Replace with your feedback API endpoint (e.g., '/api/feedback')

  constructor(private http: HttpClient) {}

  // Set initial query from home page or navigation
  setInitialQuery(query: string): void {
    this.initialQuerySubject.next(query);
  }

  // Clear initial query after processing
  clearInitialQuery(): void {
    this.initialQuerySubject.next(null);
  }

  // Add a new message to the chat history
  addMessage(message: Message): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);
  }

  // Update a specific message by ID (e.g., replace loading text with AI response or update feedback)
  updateMessage(id: string, updates: Partial<Message>): void {
    const currentMessages = this.messagesSubject.value;
    const updatedMessages = currentMessages.map(msg =>
      msg.id === id ? { ...msg, ...updates } : msg
    );
    this.messagesSubject.next(updatedMessages);
  }

  // Update the entire messages array (e.g., after removing a file from a message)
  updateMessages(messages: Message[]): void {
    this.messagesSubject.next([...messages]);
  }

  // Clear all messages (for restart functionality)
  clearMessages(): void {
    this.messagesSubject.next([]);
  }

  // Text-only API call (no files)
  sendMessageToAPI(message: string): Observable<any> {
    return this.http.post(this.apiUrl, { 
      query: message,
      // Add other required parameters (e.g., userId, sessionId, model: 'gpt-4')
    }).pipe(
      catchError(error => {
        console.error('API Error:', error);
        return of({ error: 'API request failed' });
      })
    );
  }

  // API call for text + files (uses FormData for multipart upload)
  sendWithFiles(formData: FormData): Observable<any> {
    return this.http.post(this.fileUploadUrl, formData, {
      // HttpClient auto-sets Content-Type: multipart/form-data for FormData
      // Optional: Add headers if needed (e.g., auth token)
      // headers: { 'Authorization': 'Bearer your-token' }
    }).pipe(
      catchError(error => {
        console.error('File Upload Error:', error);
        return of({ error: 'Upload failed' });
      })
    );
  }

  // NEW: Send feedback (like/unlike) for a message (ChatGPT-style)
  sendFeedback(messageId: string, isLike: boolean): Observable<any> {
    const feedbackType = isLike ? 'like' : 'dislike';
    
    // Real API call (uncomment and adapt)
    /*
    return this.http.post(this.feedbackUrl, {
      messageId: messageId,
      feedback: feedbackType,
      // Add other params (e.g., userId, timestamp)
    }).pipe(
      catchError(error => {
        console.error('Feedback API Error:', error);
        return of({ success: false, message: 'Feedback saved locally' });
      })
    );
    */

    // Mock for testing (simulates API delay and success)
    console.log(`Mock Feedback API: Sending ${feedbackType} for message ${messageId}`);
    return of({ success: true, messageId, feedback: feedbackType }).pipe(
      delay(300) // Simulate network delay
    );
  }

  // Mock API call (for development/testing; supports text + optional files) - Enhanced for subsequent prompts
  mockAPICall(message: string, files: File[] = [], conversationContext?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Simulate processing files
      if (files.length > 0) {
        console.log('Mock API: Processing files:', files.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type
        })));
      }

      // Simulate random error (5% chance for testing)
      if (Math.random() < 0.05) {
        setTimeout(() => reject(new Error('Mock API error: Network issue')), 1000);
        return;
      }

      setTimeout(() => {
        let response = `AI Response to: "${message || 'No text provided'}"`;
        if (conversationContext) {
          response += ` (Continuing conversation from previous messages)`;
        }
        if (files.length > 0) {
          response += `. Successfully processed ${files.length} file(s): ${files.map(f => f.name).join(', ')}`;
        }
        response += '. (Mock response)';
        resolve(response);
      }, 1500 + (files.length * 500)); // Extra delay for files
    });
  }
}