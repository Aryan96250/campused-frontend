import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
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
  showOptions: boolean = false; // New: For options dropdown toggle
  private destroy$ = new Subject<void>();
  private fileUrls: { [key: string]: string } = {}; // Track blob URLs for cleanup (local to component)

  // Feedback state (ChatGPT-like, per message)
  feedbackStates: { [key: string]: { isLiked: boolean; isDisliked: boolean } } = {};

  @ViewChild('textInput') textInput!: ElementRef<HTMLInputElement>; // New: For auto-focus after processing

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

  // New: Close options dropdown on outside click
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.ask__options') && !target.closest('.options-dropdown')) {
      this.showOptions = false;
    }
  }

  // Submit text or files (moves previews to main chat) - Fixed for subsequent prompts
  onSubmitQuery(): void {
    const query = this.userQuery.trim();
    if ((query || this.selectedFiles.length > 0) && !this.isProcessing) {
      // Process immediately: Add user message first (shows instantly)
      this.processQuery(query, [...this.selectedFiles]); // Copy files to avoid mutation
      // Clear input after adding message (prevents empty state)
      this.userQuery = '';
      this.selectedFiles = []; 
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
    if (this.textInput) {
      this.textInput.nativeElement.focus();
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
        // Remove from fileUrls if exists
        delete this.fileUrls[file.name];
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

  // Copy message text to clipboard (for feedback copy button) - Fixed for AI messages
  copyMessageText(index: number): void {
    const message = this.messages[index];
    if (!message || message.isUser  || !message.text) return; // Only for AI (!isUser )

    navigator.clipboard.writeText(message.text).then(() => {
      this.showToast('Copied to clipboard!');
      console.log('Text copied:', message.text);
    }).catch(err => {
      console.error('Copy failed:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = message.text ?? '';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showToast('Copied to clipboard!');
    });
  }

  // Download AI response as text file (for feedback download button) - Fixed for AI messages
  downloadResponse(index: number): void {
    const message = this.messages[index];
    if (!message || message.isUser  || !message.text) return; // Only for AI (!isUser )

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
    this.showOptions = false; // New: Close options
    this.showToast('Chat restarted!');
    this.scrollToBottom();
    // Focus input after restart
    setTimeout(() => {
      if (this.textInput) {
        this.textInput.nativeElement.focus();
      }
    }, 100);
  }

  // New: Toggle options dropdown
  onShowOptions(event: MouseEvent): void {
    event.stopPropagation();
    this.showOptions = !this.showOptions;
  }

  // New: Handle option selection
  onOptionSelect(option: string): void {
    this.showOptions = false;
    switch (option) {
      case 'clear':
        this.onRestart();
        this.showToast('Chat cleared!');
        break;
      case 'new':
        // For now, same as clear; extend to navigate to new chat if needed
        this.onRestart();
        this.showToast('New chat started!');
        break;
      case 'settings':
        this.showToast('Settings: Coming soon (e.g., model selection, theme)');
        // Extend: Open settings modal or route
        console.log('Open settings');
        break;
      case 'help':
        this.showToast('Help: Ask me anything or check documentation');
        // Extend: Open help page or modal
        console.log('Open help');
        break;
      default:
        break;
    }
  }

  // Simple toast feedback (replace with MatSnackBar or similar for real UI)
  private showToast(message: string): void {
    // Mock toast: Use console for now; integrate a real toast service
    console.log(`[Toast] ${message}`);
    // Example with Angular Material (inject MatSnackBar in constructor):
    // this.snackBar.open(message, 'Close', { duration: 2000 });
  }

  // Getter for liked feedback state (use in HTML if needed; original uses direct access)
  getFeedbackLiked(id: string): boolean {
    return (this.feedbackStates[id]?.isLiked ?? false) || (this.messages.find(m => m.id === id)?.feedback?.isLiked ?? false);
  }

  // Getter for disliked feedback state (use in HTML if needed)
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
      isUser:  true,
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
    this.scrollToBottom(); // Scroll after user message

    // Add loading message for AI response
    const loadingMessageId = this.generateId();
    const loadingMessage: Message = {
      id: loadingMessageId,
      text: 'Thinking...',
      isUser : false,
      timestamp: new Date(),
      isLoading: true
    };
    this.chatService.addMessage(loadingMessage);
    this.isProcessing = true;
    this.scrollToBottom(); // Scroll after loading

    // Call API
    this.callAPI(query, loadingMessageId, files);
  }

  // API call (handles text + files) - Fixed for subsequent prompts with focus reset
  private callAPI(query: string, loadingMessageId: string, files: File[] = []): void {
    // Simple context for mock (previous user messages)
    const conversationContext = this.messages
      .filter(m => m.isUser  && m.text)
      .map(m => m.text)
      .slice(-2) // Last 2 for brevity
      .join(' | ');

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
            this.focusInput();
          },
          error: (error) => {
            this.chatService.updateMessage(loadingMessageId, {
              text: 'Sorry, something went wrong with the upload. Please try again.',
              isLoading: false
            });
            this.isProcessing = false;
            this.focusInput();
            console.error('API Error:', error);
            this.showToast('Upload error. Please try again.');
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
        this.focusInput();
        this.scrollToBottom();
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
          this.focusInput();
        },
        error: (error) => {
          this.chatService.updateMessage(loadingMessageId, {
            text: 'Sorry, something went wrong. Please try again.',
            isLoading: false
          });
          this.isProcessing = false;
          this.focusInput();
          console.error('API Error:', error);
          this.showToast('Request error. Please try again.');
        }
      });
    */

    // Mock
    this.chatService.mockAPICall(query, [], conversationContext)
      .then(response => {
        this.chatService.updateMessage(loadingMessageId, {
          text: response,
          isLoading: false
        });
        this.isProcessing = false;
        this.focusInput();
        this.scrollToBottom();
      })
      .catch(error => {
        this.chatService.updateMessage(loadingMessageId, {
          text: 'Sorry, something went wrong. Please try again.',
          isLoading: false
        });
        this.isProcessing = false;
        this.focusInput();
        this.scrollToBottom();
        console.error('API Error:', error);
        this.showToast('Request failed. Please try again.');
      });
  }

  // New: Focus input after processing (enables subsequent prompts)
  private focusInput(): void {
    setTimeout(() => {
      if (this.textInput && !this.isProcessing) {
        this.textInput.nativeElement.focus();
      }
    }, 200); // Small delay to ensure UI updates
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

  // Placeholder for expand (original log; + button is for files)
  onExpandInput(event: MouseEvent): void {
    event.stopPropagation();
    console.log('Expand clicked'); // Implement expand (e.g, full-screen input)
  }

}