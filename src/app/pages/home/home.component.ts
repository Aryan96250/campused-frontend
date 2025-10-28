<<<<<<< HEAD
import { Component, HostListener } from '@angular/core';
=======
import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
>>>>>>> 8eb66a8 (fixed the new changes)
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
<<<<<<< HEAD
import { ChatService } from '../../helpers/services/chat.service';
=======
import { ChatStateService } from '../../helpers/services/chat.service';
>>>>>>> 8eb66a8 (fixed the new changes)

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FooterComponent, HeaderComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
<<<<<<< HEAD
  testimonials = [
   {
     rating:5,
     text: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. `,
=======
  @ViewChild('filePicker') filePicker!: ElementRef<HTMLInputElement>;
  
  testimonials = [
   {
     rating:5,
     text: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.Â `,
>>>>>>> 8eb66a8 (fixed the new changes)
     name: 'Aalia Ramachandran',
     course: 'UPSC Student',
     img: 'assets/images/girl-1.png'
   },
    {
      rating:4,
<<<<<<< HEAD
      text: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. `,
=======
      text: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.Â `,
>>>>>>> 8eb66a8 (fixed the new changes)
      name: 'Namrata Chatterjee',
      course: 'EET Student',
      img: 'assets/images/boy-2.png'
    },
    {
      rating: 5,
<<<<<<< HEAD
      text: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. `,
=======
      text: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.Â `,
>>>>>>> 8eb66a8 (fixed the new changes)
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

<<<<<<< HEAD

  currentIndex = 0;
  cardsPerView = 1.2; // default for mobile
=======
  currentIndex = 0;
  cardsPerView = 1.2;
  userQuery: string = '';
  selectedFiles: File[] = [];
  filePreviewUrls: Map<string, string> = new Map();
>>>>>>> 8eb66a8 (fixed the new changes)

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
<<<<<<< HEAD
  userQuery: string = '';

  constructor(
    private router: Router,
    private chatService: ChatService
  ) {}

  onStartFree(): void {
    console.log('Start Free clicked');
=======

  constructor(
    private router: Router,
    private chatStateService: ChatStateService
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
>>>>>>> 8eb66a8 (fixed the new changes)
    this.router.navigate(['/chat']);
  }

  onSubmitQuery(): void {
<<<<<<< HEAD
    if (this.userQuery.trim()) {
      // Store the query in the service
      this.chatService.setInitialQuery(this.userQuery.trim());
      
      // Navigate to chat component
      this.router.navigate(['/chat']);
      
      // Clear the input
      this.userQuery = '';
=======
    if (this.userQuery.trim() || this.selectedFiles.length > 0) {
      this.chatStateService.setInitialData(this.userQuery.trim(), this.selectedFiles);
      this.router.navigate(['/chat']);
      this.userQuery = '';
      this.selectedFiles = [];
>>>>>>> 8eb66a8 (fixed the new changes)
    }
  }

  onExpandInput(): void {
<<<<<<< HEAD
    // Logic to expand input or show additional options
=======
>>>>>>> 8eb66a8 (fixed the new changes)
    console.log('Expand clicked');
  }

  onShowOptions(): void {
<<<<<<< HEAD
    // Logic to show options dropdown
    console.log('Options clicked');
  }


=======
    console.log('Options clicked');
  }
>>>>>>> 8eb66a8 (fixed the new changes)
}