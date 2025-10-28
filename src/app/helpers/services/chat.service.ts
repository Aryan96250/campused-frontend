import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface InitialChatData {
  query: string;
  files: File[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {
  private initialDataSubject = new BehaviorSubject<InitialChatData | null>(null);
  public initialData$: Observable<InitialChatData | null> = this.initialDataSubject.asObservable();

  setInitialData(query: string, files: File[] = []): void {
    this.initialDataSubject.next({ query, files });
  }

  getInitialData(): InitialChatData | null {
    return this.initialDataSubject.value;
  }

  clearInitialData(): void {
    this.initialDataSubject.next(null);
  }
}