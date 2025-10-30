import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { ChatStateService } from '../../helpers/services/chat.service';
import { PendingChatService } from '../../helpers/services/PendingChat';
import { AuthService } from '../../helpers/services/authService';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FooterComponent, HeaderComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  @ViewChild('filePicker') filePicker!: ElementRef<HTMLInputElement>;
  
  testimonials = [
   {
     rating:5,
     text: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.Â `,
     name: 'Aalia Ramachandran',
     course: 'UPSC Student',
     img: 'assets/images/girl-1.png'
   },
    {
      rating:4,
      text: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.Â `,
      name: 'Namrata Chatterjee',
      course: 'EET Student',
      img: 'assets/images/boy-2.png'
    },
    {
      rating: 5,
      text: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.Â `,
      name: 'Adah Shetty',
      course: 'IELTS Student',
      img: 'assets/images/girl-2.png'
    },
    {
      rating: 4,
      text: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English.It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.`,
      name: 'Vivek Lal',
      course: 'JEE Student',
      img: 'assets/images/boy-1.png'
    },
  ];

  currentIndex = 0;
  cardsPerView = 1.2;
  userQuery: string = '';
  selectedFiles: File[] = [];
  filePreviewUrls: Map<string, string> = new Map();

  @HostListener('window:resize')
  onResize() {
    this.updateCardsPerView();
  }

  ngOnInit() {
    this.updateCardsPerView();
  }

  updateCardsPerView() {
    const width = window.innerWidth;
    if (width >= 1024) this.cardsPerView = 3.3;
    else if (width >= 768) this.cardsPerView = 2.5;
    else this.cardsPerView = 1.2;
  }

  next() {
    if (this.currentIndex < this.testimonials.length - this.cardsPerView) {
      this.currentIndex++;
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  get translateX() {
    return `translateX(-${this.currentIndex * (100 / this.cardsPerView)}%)`;
  }

  constructor(
    private router: Router,
    private chatStateService: ChatStateService,
    private pendingChatService:PendingChatService,
    private authService:AuthService
  ) {}

  openFileDialog(): void {
    this.filePicker.nativeElement.click();
  }

  onFilesSelected(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFiles = Array.from(input.files);
      this.generateFilePreviewUrls();
    }
  }

  generateFilePreviewUrls(): void {
    this.selectedFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.filePreviewUrls.set(file.name, e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  getFilePreviewUrl(file: File): string {
    return this.filePreviewUrls.get(file.name) || '';
  }

  removeSelectedFile(index: number): void {
    const removedFile = this.selectedFiles[index];
    if (this.filePreviewUrls.has(removedFile.name)) {
      URL.revokeObjectURL(this.filePreviewUrls.get(removedFile.name)!);
      this.filePreviewUrls.delete(removedFile.name);
    }
    this.selectedFiles.splice(index, 1);
  }

  onStartFree(): void {
    this.chatStateService.setInitialData('', this.selectedFiles);
    this.router.navigate(['/chat']);
  }

onSubmitQuery(): void {
  if (!(this.userQuery.trim() || this.selectedFiles.length > 0)) return;

  if (!this.authService.isAuthenticated()) {
    this.pendingChatService.set({ text: this.userQuery.trim(), files: this.selectedFiles });
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/chat' } });
    return;
  }

  this.chatStateService.setInitialData(this.userQuery.trim(), this.selectedFiles);
  this.router.navigate(['/chat']);
  this.userQuery = '';
  this.selectedFiles = [];
}


  onExpandInput(): void {
    console.log('Expand clicked');
  }

  onShowOptions(): void {
    console.log('Options clicked');
  }
}