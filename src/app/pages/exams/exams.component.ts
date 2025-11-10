import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { HeaderComponent } from '../header/header.component';

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
    trigger('expandCard', [
      state('collapsed', style({
        gridColumn: 'span 1',
        background: 'inherit',
        color: 'inherit'
      })),
      state('expanded', style({
        gridColumn: 'span 2',
        background: ' #9F7DCD' ,
        color: '#FFFFFF'
      })),
      transition('collapsed <=> expanded', animate('0.5s ease-in-out'))
    ]),
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0',
        opacity: '0',
        overflow: 'hidden'
      })),
      state('expanded', style({
        height: '*',
        opacity: '1',
        overflow: 'visible'
      })),
      transition('collapsed <=> expanded', animate('300ms ease-in-out'))
    ])
  ]
})
export class ExamsComponent {
  selectedExam: string | null = null;
  
  selectedSubject: string = '';
  selectedLevel: string = '';
  selectedLanguage: string = '';
  selectedMode: string = '';

  exams: Exam[] = [
    {
      id: 'upsc',
      name: 'UPSC',
      fullName: 'Civil Services Examination (CSE)',
      description: `Graduates aiming for IAS, IPS, IFS etc`,
      color: '#fff',
      bgColor:  ' #9F7DCD' ,
      subjects: [
        { value: 'gs1', label: 'General Studies Paper I' },
        { value: 'csat', label: 'CSAT (General Studies Paper II)' },
        { value: 'gs3', label: 'General Studies Paper III' },
        { value: 'gs4', label: 'General Studies Paper IV' },
        { value: 'optional1', label: 'Optional Subject Paper I' },
        { value: 'optional2', label: 'Optional Subject Paper II' },
        { value: 'indian-lang', label: 'Language Paper (Indian Language)' },
        { value: 'english', label: 'English Language Paper' }
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
      bgColor: ' #9F7DCD' ,
      subjects: [
        { value: 'physics', label: 'Physics' },
        { value: 'chemistry', label: 'Chemistry' },
        { value: 'mathematics', label: 'Mathematics' }
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
      bgColor: ' #9F7DCD'  ,
      subjects: [
        { value: 'physics', label: 'Physics' },
        { value: 'chemistry', label: 'Chemistry' },
        { value: 'biology', label: 'Biology (Botany + Zoology)' }
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
      bgColor: ' #9F7DCD'  ,
      subjects: [
        { value: 'english', label: 'English Language' },
        { value: 'current-affairs', label: 'Current Affairs & General Knowledge' },
        { value: 'legal', label: 'Legal Reasoning' },
        { value: 'logical', label: 'Logical Reasoning' },
        { value: 'quant', label: 'Quantitative Techniques (Basic Mathematics)' }
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
      bgColor:' #9F7DCD'  ,
      subjects: [
        { value: 'ae', label: 'Aerospace Engineering (AE)' },
        { value: 'ag', label: 'Agricultural Engineering (AG)' },
        { value: 'ar', label: 'Architecture and Planning (AR)' },
        { value: 'bm', label: 'Biomedical Engineering (BM)' },
        { value: 'bt', label: 'Biotechnology (BT)' },
        { value: 'ce', label: 'Civil Engineering (CE)' },
        { value: 'ch', label: 'Chemical Engineering (CH)' },
        { value: 'cs', label: 'Computer Science and Information Technology (CS)' },
        { value: 'cy', label: 'Chemistry (CY)' },
        { value: 'ec', label: 'Electronics and Communication Engineering (EC)' },
        { value: 'ee', label: 'Electrical Engineering (EE)' },
        { value: 'es', label: 'Environmental Science and Engineering (ES)' },
        { value: 'ey', label: 'Ecology and Evolution (EY)' },
        { value: 'gg', label: 'Geology and Geophysics (GG)' },
        { value: 'in', label: 'Instrumentation Engineering (IN)' },
        { value: 'ma', label: 'Mathematics (MA)' },
        { value: 'me', label: 'Mechanical Engineering (ME)' },
        { value: 'mn', label: 'Mining Engineering (MN)' },
        { value: 'mt', label: 'Metallurgical Engineering (MT)' },
        { value: 'pe', label: 'Petroleum Engineering (PE)' },
        { value: 'ph', label: 'Physics (PH)' },
        { value: 'pi', label: 'Production and Industrial Engineering (PI)' },
        { value: 'st', label: 'Statistics (ST)' },
        { value: 'tf', label: 'Textile Engineering and Fibre Science (TF)' },
        { value: 'xe', label: 'Engineering Sciences (XE)' },
        { value: 'xl', label: 'Life Sciences (XL)' },
        { value: 'xh', label: 'Humanities and Social Sciences (XH)' },
        { value: 'nm', label: 'Naval Architecture and Marine Engineering (NM)' },
        { value: 'ge', label: 'Geomatics Engineering (GE)' },
        { value: 'da', label: 'Data Science and Artificial Intelligence (DA)' }
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
      bgColor: ' #9F7DCD'  ,
      subjects: [
        { value: 'varc', label: 'Verbal Ability and Reading Comprehension' },
        { value: 'dilr', label: 'Data Interpretation and Logical Reasoning' },
        { value: 'qa', label: 'Quantitative Ability' }
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

  selectExam(examId: string): void {
    this.selectedExam = this.selectedExam === examId ? null : examId;
    // Reset selections when changing exams
    this.selectedSubject = '';
    this.selectedLevel = '';
    this.selectedLanguage = '';
    this.selectedMode = '';
  }

  getSelectedExam(): Exam | undefined {
    return this.exams.find(exam => exam.id === this.selectedExam);
  }

  canSubmit(): boolean {
    return !!(this.selectedSubject && this.selectedLevel && this.selectedLanguage && this.selectedMode);
  }

  handleSubmit(): void {
    if (this.canSubmit()) {
      const exam = this.getSelectedExam();
      console.log('Selected:', {
        exam: exam?.name,
        subject: this.selectedSubject,
        level: this.selectedLevel,
        language: this.selectedLanguage,
        mode: this.selectedMode
      });
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.exam-card')) {
      this.selectedExam = null;
      this.selectedSubject = '';
      this.selectedLevel = '';
      this.selectedLanguage = '';
      this.selectedMode = '';
    }
  }
}