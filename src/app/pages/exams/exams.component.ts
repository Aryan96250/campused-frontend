import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { HeaderComponent } from '../header/header.component';
import { ExamService, ExamRequest, ExamResponse, MCQQuestion, FlashcardQuestion, ExamListItem } from '../../helpers/services/exam.service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../helpers/services/apiService';
import { TokenService } from '../../helpers/services/token.service';

interface ExamOption {
  value: string;
  label: string;
}

interface Exam {
  id: string;
  name: string;
  fullName: string;
  description: string;
  color: string;
  bgColor: string;
  subjects?: ExamOption[];
  levels?: ExamOption[];
  languages?: ExamOption[];
  modes?: ExamOption[];
}

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './exams.component.html',
  styleUrls: ['./exams.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('0.3s ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ExamsComponent implements OnInit {
  selectedExam: string | null = null;
  
  selectedSubject: string = '';
  selectedLevel: string = '';
  selectedLanguage: string = '';
  selectedMode: string = '';

  isLoading: boolean = false;
  showResults: boolean = false;
  examResults: ExamResponse | null = null;
  currentQuestionIndex: number = 0;
  selectedAnswer: string = '';
  showFlashcardAnswer: boolean = false;

  // Sidebar state
  isSidebarOpen: boolean = false;
  savedExams: ExamListItem[] = [];
  isLoadingExams: boolean = false;
  showResultsSummary: boolean = false;
userAnswers: Map<number, string> = new Map(); // Track user answers for each question


  exams: Exam[] = [
    {
      id: 'upsc',
      name: 'UPSC',
      fullName: 'Civil Services Examination (CSE)',
      description: `Graduates aiming for IAS, IPS, IFS etc`,
      color: '#fff',
      bgColor: '#9F7DCD',
      subjects: [
        { value: 'General Studies Paper I', label: 'General Studies Paper I' },
        { value: 'CSAT (General Studies Paper II)', label: 'CSAT (General Studies Paper II)' },
        { value: 'General Studies Paper III', label: 'General Studies Paper III' },
        { value: 'General Studies Paper IV', label: 'General Studies Paper IV' },
        { value: 'Optional Subject Paper I', label: 'Optional Subject Paper I' },
        { value: 'Optional Subject Paper II', label: 'Optional Subject Paper II' },
        { value: 'Language Paper (Indian Language)', label: 'Language Paper (Indian Language)' },
        { value: 'English Language Paper', label: 'English Language Paper' }
      ],
      levels: [
        { value: 'easy', label: 'Easy' },
        { value: 'medium', label: 'Medium' },
        { value: 'hard', label: 'Hard' }
      ],
      languages: [
        { value: 'english', label: 'English' },
        { value: 'hindi', label: 'Hindi' }
      ],
      modes: [
        { value: 'flashcard', label: 'Flash Card' },
        { value: 'mcq', label: 'MCQ Questions' }
      ]
    },
    {
      id: 'jee',
      name: 'JEE',
      fullName: 'Main & Advanced',
      description: 'Class 12/12+ students wanting Engineer (IIT/NIT)',
      color: '#fff',
      bgColor: '#9F7DCD',
      subjects: [
        { value: 'Physics', label: 'Physics' },
        { value: 'Chemistry', label: 'Chemistry' },
        { value: 'Mathematics', label: 'Mathematics' }
      ],
      levels: [
        { value: 'easy', label: 'Easy' },
        { value: 'medium', label: 'Medium' },
        { value: 'hard', label: 'Hard' }
      ],
      languages: [
        { value: 'english', label: 'English' },
        { value: 'hindi', label: 'Hindi' }
      ],
      modes: [
        { value: 'flashcard', label: 'Flash Card' },
        { value: 'mcq', label: 'MCQ Questions' }
      ]
    },
    {
      id: 'neet',
      name: 'NEET UG',
      fullName: 'Medical Students',
      description: 'Class 12/12+ students aiming for MBBS/BDS, and Allied',
      color: '#fff',
      bgColor: '#9F7DCD',
      subjects: [
        { value: 'Physics', label: 'Physics' },
        { value: 'Chemistry', label: 'Chemistry' },
        { value: 'Biology', label: 'Biology (Botany + Zoology)' }
      ],
      levels: [
        { value: 'easy', label: 'Easy' },
        { value: 'medium', label: 'Medium' },
        { value: 'hard', label: 'Hard' }
      ],
      languages: [
        { value: 'english', label: 'English' },
        { value: 'hindi', label: 'Hindi' }
      ],
      modes: [
        { value: 'flashcard', label: 'Flash Card' },
        { value: 'mcq', label: 'MCQ Questions' }
      ]
    },
    {
      id: 'clat',
      name: 'CLAT',
      fullName: 'Common Law Admission Test',
      description: 'Students wanting law (NLUs, Top Law Schools)',
      color: '#fff',
      bgColor: '#9F7DCD',
      subjects: [
        { value: 'English Language', label: 'English Language' },
        { value: 'Current Affairs & General Knowledge', label: 'Current Affairs & General Knowledge' },
        { value: 'Legal Reasoning', label: 'Legal Reasoning' },
        { value: 'Logical Reasoning', label: 'Logical Reasoning' },
        { value: 'Quantitative Techniques (Basic Mathematics)', label: 'Quantitative Techniques (Basic Mathematics)' }
      ],
      levels: [
        { value: 'easy', label: 'Easy' },
        { value: 'medium', label: 'Medium' },
        { value: 'hard', label: 'Hard' }
      ],
      languages: [
        { value: 'english', label: 'English' },
        { value: 'hindi', label: 'Hindi' }
      ],
      modes: [
        { value: 'flashcard', label: 'Flash Card' },
        { value: 'mcq', label: 'MCQ Questions' }
      ]
    },
    {
      id: 'gate',
      name: 'GATE',
      fullName: 'Graduate Aptitude Test in Engineering',
      description: 'Engineering Graduates Seeking PG or PSU Jobs',
      color: '#fff',
      bgColor: '#9F7DCD',
      subjects: [
        { value: 'Computer Science and Information Technology (CS)', label: 'Computer Science and Information Technology (CS)' },
        { value: 'Electronics and Communication Engineering (EC)', label: 'Electronics and Communication Engineering (EC)' },
        { value: 'Electrical Engineering (EE)', label: 'Electrical Engineering (EE)' },
        { value: 'Mechanical Engineering (ME)', label: 'Mechanical Engineering (ME)' },
        { value: 'Civil Engineering (CE)', label: 'Civil Engineering (CE)' }
      ],
      levels: [
        { value: 'easy', label: 'Easy' },
        { value: 'medium', label: 'Medium' },
        { value: 'hard', label: 'Hard' }
      ],
      languages: [
        { value: 'english', label: 'English' },
        { value: 'hindi', label: 'Hindi' }
      ],
      modes: [
        { value: 'flashcard', label: 'Flash Card' },
        { value: 'mcq', label: 'MCQ Questions' }
      ]
    },
    {
      id: 'cat',
      name: 'CAT',
      fullName: 'Common Admission Test',
      description: 'Graduates aiming for MBA/ PGDM (IIMs & Others)',
      color: '#fff',
      bgColor: '#9F7DCD',
      subjects: [
        { value: 'Verbal Ability and Reading Comprehension', label: 'Verbal Ability and Reading Comprehension' },
        { value: 'Data Interpretation and Logical Reasoning', label: 'Data Interpretation and Logical Reasoning' },
        { value: 'Quantitative Ability', label: 'Quantitative Ability' }
      ],
      levels: [
        { value: 'easy', label: 'Easy' },
        { value: 'medium', label: 'Medium' },
        { value: 'hard', label: 'Hard' }
      ],
      languages: [
        { value: 'english', label: 'English' },
        { value: 'hindi', label: 'Hindi' }
      ],
      modes: [
        { value: 'flashcard', label: 'Flash Card' },
        { value: 'mcq', label: 'MCQ Questions' }
      ]
    }
  ];

  constructor(
    private examService: ExamService,
    private toastr: ToastrService,
    private api: ApiService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.loadSavedExams();
    this.fetchTokenCredits()
  }

  // Sidebar methods
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.isSidebarOpen) {
      this.loadSavedExams();
    }
  }


   private fetchTokenCredits(): void {
    this.api.getUserCredits().subscribe({
      next: (response: any) => {
        if (response) {
          this.tokenService.updateFullInfo({
            total_tokens: response.total_tokens || 0,
            used_tokens: response.used_tokens || 0,
            remaining_tokens: response.remaining_tokens || 0,
            last_updated: new Date().toISOString()
          });
        }
      },
      error: (error) => {
        console.error('Failed to fetch token credits', error);
      }
    });
  }
  loadSavedExams(): void {
    this.isLoadingExams = true;
    this.examService.listExams().subscribe({
      next: (exams) => {
        this.savedExams = exams;
        this.isLoadingExams = false;
      },
      error: (error) => {
        console.error('Error loading exams:', error);
        this.toastr.error('Failed to load saved exams');
        this.isLoadingExams = false;
      }
    });
  }

  loadExamById(examId: string): void {
    this.isLoading = true;
    this.examService.getExamById(examId).subscribe({
      next: (response) => {
        this.examResults = response;
        this.showResults = true;
        this.currentQuestionIndex = 0;
        this.selectedAnswer = '';
        this.showFlashcardAnswer = false;
        this.isLoading = false;
        this.isSidebarOpen = false;
        this.toastr.success('Exam loaded successfully!');
      },
      error: (error) => {
        console.error('Error loading exam:', error);
        this.toastr.error('Failed to load exam');
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  selectExam(examId: string): void {
    this.selectedExam = this.selectedExam === examId ? null : examId;
    this.resetForm();
  }

  resetForm(): void {
    this.selectedSubject = '';
    this.selectedLevel = '';
    this.selectedLanguage = '';
    this.selectedMode = '';
    this.showResults = false;
    this.examResults = null;
    this.currentQuestionIndex = 0;
    this.selectedAnswer = '';
    this.showFlashcardAnswer = false;
  }

  getSelectedExam(): Exam | undefined {
    return this.exams.find(exam => exam.id === this.selectedExam);
  }

  canSubmit(): boolean {
    return !!(this.selectedSubject && this.selectedLevel && this.selectedLanguage && this.selectedMode);
  }

  handleSubmit(): void {
    if (!this.canSubmit()) return;

    const exam = this.getSelectedExam();
    if (!exam) return;

    const count = this.selectedMode === 'mcq' ? 10 : 20;

    const payload: ExamRequest = {
      exam: exam.name,
      subject: this.selectedSubject,
      difficulty: this.selectedLevel,
      language: this.selectedLanguage,
      mode: this.selectedMode as 'mcq' | 'flashcard',
      count: count
    };

    this.isLoading = true;

    this.examService.generateExam(payload).subscribe({
      next: (response: any) => {
        this.examResults = response;
        this.showResults = true;
        this.isLoading = false;
        this.toastr.success('Exam generated successfully!');
        this.fetchTokenCredits();
        this.loadSavedExams(); // Refresh the saved exams list
      },
      error: (error: any) => {
        console.error('Error generating exam:', error);
        this.toastr.error('Failed to generate exam. Please try again.');
        this.isLoading = false;
      }
    });
  }

  isMCQQuestion(question: any): question is MCQQuestion {
    return question && 'options' in question && 'correct_option' in question;
  }

  isFlashcardQuestion(question: any): question is FlashcardQuestion {
    return question && 'answer' in question && !('options' in question);
  }

  getCurrentMCQQuestion(): MCQQuestion | null {
    if (!this.examResults || !this.examResults.questions_answers[this.currentQuestionIndex]) {
      return null;
    }
    const question = this.examResults.questions_answers[this.currentQuestionIndex];
    return this.isMCQQuestion(question) ? question : null;
  }

  getCurrentFlashcardQuestion(): FlashcardQuestion | null {
    if (!this.examResults || !this.examResults.questions_answers[this.currentQuestionIndex]) {
      return null;
    }
    const question = this.examResults.questions_answers[this.currentQuestionIndex];
    return this.isFlashcardQuestion(question) ? question : null;
  }

selectMCQOption(option: string): void {
  if (!this.selectedAnswer) {
    this.selectedAnswer = option;
    this.userAnswers.set(this.currentQuestionIndex, option);
  }
}

  isCorrectOption(optionIndex: number, question: MCQQuestion): boolean {
    return (optionIndex + 1).toString() === question.correct_option;
  }

  isSelectedOption(optionIndex: number): boolean {
    return this.selectedAnswer === (optionIndex + 1).toString();
  }

  isIncorrectOption(optionIndex: number, question: MCQQuestion): boolean {
    return this.isSelectedOption(optionIndex) && 
           !this.isCorrectOption(optionIndex, question) && 
           !!this.selectedAnswer;
  }

  toggleFlashcardAnswer(): void {
    this.showFlashcardAnswer = !this.showFlashcardAnswer;
  }

nextQuestion(): void {
  if (this.examResults && this.currentQuestionIndex < this.examResults.questions_answers.length - 1) {
    this.currentQuestionIndex++;
    // Restore previously selected answer if it exists
    this.selectedAnswer = this.userAnswers.get(this.currentQuestionIndex) || '';
    this.showFlashcardAnswer = false;
  } else if (this.examResults && this.examResults.mode === 'mcq') {
    // Show results summary when reaching the end in MCQ mode
    this.showResultsSummary = true;
  }
}

previousQuestion(): void {
  if (this.currentQuestionIndex > 0) {
    this.currentQuestionIndex--;
    // Restore previously selected answer if it exists
    this.selectedAnswer = this.userAnswers.get(this.currentQuestionIndex) || '';
    this.showFlashcardAnswer = false;
  }
}

calculateScore(): { correct: number; incorrect: number; total: number; percentage: number } {
  let correct = 0;
  let incorrect = 0;
  
  if (!this.examResults) {
    return { correct: 0, incorrect: 0, total: 0, percentage: 0 };
  }

  this.examResults.questions_answers.forEach((question, index) => {
    if (this.isMCQQuestion(question)) {
      const userAnswer = this.userAnswers.get(index);
      if (userAnswer === question.correct_option) {
        correct++;
      } else if (userAnswer) {
        incorrect++;
      }
    }
  });

  const total = this.examResults.questions_answers.length;
  const percentage = total > 0 ? (correct / total) * 100 : 0;

  return { correct, incorrect, total, percentage };
}

isPassed(): boolean {
  const score = this.calculateScore();
  return score.percentage >= 40; // 40% passing criteria
}

backToForm(): void {
  this.showResults = false;
  this.examResults = null;
  this.currentQuestionIndex = 0;
  this.selectedAnswer = '';
  this.showFlashcardAnswer = false;
  this.showResultsSummary = false;
  this.userAnswers.clear();
}

restartExam(): void {
  this.currentQuestionIndex = 0;
  this.selectedAnswer = '';
  this.showFlashcardAnswer = false;
  this.showResultsSummary = false;
  this.userAnswers.clear();
}

reviewAnswers(): void {
  this.showResultsSummary = false;
  this.currentQuestionIndex = 0;
  this.selectedAnswer = this.userAnswers.get(0) || '';
}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.showResults) return;
    
    const target = event.target as HTMLElement;
    if (!target.closest('.exam-card') && !target.closest('.sidebar') && !target.closest('.sidebar-toggle')) {
      if (this.selectedExam && !target.closest('.form-select')) {
        // Don't close if clicking on dropdowns
        return;
      }
    }
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }
}