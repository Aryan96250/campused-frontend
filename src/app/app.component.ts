import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
<<<<<<< HEAD
=======
import { RevenueCatService } from './helpers/services/revenuecat.service';
>>>>>>> 8eb66a8 (fixed the new changes)

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
<<<<<<< HEAD
export class AppComponent { }
=======
export class AppComponent { 
  constructor(private revanueCat:RevenueCatService){
   this.revanueCat.initialize();
  }
}
>>>>>>> 8eb66a8 (fixed the new changes)
