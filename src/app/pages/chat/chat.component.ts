import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ChatService, Message } from '../../helpers/services/chat.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  standalone: true
})
export class ChatComponent implements OnInit, OnDestroy {
  userQuery: string = '';
  messages: Message[] = [];
  selectedFiles: File[] = []; // Files previewed in input (before submit)
  isProcessing: boolean = false;
  isDragOver: boolean = false; // For drag-and-drop
  private destroy$ = new Subject<void>();
  private fileUrls: { [key: string]: string } = {}; // Track blob URLs for cleanup (local to component)

  // Feedback state (ChatGPT-like, per message)
  feedbackStates: { [key: string]: { isLiked: boolean; isDisliked: boolean } } = {};

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    // Subscribe to messages
    this.chatService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(messages => {
        this.messages = messages;
        this.scrollToBottom();
      });

    // Initial query from home page
    this.chatService.initialQuery$
      .pipe(takeUntil(this.destroy$))
      .subscribe(query => {
        if (query) {
          this.processQuery(query);
          this.chatService.clearInitialQuery();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Clean up blob URLs
    Object.values(this.fileUrls).forEach(url => URL.revokeObjectURL(url));
    // Also clean up selected files previews
    this.selectedFiles.forEach(file => {
      const url = this.createPreviewUrl(file);
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
  }

  // Submit text or files (moves previews to main chat)
  onSubmitQuery(): void {
    if ((this.userQuery.trim() || this.selectedFiles.length > 0) && !this.isProcessing) {
      const query = this.userQuery.trim();
      this.userQuery = '';
      this.processQuery(query, [...this.selectedFiles]); // Copy files to avoid mutation
      this.selectedFiles = []; // Clear input previews
      this.fileUrls = {}; // Reset local URLs
    }
  }

  // File selection (adds to input previews, not main chat)
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" is too large (max 10MB). Please choose a smaller file.`);
        continue;
      }
      // Add to selectedFiles for input preview
      this.selectedFiles.push(file);
    }

    // Reset file input
    event.target.value = '';
    this.scrollToBottom(); // Optional: Scroll if needed
  }

  // Drag-and-drop handlers (with vibration feedback)
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
    // Haptic feedback (mobile/web support)
    if ('vibrate' in navigator) {
      (navigator as any).vibrate(100); // Short vibration on drag-over
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      // Create mock event for onFileSelected
      const mockEvent = { target: { files: files } } as any;
      this.onFileSelected(mockEvent);
    }
  }

  // Optional click handler for ask area
  onAskClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).tagName === 'INPUT' && (event.target as HTMLInputElement).type === 'text') {
      return;
    }
    const textInput = document.querySelector('.ask__input') as HTMLInputElement;
    if (textInput) {
      textInput.focus();
    }
  }

  // Remove selected file from input previews
  removeSelectedFile(index: number): void {
    const file = this.selectedFiles[index];
    if (file) {
      // Clean up preview URL
      const url = this.createPreviewUrl(file);
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    }
    this.selectedFiles.splice(index, 1);
  }

  // Create preview URL for files (blob URL)
  createPreviewUrl(file: File): string {
    if (!file) return '';
    const existingUrl = this.fileUrls[file.name];
    if (existingUrl) return existingUrl;
    const url = URL.createObjectURL(file);
    this.fileUrls[file.name] = url;
    return url;
  }

  // Download file (ChatGPT-like) - Enhanced with error handling
  downloadFile(file: File): void {
    try {
      const url = this.createPreviewUrl(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      this.showToast('File downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      this.showToast('Download failed. Please try again.');
    }
  }

  // Copy message text to clipboard (for feedback copy button)
  copyMessageText(index: number): void {
    const message = this.messages[index];
    if (!message || message.isUser  || !message.text) return;

    navigator.clipboard.writeText(message.text).then(() => {
      this.showToast('Copied to clipboard!');
      console.log('Text copied:', message.text);
    }).catch(err => {
      console.error('Copy failed:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = message.text  ??'';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showToast('Copied to clipboard!');
    });
  }

  // Download AI response as text file (for feedback download button)
  downloadResponse(index: number): void {
    const message = this.messages[index];
    if (!message || message.isUser  || !message.text) return;

    const blob = new Blob([message.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-response-${message.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up immediately
    this.showToast('Response downloaded!');
  }

  // Toggle like/unlike feedback (ChatGPT-like, for AI messages only)
  toggleFeedback(index: number, isLike: boolean): void {
    const message = this.messages[index];
    if (!message || message.isUser  || message.isLoading) return;

    const messageId = message.id;
    const currentFeedback = this.feedbackStates[messageId] || { isLiked: false, isDisliked: false };

    // Reset opposite feedback
    if (isLike) {
      currentFeedback.isLiked = !currentFeedback.isLiked;
      currentFeedback.isDisliked = false;
    } else {
      currentFeedback.isDisliked = !currentFeedback.isDisliked;
      currentFeedback.isLiked = false;
    }

    this.feedbackStates[messageId] = currentFeedback;

    // Update message in service
    this.chatService.updateMessage(messageId, {
      feedback: { ...currentFeedback }
    });

    // Show feedback toast
    this.showToast(isLike ? 'Thanks for the feedback!' : 'Thanks for the feedback!');

    // Real API call (uncomment and adapt your service method)
    /*
    this.chatService.sendFeedback(messageId, isLike).subscribe({
      next: () => {
        console.log(`Feedback saved for message ${messageId}: ${isLike ? 'Like' : 'Dislike'}`);
      },
      error: (error) => {
        console.error('Feedback API error:', error);
        this.showToast('Feedback saved locally (API error)');
      }
    });
    */

    // Mock (remove once real API is integrated)
    console.log(`Feedback sent for message ${messageId}: ${isLike ? 'Like' : 'Dislike'}`);
  }

  // Restart chat (clear messages and reset)
  onRestart(): void {
    this.chatService.clearMessages();
    this.messages = [];
    this.userQuery = '';
    this.selectedFiles = [];
    this.feedbackStates = {};
    this.fileUrls = {};
    this.isProcessing = false;
    this.showToast('Chat restarted!');
    this.scrollToBottom();
  }

  // Simple toast feedback (replace with MatSnackBar or similar for real UI)
  private showToast(message: string): void {
    // Mock toast: Use console for now; integrate a real toast service
    console.log(`[Toast] ${message}`);
    // Example with Angular Material (inject MatSnackBar in constructor):
    // this.snackBar.open(message, 'Close', { duration: 2000 });
  }

  // Getter for liked feedback state (fixes NG8107 warning by moving logic to TS)
  getFeedbackLiked(id: string): boolean {
    return (this.feedbackStates[id]?.isLiked ?? false) || (this.messages.find(m => m.id === id)?.feedback?.isLiked ?? false);
  }

  // Getter for disliked feedback state (fixes NG8107 warning by moving logic to TS)
  getFeedbackDisliked(id: string): boolean {
    return (this.feedbackStates[id]?.isDisliked ?? false) || (this.messages.find(m => m.id === id)?.feedback?.isDisliked ?? false);
  }

  // Check if file is an image
  isImageFile(type: string): boolean {
    return typeof type === 'string' && type.startsWith('image/');
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Handle image load errors
  onImageLoadError(event: any): void {
    event.target.style.display = 'none';
    console.warn('Failed to load image preview');
  }

  // Process query and files (creates single message with files array)
  private processQuery(query: string, files: File[] = []): void {
    // Create user message (text + files in one message)
    const userMessage: Message = {
      id: this.generateId(),
      text: query || undefined, // Optional if no text
      files: files.length > 0 ? files : undefined, // Array of files
      fileUrls: {}, // Will populate blob URLs
      isUser :  true,
      timestamp: new Date(),
      isSent: true // Mark as sent
    };

    // Generate blob URLs for files
    if (files.length > 0) {
      files.forEach(file => {
        userMessage.fileUrls![file.name] = this.createPreviewUrl(file);
      });
    }

    this.chatService.addMessage(userMessage);

    // Add loading message for AI response
    const loadingMessageId = this.generateId();
    const loadingMessage: Message = {
      id: loadingMessageId,
      text: 'Thinking...',
      isUser:  false,
      timestamp: new Date(),
      isLoading: true
    };
    this.chatService.addMessage(loadingMessage);
    this.isProcessing = true;

    // Call API
    this.callAPI(query, loadingMessageId, files);
    this.scrollToBottom();
  }

  // API call (handles text + files)
  private callAPI(query: string, loadingMessageId: string, files: File[] = []): void {
    if (files.length > 0) {
      // Files present: Use FormData for upload
      const formData = new FormData();
      if (query) formData.append('query', query);
      files.forEach(file => formData.append('files', file));

      // Real API (uncomment and adapt)
      /*
      this.chatService.sendWithFiles(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.chatService.updateMessage(loadingMessageId, {
              text: response.data || `Processed query: "${query || 'No text'}" with ${files.length} files.`,
              isLoading: false
            });
            this.isProcessing = false;
          },
          error: (error) => {
            this.chatService.updateMessage(loadingMessageId, {
              text: 'Sorry, something went wrong with the upload. Please try again.',
              isLoading: false
            });
            this.isProcessing = false;
            console.error('API Error:', error);
          }
        });
      */

      // Mock for testing
      console.log('Mock API: Uploading files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
      setTimeout(() => {
        this.chatService.updateMessage(loadingMessageId, {
          text: `AI Response to: "${query || 'No text provided'}". Successfully processed ${files.length} file(s): ${files.map(f => f.name).join(', ')}. (Mock response)`,
          isLoading: false
        });
        this.isProcessing = false;
      }, 2000 + (files.length * 500)); // Delay based on files
      return;
    }

    // No files: Text-only
    // Real API (uncomment)
    /*
    this.chatService.sendMessageToAPI(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.chatService.updateMessage(loadingMessageId, {
            text: response.data,
            isLoading: false
          });
          this.isProcessing = false;
        },
        error: (error) => {
          this.chatService.updateMessage(loadingMessageId, {
            text: 'Sorry, something went wrong. Please try again.',
            isLoading: false
          });
          this.isProcessing = false;
          console.error('API Error:', error);
        }
      });
    */

    // Mock
    this.chatService.mockAPICall(query)
      .then(response => {
        this.chatService.updateMessage(loadingMessageId, {
          text: response,
          isLoading: false
        });
        this.isProcessing = false;
      })
      .catch(error => {
        this.chatService.updateMessage(loadingMessageId, {
          text: 'Sorry, something went wrong. Please try again.',
          isLoading: false
        });
        this.isProcessing = false;
        console.error('API Error:', error);
      });
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  onExpandInput(event: MouseEvent): void {
    event.stopPropagation();
    console.log('Expand clicked'); // Implement expand (e.g., full-screen input)
  }

  onShowOptions(event: MouseEvent): void {
    event.stopPropagation();
    console.log('Options clicked'); // Implement options menu
  }
}