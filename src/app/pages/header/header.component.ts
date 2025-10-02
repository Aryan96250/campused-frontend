import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterModule, Router } from '@angular/router';

@Component( {
  selector: 'app-header',
  imports: [ CommonModule, RouterLink, RouterModule ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
} )
export class HeaderComponent{
  currentPath: any;

  constructor(private router: Router) {
    this.currentPath = this.router.url == "/pricing";    
    console.log(this.currentPath) // gives "/pricing"
  }     


}
