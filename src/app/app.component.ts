import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { NgxSpinnerModule } from "ngx-spinner";



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Toss & Trips';

constructor(
  private router: Router,
  @Inject(PLATFORM_ID) private platformId: Object
) {
  this.router.events.subscribe((event: Event) => {
    if (event instanceof NavigationEnd && isPlatformBrowser(this.platformId)) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'   
      });
    }
  });
}


}
