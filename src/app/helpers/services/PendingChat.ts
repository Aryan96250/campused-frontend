import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class PendingChatService {
  private data?: { text: string; files: File[] };
  set(data: { text: string; files: File[] }) { this.data = data; }
  get(): { text: string; files: File[] } | undefined { return this.data; }
  clear() { this.data = undefined; }
}
