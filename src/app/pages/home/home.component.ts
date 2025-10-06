import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { ChatService } from '../../helpers/services/chat.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FooterComponent, HeaderComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  testimonials = [
   {
     rating:5,
     text: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. `,
     name: 'Aalia Ramachandran',
     course: 'UPSC Student',
     img: 'assets/images/girl-1.png'
   },
    {
      rating:4,
      text: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. `,
      name: 'Namrata Chatterjee',
      course: 'EET Student',
      img: 'assets/images/boy-2.png'
    },
    {
      rating: 5,
      text: `It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. `,
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
  cardsPerView = 1.2; // default for mobile

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
  userQuery: string = '';

  constructor(
    private router: Router,
    private chatService: ChatService
  ) {}

  onStartFree(): void {
    console.log('Start Free clicked');
    this.router.navigate(['/chat']);
  }

  onSubmitQuery(): void {
    if (this.userQuery.trim()) {
      // Store the query in the service
      this.chatService.setInitialQuery(this.userQuery.trim());
      
      // Navigate to chat component
      this.router.navigate(['/chat']);
      
      // Clear the input
      this.userQuery = '';
    }
  }

  onExpandInput(): void {
    // Logic to expand input or show additional options
    console.log('Expand clicked');
  }

  onShowOptions(): void {
    // Logic to show options dropdown
    console.log('Options clicked');
  }


}