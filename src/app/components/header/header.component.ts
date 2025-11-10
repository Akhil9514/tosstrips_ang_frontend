import { Component, ViewChild, ElementRef, OnInit, ChangeDetectorRef, HostListener,Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
// import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { isPlatformBrowser } from '@angular/common';

import { BackendUrlService } from '../../services/backend-url.service';
import { HttpClient } from '@angular/common/http';

import { Observable, tap, catchError } from 'rxjs';
import { throwError } from 'rxjs';

import { Country } from '../../models/country.model';
import { AfterViewInit } from '@angular/core';
import { After } from 'v8';
import { TourntripCountryService } from '../../services/tourntrip-country.service';
import { RequestingLocationService } from '../../services/requesting-location.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, NgbDropdownModule], // Add CommonModule if needed for *ngIf/*ngFor
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, AfterViewInit {
/* dropdown instances – only needed for isOpen() / close() */
  @ViewChild('destinationsDropdown') destinationsDropdown!: NgbDropdown;
  @ViewChild('waysDropdown')        waysDropdown!: NgbDropdown;

  /* the actual <div class="dropdown-menu-wrapper"> elements */
  @ViewChild('destinationsMenu') destinationsMenu!: ElementRef;
  @ViewChild('waysMenu')        waysMenu!: ElementRef;

  @ViewChild('toggler') toggler!: ElementRef;

  private hoverTimer: any = {};
  private readonly HOVER_DELAY = 120;   // ms – enough to cross the gap
  private readonly CLOSE_DELAY = 250;   // ms – give user time to re-enter

  private activeHoverType: 'destinations' | 'ways' | null = null;
  private hoverTimeout: any = null;

  isAuthenticated: boolean = false;
  isSidebarOpen: boolean = false;
  isAboutOpen: boolean = false;
  requestingLocationCountry: string = 'USA';
  isMobile = false;
  destinationsOpen = false;
  waysToExploreOpen = false;

  activePanel: 'destinations' | 'ways' | null = null;

  asiaCountries: Country[] = [];
  africaCountries: Country[] = [];
  australiaCountries: Country[] = [];
  europeCountries: Country[] = [];
  latinAmericaCountries: Country[] = [];
  middleEastCountries: Country[] = [];

  constructor(
    private router: Router, 
    private cdr: ChangeDetectorRef, 
    @Inject(PLATFORM_ID) private platformId: Object,
    private backendUrlService: BackendUrlService,
    private http: HttpClient,
    private tourntripsCountryService: TourntripCountryService,
    private requestingLocationService: RequestingLocationService,
  
  ) {

    this.requestingLocationService.country$.subscribe(country => {
      this.requestingLocationCountry = country;
    });

  }

  ngOnInit(): void {


      this.getCountries(1).subscribe({

      next: (data) => this.asiaCountries = data.countries,
      error: (err) => console.error(err)

    });

    this.getCountries(2).subscribe({  
      next: (data) => this.africaCountries = data.countries,
      error: (err) => console.error(err)  });

          this.getCountries(3).subscribe({  
      next: (data) => this.australiaCountries = data.countries,
      error: (err) => console.error(err)  });

          this.getCountries(4).subscribe({  
      next: (data) => this.europeCountries = data.countries,
      error: (err) => console.error(err)  });

          this.getCountries(5).subscribe({  
      next: (data) => this.latinAmericaCountries = data.countries,
      error: (err) => console.error(err)  });

          this.getCountries(6).subscribe({  
      next: (data) => this.middleEastCountries = data.countries,
      error: (err) => console.error(err)  });



  }


  ngAfterViewInit(): void {
        
if (isPlatformBrowser(this.platformId)) {
    const saved = localStorage.getItem('selectedCountry');

    if (saved && ['USA', 'INR', 'EURO'].includes(saved)) {
      this.requestingLocationCountry = saved;
    } else {
      this.requestingLocationCountry = 'USA';
      localStorage.setItem('selectedCountry', 'USA');
    }

    // THIS IS THE KEY: Force Angular to update the mat-select NOW
    this.cdr.detectChanges();
  }

      
  }

  


  @HostListener('window:resize')
  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 991; // matches your lg breakpoint
  }



  toggleSidebar(): void {
    console.log('Toggling sidebar, current state:', this.isSidebarOpen);
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.toggler && this.toggler.nativeElement) {
      if (this.isSidebarOpen) {
        this.toggler.nativeElement.classList.add('active');
      } else {
        this.toggler.nativeElement.classList.remove('active');
      }
    } else {
      console.warn('Toggler element not found');
    }
    this.cdr.detectChanges();
  }


  closeSidebar(): void {
    console.log('Closing sidebar');
    this.isSidebarOpen = false;
    this.closePanel();
    if (this.toggler && this.toggler.nativeElement) {
      this.toggler.nativeElement.classList.remove('active');
      // this.toggleWaysToExplore();
      // this.toggleDestinations();
    } else {
      console.warn('Toggler element not found');
    }
    this.cdr.detectChanges();
  }

  toggleAbout(): void {
    console.log('Toggling About, current state:', this.isAboutOpen);
    this.isAboutOpen = !this.isAboutOpen;
    this.cdr.detectChanges();
  }

  goToHome(): void {
    this.router.navigate(['']);
    this.closeSidebar();
  }



onCountryChange(value: string): void {

  this.requestingLocationService.setCountry(value)
  this.requestingLocationCountry = value;

  // if (isPlatformBrowser(this.platformId)) {
    
  //   localStorage.setItem('requestingLocationCountry', value);  // ← Was 'selectedCountry' → wrong key!
  // }

  console.log('Currency changed to:', value);
}


  // New panel methods
  openDestinationsPanel() {
    this.activePanel = 'destinations';
    this.isSidebarOpen = true; // Keep sidebar open
  }

  openWaysPanel() {
    this.activePanel = 'ways';
    this.isSidebarOpen = true;
  }

  closePanel() {
    this.activePanel = null;
  }



/* ------------------------------------------------------------------ */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // ---- DESTINATIONS -------------------------------------------------
    if (this.destinationsDropdown?.isOpen()) {
      const menuEl = this.destinationsMenu?.nativeElement as HTMLElement;
      if (menuEl && !menuEl.contains(target)) {
        this.destinationsDropdown.close();
      }
    }

    // ---- WAYS TO EXPLORE ---------------------------------------------
    if (this.waysDropdown?.isOpen()) {
      const menuEl = this.waysMenu?.nativeElement as HTMLElement;
      if (menuEl && !menuEl.contains(target)) {
        this.waysDropdown.close();
      }
    }
  }








onMenuEnter(type: 'destinations' | 'ways', event?: MouseEvent) {
  // Cancel any pending close timer
  if (this.hoverTimeout) {
    clearTimeout(this.hoverTimeout);
    this.hoverTimeout = null;
  }

  // If we are already showing the requested menu → nothing to do
  if (this.activeHoverType === type) return;

  const targetDropdown = type === 'destinations' ? this.destinationsDropdown : this.waysDropdown;
  const otherDropdown   = type === 'destinations' ? this.waysDropdown : this.destinationsDropdown;

  // Close the other menu first (if open)
  if (otherDropdown?.isOpen()) {
    otherDropdown.close();
  }

  this.activeHoverType = type;

  // Open the requested menu (no delay – instant feel)
  if (targetDropdown && !targetDropdown.isOpen()) {
    targetDropdown.open();
  }
}

onMenuLeave(type: 'destinations' | 'ways', event?: MouseEvent) {
  if (this.activeHoverType !== type) return;

  const dropdown = type === 'destinations' ? this.destinationsDropdown : this.waysDropdown;

  // Give the user a generous window to move back into the menu
  this.hoverTimeout = setTimeout(() => {
    if (this.activeHoverType === type && dropdown?.isOpen()) {
      dropdown.close();
      this.activeHoverType = null;
    }
  }, 100); // 300 ms – feels natural
}



// Clear any pending timeouts on mouse down (e.g., if user interacts elsewhere)
@HostListener('document:mousedown', ['$event'])
onDocumentMouseDown(event: MouseEvent) {
  if (this.hoverTimeout) {
    clearTimeout(this.hoverTimeout);
    this.hoverTimeout = null;
  }
  // Only reset active if not hovering over a menu
  const target = event.target as HTMLElement;
  if (!target.closest('.dropdown-menu-wrapper')) {
    this.activeHoverType = null;
  }
}













getCountries(id: number): Observable<any> {
  const url = `${this.backendUrlService.getTournTripUrl()}continents/${id}/countries/`;
  // console.log('API URL:', url); // Should show: .../continents/5/countries/

  return this.http.get(url).pipe(
    tap(),
    catchError(error => {
      console.error('Failed to load countries:', error);
      return throwError(() => error);
    })
  );
}



selectCountry(country: Country): void {
    // Save to localStorage
    this.tourntripsCountryService.setCountry(country);

    // Generate URL: "Cambodia" → "/cambodia", "South Korea" → "/south-korea"
    const urlName = country.name
      .toLowerCase()
      .replace(/\s+/g, '-');

    this.router.navigate([`/${urlName}`]);
  }





}