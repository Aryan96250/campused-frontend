import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../helpers/services/apiService';
import { ChatStateService } from '../../helpers/services/chat.service';
import { finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ActivatedRoute, Router } from '@angular/router';

interface ChatMsg {
  text: string;
  isUser: boolean;
  timestamp: number;
  files?: MessageFile[];
  liked?: boolean | null;
}

interface MessageFile {
  name: string;
  url: string;
  type: string;
}

interface FilePreview {
  file: File;
  previewUrl?: string;
  isImage: boolean;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [CommonModule, FormsModule, HeaderComponent],
  standalone: true,
})
export class ChatComponent implements OnInit, OnDestroy {
  channels: Array<{ id: string; title: string }> = [];
  activeChannelId: string | null = null;
  messages: ChatMsg[] = [];
  userQuery = '';
  mobileSidebarOpen = false;
  isProcessing = false;
  pendingFiles: File[] = [];
  filePreviews: FilePreview[] = [];
  assistantTypingIndex: number | null = null;
  toastMsg: { text: string; type: 'info'|'success'|'error' } | null = null;
  private toastTimer: any = null;
  private destroy$ = new Subject<void>();
  private hasInitialData = false;
  submitTure = true;
  private isInitializing = true;
  private hasProcessedInitialData = false;
  private isRefreshingChannels = false;
  private pendingChannelRefresh = false; // NEW: Flag to defer channel refresh
  private channelsRefreshed = false; // NEW: Flag to prevent multiple refresh calls

  @ViewChild('filePicker') filePicker!: ElementRef<HTMLInputElement>;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private api: ApiService,
    private chatStateService: ChatStateService,
    private route: ActivatedRoute,
    private router: Router 
  ) {}

  ngOnInit() {
    this.subscribeToInitialData();
    // Prevent multiple refresh calls
    if (!this.channelsRefreshed) {
      this.channelsRefreshed = true;
      this.refreshChannels().then(() => {
        this.route.params.subscribe(params => {
          if (this.isInitializing) {
            this.isInitializing = false;
            const channelId = params['channelId'];
            if (channelId && this.channels.some(c => c.id === channelId)) {
              this.loadChannel(channelId);
            } else if (!this.hasProcessedInitialData) {
              // Don't create new chat here if we're processing initial data
              // The subscribeToInitialData will handle it
              if (!this.hasInitialData) {
                this.createNewChat();
              }
            }
          }
        });
      });
    }
  }

  private subscribeToInitialData(): void {
    this.chatStateService.initialData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data:any) => {
        if (data && (data.query.trim() || data.files.length > 0) && !this.hasProcessedInitialData) {
          this.hasProcessedInitialData = true;
          this.hasInitialData = true;
          this.userQuery = data.query;
          this.pendingFiles = data.files;
          this.generateFilePreviews();
          
          // Don't refresh channels before sending initial message
          // This prevents the UI flicker
          queueMicrotask(() => {
            this.onSubmitQuery();
            this.chatStateService.clearInitialData();
          });
        }
      });
  }

  private async refreshChannels(): Promise<void> {
    // Prevent multiple simultaneous refresh calls
    if (this.isRefreshingChannels) {
      this.pendingChannelRefresh = true;
      return Promise.resolve();
    }

    this.isRefreshingChannels = true;
    this.pendingChannelRefresh = false;
    
    return new Promise((resolve) => {
      this.api.listChannels().subscribe({
        next: (list: any) => {
          this.channels = list ?? [];
          this.isRefreshingChannels = false;
          
          // If there was a pending refresh request, execute it now
          if (this.pendingChannelRefresh) {
            this.pendingChannelRefresh = false;
            setTimeout(() => this.refreshChannels(), 100);
          }
          
          resolve();
        },
        error: () => {
          this.isRefreshingChannels = false;
          resolve();
        }
      });
    });
  }

  loadChannel(id: string) {
    this.activeChannelId = id;
    this.api.getChannel(id).subscribe((payload: any) => {
      const conv = payload?.conversation ?? [];
      this.messages = conv
        .filter((m: any) => m?.role !== 'system')
        .map((m: any) => ({
          text: m?.content ?? m?.text ?? '',
          isUser: m?.role === 'user',
          timestamp: Date.now(),
          files: this.parseMessageFiles(m),
          liked: m?.liked ?? null
        }));
      queueMicrotask(() => this.scrollToBottom());
    });
    this.mobileSidebarOpen = false;
    this.router.navigate(['/chat', id], { replaceUrl: true });
  }

  private parseMessageFiles(message: any): MessageFile[] {
    const files: MessageFile[] = [];
    
    if (message?.files && Array.isArray(message.files)) {
      message.files.forEach((file: any) => {
        if (typeof file === 'string') {
          files.push({
            name: this.getFileNameFromUrl(file),
            url: file,
            type: this.getFileTypeFromUrl(file)
          });
        } else if (file?.url) {
          files.push({
            name: file.name || this.getFileNameFromUrl(file.url),
            url: file.url,
            type: file.type || this.getFileTypeFromUrl(file.url)
          });
        }
      });
    }
    
    return files;
  }

  private getFileNameFromUrl(url: string): string {
    return url.split('/').pop() || 'file';
  }

  private getFileTypeFromUrl(url: string): string {
    const ext = url.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'document';
    if (['xls', 'xlsx'].includes(ext)) return 'spreadsheet';
    return 'file';
  }

  getFileIcon(type: string): string {
    switch(type) {
      case 'pdf': return 'M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z';
      case 'document': return 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z';
      default: return 'M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z';
    }
  }

  createNewChat() {
    this.activeChannelId = null;
    this.messages = [];
    this.userQuery = '';
    this.pendingFiles = [];
    this.clearFilePreviews();
    this.router.navigate(['/chat'], { replaceUrl: true });
  }

  handleEnter(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        if (!this.isProcessing) this.onSubmitQuery();
      }
    }
  }

  openFileDialog() {
    this.filePicker.nativeElement.click();
  }

  onFilesSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (input.files?.length) {
      this.pendingFiles = Array.from(input.files);
      this.generateFilePreviews();
    }
  }

  generateFilePreviews() {
    this.clearFilePreviews();
    
    this.pendingFiles.forEach(file => {
      const isImage = file.type.startsWith('image/');
      const preview: FilePreview = { file, isImage };

      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          preview.previewUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      }

      this.filePreviews.push(preview);
    });
  }

  removeFilePreview(index: number) {
    this.filePreviews.splice(index, 1);
    this.pendingFiles.splice(index, 1);
    
    if (this.pendingFiles.length === 0) {
      this.filePicker.nativeElement.value = '';
    }
  }

  clearFilePreviews() {
    this.filePreviews.forEach(preview => {
      if (preview.previewUrl) {
        URL.revokeObjectURL(preview.previewUrl);
      }
    });
    this.filePreviews = [];
  }

  onSubmitQuery() {
    const q = (this.userQuery ?? '').trim();
    if (!q && this.pendingFiles.length === 0) return;

    const userFiles: MessageFile[] = this.pendingFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 
            file.type === 'application/pdf' ? 'pdf' :
            file.name.endsWith('.doc') || file.name.endsWith('.docx') ? 'document' :
            file.name.endsWith('.xls') || file.name.endsWith('.xlsx') ? 'spreadsheet' : 'file'
    }));

    if (q || userFiles.length > 0) {
      this.messages.push({ 
        text: q || '(File upload)', 
        isUser: true, 
        timestamp: Date.now(),
        files: userFiles.length > 0 ? userFiles : []
      });
    }

    this.assistantTypingIndex = this.messages.push({
      text: 'typing',
      isUser: false,
      timestamp: Date.now(),
    }) - 1;

    queueMicrotask(() => this.scrollToBottom());

    this.isProcessing = true;
    const files = this.pendingFiles.slice();
    const queryToSend = q;
    const wasNewChat = !this.activeChannelId;

    this.userQuery = '';
    this.pendingFiles = [];
    this.clearFilePreviews();

    const send$ = this.activeChannelId
      ? this.api.sendMessageMultipart(this.activeChannelId, queryToSend, files)
      : this.api.sendFirstMessage(queryToSend, files);
    
    send$
      .pipe(
        finalize(() => {
          this.isProcessing = false;
          setTimeout(() => this.scrollToBottom(), 100);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((res: any) => {
        // Debug log to track response
        console.log('API Response:', res);
        
        // Handle new channel creation
        if (wasNewChat && res?.channel_id) {
          this.activeChannelId = res.channel_id;
          
          // Add to channels list immediately with the response title
          const newChannel = { 
            id: res.channel_id, 
            title: res?.title || res?.channel_title || 'New Chat' 
          };
          
          // Check if channel already exists to avoid duplicates
          if (!this.channels.some(c => c.id === newChannel.id)) {
            this.channels.unshift(newChannel);
          }
          
          // Update URL without reloading
          this.router.navigate(['/chat', res.channel_id], { replaceUrl: true });
          
          // Process the response
          this.processApiResponse(res, wasNewChat);
          
          // REMOVE: No need to refresh channels here, as it's already added with the correct title
          // setTimeout(() => {
          //   this.refreshChannels();
          // }, 1000);
        } else {
          // For existing chats, process response immediately
          this.processApiResponse(res, wasNewChat);
        }
      }, _err => {
        console.error('API Error:', _err);
        if (this.assistantTypingIndex != null) {
          this.messages.splice(this.assistantTypingIndex, 1);
          this.assistantTypingIndex = null;
        }
        this.showToast('Failed to send message', 'error');
      });
  }

  private processApiResponse(res: any, wasNewChat: boolean) {
    const texts: string[] = [];
    const responseFiles: MessageFile[] = [];
    
    // Check if response contains full conversation array
    if (Array.isArray(res?.conversation) && res.conversation.length > 0) {
      const filteredConversation = res.conversation.filter((m: any) => m?.role !== 'system');
      
      // For new chats, NEVER replace messages to avoid flicker – always process incrementally
      if (wasNewChat) {
        // Extract only the assistant's response (last assistant message)
        const lastAssistantMsg = filteredConversation
          .filter((m: any) => m?.role === 'assistant')
          .pop();
        
        if (lastAssistantMsg) {
          texts.push(lastAssistantMsg?.content ?? lastAssistantMsg?.text ?? '');
          if (lastAssistantMsg?.files) {
            responseFiles.push(...this.parseMessageFiles(lastAssistantMsg));
          }
        }
      } else {
        // For existing chats, check if we should replace all messages
        const currentNonTypingCount = this.messages.filter(m => m.text !== 'typing').length;
        const shouldReplaceAll = filteredConversation.length > currentNonTypingCount;
        
        if (shouldReplaceAll) {
          // Remove typing indicator if exists
          if (this.assistantTypingIndex !== null) {
            this.messages.splice(this.assistantTypingIndex, 1);
            this.assistantTypingIndex = null;
          }
          
          // Replace with full conversation
          this.messages = filteredConversation.map((m: any) => ({
            text: m?.content ?? m?.text ?? '',
            isUser: m?.role === 'user',
            timestamp: Date.now(),
            files: this.parseMessageFiles(m),
            liked: m?.liked ?? null
          }));
          queueMicrotask(() => this.scrollToBottom());
          return;
        }
      }
    }
    
    // Parse individual message responses if we haven't extracted from conversation
    if (texts.length === 0) {
      if (Array.isArray(res?.messages)) {
        for (const m of res.messages) {
          const t = m?.content ?? m?.text ?? m?.message ?? '';
          if (t) texts.push(t);
          if (m?.files) responseFiles.push(...this.parseMessageFiles(m));
        }
      } else if (res?.message || res?.content || res?.text) {
        texts.push(res.message ?? res.content ?? res.text);
        if (res?.files) responseFiles.push(...this.parseMessageFiles(res));
      } else if (res?.data?.content || res?.data?.text) {
        texts.push(res.data.content ?? res.data.text);
        if (res?.data?.files) responseFiles.push(...this.parseMessageFiles(res.data));
      }
    }

    // Update or remove typing indicator
    if (this.assistantTypingIndex != null) {
      if (texts.length > 0) {
        this.messages[this.assistantTypingIndex] = {
          text: texts.shift()!,
          isUser: false,
          timestamp: Date.now(),
          files: responseFiles.length > 0 ? responseFiles : undefined,
          liked: null
        };
      } else {
        this.messages.splice(this.assistantTypingIndex, 1);
      }
      this.assistantTypingIndex = null;
    }

    // Add any additional messages
    for (const t of texts) {
      this.messages.push({ 
        text: t, 
        isUser: false,
        timestamp: Date.now(),
        files: responseFiles.length > 0 ? responseFiles : undefined,
        liked: null
      });
    }

    queueMicrotask(() => this.scrollToBottom());
  }

  async copyMessage(text: string) {
    await navigator.clipboard.writeText(text ?? '');
    this.showToast('Copied to clipboard', 'success');
  }

  downloadMessage(text: string, index: number) {
    const blob = new Blob([text ?? ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-${index + 1}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast('Message downloaded', 'success');
  }

  rateMessage(index: number, kind: 'like' | 'dislike') {
    const message = this.messages[index];
    if (!message || message.isUser) return;

    if (kind === 'like') {
      message.liked = message.liked === true ? null : true;
    } else {
      message.liked = message.liked === false ? null : false;
    }

    this.showToast(`Message ${message.liked === true ? 'liked' : message.liked === false ? 'disliked' : 'rating removed'}`, 'info');
  }

  regenerateMessage(index: number) {
    const message = this.messages[index];
    if (!message || message.isUser) return;

    let userMessageIndex = -1;
    for (let i = index - 1; i >= 0; i--) {
      if (this.messages[i].isUser) {
        userMessageIndex = i;
        break;
      }
    }

    if (userMessageIndex === -1) return;

    const userMessage = this.messages[userMessageIndex];
    this.userQuery = userMessage.text;

    this.messages.splice(userMessageIndex + 1);

    this.onSubmitQuery();
  }

   formatTimestamp(ts: number) {
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  private scrollToBottom() {
    const el = this.messagesContainer?.nativeElement;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }

  private showToast(text: string, type: 'info'|'success'|'error' = 'success') {
    this.toastMsg = { text, type };
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toastMsg = null), 2500);
  }

  ngOnDestroy() {
    this.clearFilePreviews();
    this.destroy$.next();
    this.destroy$.complete();
  }
}