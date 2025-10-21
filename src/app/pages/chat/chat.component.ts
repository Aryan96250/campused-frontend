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

interface ChatMsg {
  text: string;
  isUser: boolean;
  timestamp: number;
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
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
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

  @ViewChild('filePicker') filePicker!: ElementRef<HTMLInputElement>;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private api: ApiService,
    private chatStateService: ChatStateService
  ) {}

  ngOnInit() {
    this.subscribeToInitialData();
    this.refreshChannels();
  }

  private subscribeToInitialData(): void {
    this.chatStateService.initialData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data:any) => {
        if (data && (data.query.trim() || data.files.length > 0)) {
          this.hasInitialData = true;
          this.userQuery = data.query;
          this.pendingFiles = data.files;
          this.generateFilePreviews();
          
          // Auto-submit the initial message after a short delay
          queueMicrotask(() => {
            this.onSubmitQuery();
            this.chatStateService.clearInitialData();
          });
        }
      });
  }

  refreshChannels() {
    this.api.listChannels().subscribe((list: any) => {
      this.channels = list ?? [];
      
      // Only auto-load a channel if we don't have initial data to send
      if (!this.hasInitialData && !this.activeChannelId && this.channels.length) {
        this.loadChannel(this.channels[0].id);
      }
    });
  }

  loadChannel(id: string) {
    this.activeChannelId = id;
    this.api.getChannel(id).subscribe((payload: any) => {
      const conv = payload?.conversation ?? [];
      this.messages = conv.map((m: any) => ({
        text: m?.content ?? m?.text ?? '',
        isUser: m?.role === 'user',
        timestamp: Date.now(),
      }));
      queueMicrotask(() => this.scrollToBottom());
    });
    this.mobileSidebarOpen = false;
  }

  createNewChat() {
    this.activeChannelId = null;
    this.messages = [];
    this.userQuery = '';
    this.pendingFiles = [];
    this.clearFilePreviews();
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

    if (q) this.messages.push({ text: q, isUser: true, timestamp: Date.now() });

    this.assistantTypingIndex = this.messages.push({
      text: 'typing',
      isUser: false,
      timestamp: Date.now(),
    }) - 1;

    this.isProcessing = true;
    const files = this.pendingFiles.slice();

    const send$ = this.activeChannelId
      ? this.api.sendMessageMultipart(this.activeChannelId, q, files)
      : this.api.sendFirstMessage(q, files);
    if(this.activeChannelId){
      this.refreshChannels();
    }
    send$
      .pipe(
        finalize(() => {
          this.isProcessing = false;
          this.pendingFiles = [];
          this.clearFilePreviews();
          this.userQuery = '';
          this.scrollToBottom();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((res: any) => {
        if (!this.activeChannelId && res?.channel_id) {
          this.activeChannelId = res.channel_id;
          this.channels.unshift({ id: res.channel_id, title: res?.title || 'new chat' });
        }

        const texts: string[] = [];
        if (Array.isArray(res?.messages)) {
          for (const m of res.messages) {
            const t = m?.content ?? m?.text ?? m?.message ?? '';
            if (t) texts.push(t);
          }
        } else if (res?.message || res?.content || res?.text) {
          texts.push(res.message ?? res.content ?? res.text);
        } else if (res?.data?.content || res?.data?.text) {
          texts.push(res.data.content ?? res.data.text);
        } else if (Array.isArray(res?.conversation)) {
          this.messages = res.conversation.map((m: any) => ({
            text: m?.content ?? m?.text ?? '',
            isUser: m?.role === 'user',
            timestamp: Date.now(),
          }));
          this.assistantTypingIndex = null;
          queueMicrotask(() => this.scrollToBottom());
          return;
        }

        if (this.assistantTypingIndex != null && texts.length) {
          this.messages[this.assistantTypingIndex] = {
            text: texts.shift()!,
            isUser: false,
            timestamp: Date.now(),
          };
          this.assistantTypingIndex = null;
        } else if (this.assistantTypingIndex != null) {
          this.messages.splice(this.assistantTypingIndex, 1);
          this.assistantTypingIndex = null;
        }

        for (const t of texts) {
          this.messages.push({ text: t, isUser: false, timestamp: Date.now() });
        }

        queueMicrotask(() => this.scrollToBottom());
      }, _err => {
        if (this.assistantTypingIndex != null) {
          this.messages.splice(this.assistantTypingIndex, 1);
          this.assistantTypingIndex = null;
        }
      });
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
    this.showToast(`Message ${kind}d`, 'info');
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
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 50);
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