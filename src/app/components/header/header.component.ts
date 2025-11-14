// Updated header.component.ts - Merge countries and set to service
import { Component, ViewChild, ElementRef, OnInit, ChangeDetectorRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgbDropdown, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { isPlatformBrowser } from '@angular/common';

import { BackendUrlService } from '../../services/backend-url.service';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, forkJoin } from 'rxjs';
import { throwError } from 'rxjs';

import { Country } from '../../models/country.model';
import { TourntripCountryService } from '../../services/tourntrip-country.service';
import { RequestingLocationService } from '../../services/requesting-location.service';
import { CountriesService } from '../../services/countries.service'; // Import new service
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    NgbDropdownModule,
    MatIconModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  /* dropdown instances – only needed for isOpen() / close() */
  @ViewChild('destinationsDropdown') destinationsDropdown!: NgbDropdown;
  @ViewChild('waysDropdown') waysDropdown!: NgbDropdown;

  /* the actual <div class="dropdown-menu-wrapper"> elements */
  @ViewChild('destinationsMenu') destinationsMenu!: ElementRef;
  @ViewChild('waysMenu') waysMenu!: ElementRef;

  /* toggler elements for click handling */
  @ViewChild('destinationsToggler') destinationsToggler!: ElementRef;
  @ViewChild('waysToggler') waysToggler!: ElementRef;

  @ViewChild('toggler') toggler!: ElementRef;

  private hoverTimer: any = {};
  private readonly HOVER_DELAY = 120;
  private readonly CLOSE_DELAY = 250;

  private activeHoverType: 'destinations' | 'ways' | null = null;
  private hoverTimeout: any = null;

  isAuthenticated: boolean = false;
  isSidebarOpen: boolean = false;
  isAboutOpen: boolean = false;
  requestingLocationCountry: string = '';  // ← will be set from service
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
    private countriesService: CountriesService, // Inject service
  ) {}

  ngOnInit(): void {
    // Subscribe to country from service
    this.requestingLocationService.country$.subscribe(country => {
      this.requestingLocationCountry = country || 'USA';  // ← fallback only if empty
    });

    // Fetch all continents in parallel and merge
    const requests = [
      this.getCountries(1),
      this.getCountries(2),
      this.getCountries(3),
      this.getCountries(4),
      this.getCountries(5),
      this.getCountries(6)
    ];

    forkJoin(requests).subscribe({
      next: (responses) => {
        // Assign to regional arrays
        this.asiaCountries = responses[0]?.countries || [];
        this.africaCountries = responses[1]?.countries || [];
        this.australiaCountries = responses[2]?.countries || [];
        this.europeCountries = responses[3]?.countries || [];
        this.latinAmericaCountries = responses[4]?.countries || [];
        this.middleEastCountries = responses[5]?.countries || [];

        // Merge all countries and share via service
        const allCountries = [
          ...this.asiaCountries,
          ...this.africaCountries,
          ...this.australiaCountries,
          ...this.europeCountries,
          ...this.latinAmericaCountries,
          ...this.middleEastCountries
        ];
        this.countriesService.setCountries(allCountries);
        console.log('All countries loaded and shared:', allCountries.length);
      },
      error: (err) => console.error('Failed to load countries:', err)
    });
  }

  @HostListener('window:resize')
  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 991;
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
    this.requestingLocationService.setCountry(value);
    console.log('Currency changed to:', value);
  }

  openDestinationsPanel() {
    this.activePanel = 'destinations';
    this.isSidebarOpen = true;
  }

  openWaysPanel() {
    this.activePanel = 'ways';
    this.isSidebarOpen = true;
  }

  closePanel() {
    this.activePanel = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (this.destinationsDropdown?.isOpen()) {
      const menuEl = this.destinationsMenu?.nativeElement as HTMLElement;
      const togglerEl = this.destinationsToggler?.nativeElement as HTMLElement;
      if (menuEl && togglerEl && !menuEl.contains(target) && target !== togglerEl) {
        this.destinationsDropdown.close();
      }
    }

    if (this.waysDropdown?.isOpen()) {
      const menuEl = this.waysMenu?.nativeElement as HTMLElement;
      const togglerEl = this.waysToggler?.nativeElement as HTMLElement;
      if (menuEl && togglerEl && !menuEl.contains(target) && target !== togglerEl) {
        this.waysDropdown.close();
      }
    }
  }

  onDestinationsClick() {
    this.toggleDropdown('destinations');
  }

  onWaysClick() {
    this.toggleDropdown('ways');
  }

  private toggleDropdown(type: 'destinations' | 'ways') {
    const targetDropdown = type === 'destinations' ? this.destinationsDropdown : this.waysDropdown;
    const otherDropdown = type === 'destinations' ? this.waysDropdown : this.destinationsDropdown;
    const otherType = type === 'destinations' ? 'ways' : 'destinations';

    // Close other if open
    if (otherDropdown?.isOpen()) {
      otherDropdown.close();
      if (this.activeHoverType === otherType) {
        this.activeHoverType = null;
      }
    }

    // Toggle target
    if (targetDropdown.isOpen()) {
      targetDropdown.close();
      this.activeHoverType = null;
    } else {
      targetDropdown.open();
      this.activeHoverType = type;
    }
  }

  onMenuEnter(type: 'destinations' | 'ways', event?: MouseEvent) {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }

    if (this.activeHoverType === type) return;

    const targetDropdown = type === 'destinations' ? this.destinationsDropdown : this.waysDropdown;
    const otherDropdown = type === 'destinations' ? this.waysDropdown : this.destinationsDropdown;
    const otherType = type === 'destinations' ? 'ways' : 'destinations';

    // Close other if open
    if (otherDropdown?.isOpen()) {
      otherDropdown.close();
      if (this.activeHoverType === otherType) {
        this.activeHoverType = null;
      }
    }

    this.activeHoverType = type;

    if (targetDropdown && !targetDropdown.isOpen()) {
      targetDropdown.open();
    }
  }

onMenuLeave(type: 'destinations' | 'ways', event?: MouseEvent) {
  if (this.activeHoverType !== type) return;

  const dropdown = type === 'destinations' ? this.destinationsDropdown : this.waysDropdown;

  this.hoverTimeout = setTimeout(() => {
    // Always attempt close, then clear active regardless of open state
    if (dropdown?.isOpen()) {
      dropdown.close();
    }
    this.activeHoverType = null;  // ← ADD THIS: Clear even if already closed
  }, 100);  // Or use your CLOSE_DELAY = 250 for consistency
}

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent) {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-menu-wrapper')) {
      this.activeHoverType = null;
    }
  }

  getCountries(id: number): Observable<any> {
    const url = `${this.backendUrlService.getTournTripUrl()}continents/${id}/countries/`;
    return this.http.get(url).pipe(
      tap(),
      catchError(error => {
        console.error('Failed to load countries:', error);
        return throwError(() => error);
      })
    );
  }

  selectCountry(country: Country): void {
    this.tourntripsCountryService.setCountry(country);
    const urlName = country.name
      .toLowerCase()
      .replace(/\s+/g, '-');
    this.router.navigate([`/${urlName}`]).then((success: boolean) => {
      if (success) {
        window.location.reload();
      }
    });
  }
}