import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ExamRequest {
  exam: string;
  subject: string;
  difficulty: string;
  language: string;
  mode: 'mcq' | 'flashcard';
  count: number;
}

export interface MCQOption {
  opt1: string;
  opt2: string;
  opt3: string;
  opt4: string;
[key: string]: string;
}

export interface MCQQuestion {
  question: string;
  options: MCQOption;
  correct_option: string;
  explanation: string;
}

export interface FlashcardQuestion {
  question: string;
  answer: string;
  explanation: string;
}

export interface ExamResponse {
  status?: string;
  exam: string;
  subject?: string;
  difficulty: string;
  language: string;
  mode: 'mcq' | 'flashcard';
  count?: number;
  questions_answers: (MCQQuestion | FlashcardQuestion)[];
  updated_at?: string;
}

export interface ExamListItem {
  id: string;
  exam: string;
  difficulty: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Generate new exam
  generateExam(payload: ExamRequest): Observable<ExamResponse> {
    return this.http.post<ExamResponse>(
      `${this.baseUrl}/channel/exam-generation`,
      payload
    );
  }

  // List all exams
  listExams(): Observable<ExamListItem[]> {
    return this.http.get<ExamListItem[]>(
      `${this.baseUrl}/channel/list-exams`
    );
  }

  // Get specific exam by ID
  getExamById(examId: string): Observable<ExamResponse> {
    return this.http.get<ExamResponse>(
      `${this.baseUrl}/channel/exam/${examId}`
    );
  }
}