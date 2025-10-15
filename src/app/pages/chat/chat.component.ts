import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ChatService, Message, Channel } from '../../helpers/services/chat.service';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent, HeaderComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  userQuery: string = '';
  messages: Message[] = [];
  channels: Channel[] = [];
  selectedFiles: File[] = [];
  isProcessing: boolean = false;
  isDragOver: boolean = false;
  sidebarOpen: boolean = false;
  activeChannelId: string | null = null;
  isMobile: boolean = false;

  private destroy$ = new Subject<void>();
  private fileUrls: { [key: string]: string } = {};
  feedbackStates: { [key: string]: { isLiked: boolean; isDisliked: boolean } } = {};

  @ViewChild('textInput') textInput!: ElementRef<HTMLInputElement>;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private chatService: ChatService) {
    this.checkMobile();
  }

  ngOnInit(): void {
    // Subscribe to messages
    this.chatService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe((messages: Message[]) => {
        this.messages = messages;
        this.scrollToBottom();
      });

    // Subscribe to channels
    this.chatService.channels$
      .pipe(takeUntil(this.destroy$))
      .subscribe((channels: Channel[]) => {
        this.channels = channels;
      });

    // Subscribe to active channel
    this.chatService.activeChannel$
      .pipe(takeUntil(this.destroy$))
      .subscribe((channelId: string | null) => {
        this.activeChannelId = channelId;
      });

    // Initial query from home page
    this.chatService.initialQuery$
      .pipe(takeUntil(this.destroy$))
      .subscribe((query: string | undefined) => {
        if (query) {
          this.userQuery = query;
          this.onSubmitQuery();
          this.chatService.clearInitialQuery();
        }
      });

    // Load chat history (channels)
    this.chatService.loadChannels();

    // Set sidebar state based on screen size
    this.setInitialSidebarState();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
    this.setInitialSidebarState();
  }

  private checkMobile(): void {
    this.isMobile = window.innerWidth < 769;
  }

  private setInitialSidebarState(): void {
    // On desktop, sidebar is open by default
    // On mobile, sidebar is closed by default
    this.sidebarOpen = !this.isMobile;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    Object.values(this.fileUrls).forEach(url => URL.revokeObjectURL(url));
  }

  // Sidebar toggle with mobile consideration
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // Load previous channel history
  loadChannel(channelId: string): void {
    this.activeChannelId = channelId;
    this.chatService.loadChannelMessages(channelId);
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  // Create new chat
  createNewChat(): void {
    const newChannel = this.chatService.createNewChannel();
    this.activeChannelId = newChannel.id;
    this.chatService.clearMessages();
    this.chatService.setActiveChannel(newChannel.id);
    
    // Load default welcome message
    setTimeout(() => {
      this.chatService.loadChannelMessages(newChannel.id);
    }, 100);
    
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  // Submit message
  onSubmitQuery(): void {
    const query = this.userQuery.trim();
    if ((!query && this.selectedFiles.length === 0) || this.isProcessing) return;

    this.processQuery(query, [...this.selectedFiles]);
    this.userQuery = '';
    this.selectedFiles = [];
    this.fileUrls = {};
  }

  // File selection
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        this.showToast(`File "${file.name}" is too large (max 10MB)`);
        continue;
      }
      this.selectedFiles.push(file);
    }

    event.target.value = '';
  }

  // Remove selected file
  removeSelectedFile(index: number): void {
    const file = this.selectedFiles[index];
    if (file) {
      const url = this.createPreviewUrl(file);
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
        delete this.fileUrls[file.name];
      }
    }
    this.selectedFiles.splice(index, 1);
  }

  // Drag & drop handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
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
      const mockEvent = { target: { files: files } } as any;
      this.onFileSelected(mockEvent);
    }
  }

  // Handle Enter key
  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmitQuery();
    }
  }

  // Core process query logic
  private processQuery(query: string, files: File[] = []): void {
    const userMessage: Message = {
      id: this.generateId(),
      text: query || undefined,
      files: files.length > 0 ? files : undefined,
      fileUrls: {},
      isUser: true,
      timestamp: new Date(),
      isSent: true
    };

    if (files.length > 0) {
      files.forEach(file => {
        userMessage.fileUrls![file.name] = this.createPreviewUrl(file);
      });
    }

    this.chatService.addMessage(userMessage);
    this.scrollToBottom();

    const loadingMessageId = this.generateId();
    const loadingMessage: Message = {
      id: loadingMessageId,
      text: 'Thinking...',
      isUser: false,
      timestamp: new Date(),
      isLoading: true
    };
    this.chatService.addMessage(loadingMessage);
    this.isProcessing = true;
    this.scrollToBottom();

    // Use static service method
    this.chatService.sendMessage(this.activeChannelId, query, files).subscribe({
      next: (response: any) => {
        const aiResponse = response?.data?.response || 'Response received';
        
        this.chatService.updateMessage(loadingMessageId, {
          text: aiResponse,
          isLoading: false
        });

        this.isProcessing = false;
        this.focusInput();
        this.scrollToBottom();
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.chatService.updateMessage(loadingMessageId, {
          text: 'Sorry, something went wrong. Please try again.',
          isLoading: false
        });
        this.isProcessing = false;
        this.focusInput();
        this.scrollToBottom();
        this.showToast('Request failed');
      }
    });
  }

  // Helpers
  public createPreviewUrl(file: File): string {
    if (!file) return '';
    const existingUrl = this.fileUrls[file.name];
    if (existingUrl) return existingUrl;
    const url = URL.createObjectURL(file);
    this.fileUrls[file.name] = url;
    return url;
  }

  isImageFile(file: any): boolean {
    return file && file.type && file.type.startsWith('image/');
  }

  private focusInput(): void {
    setTimeout(() => {
      if (this.textInput && !this.isProcessing) {
        this.textInput.nativeElement.focus();
      }
    }, 200);
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  private showToast(message: string): void {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--error);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Feedback helpers
  getFeedbackLiked(messageId: string): boolean {
    return this.feedbackStates[messageId]?.isLiked || false;
  }

  getFeedbackDisliked(messageId: string): boolean {
    return this.feedbackStates[messageId]?.isDisliked || false;
  }

  formatTimestamp(timestamp: string | Date): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  copyMessage(message: Message): void {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      this.showToast('Copied to clipboard!');
    }
  }

  toggleFeedback(messageId: string, isLike: boolean): void {
    if (!this.feedbackStates[messageId]) {
      this.feedbackStates[messageId] = { isLiked: false, isDisliked: false };
    }

    if (isLike) {
      this.feedbackStates[messageId].isLiked = !this.feedbackStates[messageId].isLiked;
      if (this.feedbackStates[messageId].isLiked)
        this.feedbackStates[messageId].isDisliked = false;
    } else {
      this.feedbackStates[messageId].isDisliked = !this.feedbackStates[messageId].isDisliked;
      if (this.feedbackStates[messageId].isDisliked)
        this.feedbackStates[messageId].isLiked = false;
    }
  }
}