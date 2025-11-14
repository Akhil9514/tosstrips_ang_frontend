// Updated search-bar.component.ts - Add applyFilters() and navigation
import { Component, OnInit, OnDestroy, LOCALE_ID, Output, EventEmitter } from '@angular/core';
import { BackendUrlService } from '../../services/backend-url.service';
import { CountriesService } from '../../services/countries.service'; // Import service
import { Observable, Subscription, throwError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, startWith, tap, catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // For ngModel (fallback)
import { ReactiveFormsModule, FormControl } from '@angular/forms'; // For FormControl
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'; // Import MatAutocompleteSelectedEvent
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker'; // Import MatDatepicker for open()
import { MatNativeDateModule } from '@angular/material/core'; // Native date adapter
import { MatFormFieldModule } from '@angular/material/form-field'; // Optional, but for panel support
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { Country } from '../../models/country.model'; // Import Country interface

interface AdventureStyle {
  id: number;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule, // For date handling
    MatFormFieldModule, // If you want form-field features; otherwise omit
    CommonModule,
    MatIcon,
    MatButtonModule
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
  providers: [
    { provide: LOCALE_ID, useValue: 'en-US' } // Optional: For date formatting; adjust locale as needed
  ]
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Output() filtersApplied = new EventEmitter<{ country?: Country; date?: Date; adventureStyle?: AdventureStyle }>(); // Optional: For parent listening if needed

  constructor(
    private router: Router,
    private backendUrlService: BackendUrlService,
    private http: HttpClient,
    private countriesService: CountriesService, // Inject service
  ) {}

  // Adventure styles (existing)
  adventureStyles: AdventureStyle[] = [];
  loadingAdventureStyles = false;
  adventureSearch = new FormControl(''); // Use FormControl for mat-autocomplete (initially string)
  filteredAdventureStyles!: Observable<AdventureStyle[]>; // Always Observable for async pipe
  selectedAdventureStyle: AdventureStyle | null = null;

  // Countries (new)
  countries: Country[] = [];
  loadingCountries = false;
  whereSearch = new FormControl(''); // FormControl for where autocomplete
  filteredCountries!: Observable<Country[]>; // Observable for async pipe
  selectedCountry: Country | null = null;

  // Date picker properties
  whenDate = new FormControl<Date | null>(null); // FormControl for date
  minDate!: Date; // Minimum date (today) - Use ! for definite assignment

  private subscription?: Subscription;

  ngOnInit(): void {
    // Set min date to today
    this.minDate = new Date();
    this.minDate.setHours(0, 0, 0, 0); // Reset time to start of day

    // Load adventure styles (existing)
    this.loadAdventureStyles();
    this.filteredAdventureStyles = this.adventureSearch.valueChanges.pipe(
      map(value => typeof value === 'string' ? value : ''), // Ensure value is always string for filtering
      startWith(''),
      switchMap(value => this._filterAdventures(value))
    );

    // Load countries from service
    this.subscription = this.countriesService.countries$.subscribe({
      next: (data) => {
        this.countries = data;
        this.loadingCountries = false;
        console.log('Countries loaded from service:', data.length);
        // Trigger initial filter
        const currentValue = typeof this.whereSearch.value === 'string' ? this.whereSearch.value : '';
        this.whereSearch.setValue(currentValue, { emitEvent: false });
      },
      error: (err) => {
        console.error('Failed to load countries:', err);
        this.countries = [];
        this.loadingCountries = false;
      }
    });
    this.loadingCountries = true; // Set loading until service provides data

    // Set up filtering for countries
    this.filteredCountries = this.whereSearch.valueChanges.pipe(
      map(value => typeof value === 'string' ? value : ''), // Ensure value is always string for filtering
      startWith(''),
      switchMap(value => this._filterCountries(value))
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  // Existing adventure methods (renamed _filter to _filterAdventures for clarity)
  private getAdventureStyles(): Observable<AdventureStyle[]> {
    const url = `${this.backendUrlService.getTournTripUrl()}adventure-styles/`;
    return this.http.get<AdventureStyle[]>(url).pipe(
      tap(data => console.log('Adventure styles loaded from search bar:', data)),
      catchError(error => {
        console.error('Failed to load adventure styles from search bar:', error);
        return throwError(() => error);
      })
    );
  }

  private loadAdventureStyles(): void {
    this.loadingAdventureStyles = true;
    this.getAdventureStyles().subscribe({
      next: (data) => {
        this.adventureStyles = data;
        this.loadingAdventureStyles = false;
        console.log(data);
        // Trigger initial filter by emitting current value (as string)
        const currentValue = typeof this.adventureSearch.value === 'string' ? this.adventureSearch.value : '';
        this.adventureSearch.setValue(currentValue, { emitEvent: false }); // Avoid unnecessary re-filter
      },
      error: (err) => {
        console.error('Failed to load adventure styles from search bar:', err);
        this.adventureStyles = [];
        this.loadingAdventureStyles = false;
        // Trigger empty filter
        this.adventureSearch.setValue('');
      }
    });
  }

  private _filterAdventures(value: string): Observable<AdventureStyle[]> {
    const query = value.toLowerCase().trim();
    if (!this.adventureStyles.length) {
      return of([]); // No data yet
    }
    let filtered: AdventureStyle[];
    if (query === '') {
      filtered = [...this.adventureStyles];
    } else {
      filtered = this.adventureStyles.filter(style =>
        style.name.toLowerCase().includes(query)
      );
    }
    return of(filtered); // Return as Observable for mat-autocomplete
  }

  // Handle selection of an adventure style (no manual setValue needed)
  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const style: AdventureStyle = event.option.value;
    this.selectedAdventureStyle = style; // Grab the selected item (including ID)
    console.log('Selected Adventure Style:', style);
    // TODO: Trigger search, navigation, or emit event here if needed
    // The FormControl is already set to the full style object by mat-autocomplete
    // displayFn will show style.name in the input
  }

  trackByStyleId(index: number, style: AdventureStyle): number {
    return style.id;
  }

  displayFn(value: any): string { // Accept any to handle string | AdventureStyle
    if (typeof value === 'string') {
      return value; // If user types, show as-is
    }
    return value ? value.name : '';
  }

  // New country methods
  private _filterCountries(value: string): Observable<Country[]> {
    const query = value.toLowerCase().trim();
    if (!this.countries.length) {
      return of([]); // No data yet
    }
    let filtered: Country[];
    if (query === '') {
      filtered = [...this.countries];
    } else {
      filtered = this.countries.filter(country =>
        country.name.toLowerCase().includes(query)
      );
    }
    return of(filtered); // Return as Observable for mat-autocomplete
  }

  onCountrySelected(event: MatAutocompleteSelectedEvent): void {
    const country: Country = event.option.value;
    this.selectedCountry = country; // Grab the selected item
    console.log('Selected Country:', country);
    // TODO: Trigger search, navigation (e.g., this.router.navigate([`/${country.name.toLowerCase().replace(/\s+/g, '-')}`]))
    // The FormControl is already set to the full country object
    // countryDisplayFn will show country.name in the input
  }

  trackByCountryId(index: number, country: Country): number {
    return country.id;
  }

  countryDisplayFn(value: any): string { // Accept any to handle string | Country
    if (typeof value === 'string') {
      return value; // If user types, show as-is
    }
    return value ? value.name : '';
  }

  countryGetDisplayValue(value: any): string {
    if (typeof value === 'string') {
      return value;
    }
    return value ? value.name : '';
  }

  // Handle focus for where autocomplete (show dropdown if empty)
  onWhereFocus(): void {
    const currentValue = this.whereSearch.value;
    if (typeof currentValue === 'string' && !currentValue.trim()) {
      // Optionally show all on focus if empty string
      this.whereSearch.setValue('', { emitEvent: false });
    }
  }

  // Existing focus/blur methods
  onAdventureFocus(): void {
    const currentValue = this.adventureSearch.value;
    if (typeof currentValue === 'string' && !currentValue.trim()) {
      // Optionally show all on focus if empty string
      this.adventureSearch.setValue('', { emitEvent: false });
    }
  }

  onDateFocus(): void {
    // Optional: Any date-specific focus logic here (e.g., clear if needed)
    // Material datepicker opens on click/focus by default, but we use (click) for reliability
  }

  onDropdownBlur(): void {
    // mat-autocomplete auto-hides; add delay if needed for clicks
    // setTimeout(() => {
    //   // Custom logic if required
    // }, 200);
  }

  // Existing helpers (for adventures)
  isStringAndNonEmpty(value: any): boolean {
    return typeof value === 'string' && value.trim() !== '';
  }

  getDisplayValue(value: any): string {
    if (typeof value === 'string') {
      return value;
    }
    return value ? value.name : '';
  }

  // Existing date method
  onDateSelected(event: any): void {
    const selectedDate: Date = event.value;
    if (selectedDate) {
      console.log('Selected Date:', selectedDate);
      // TODO: Use selected date for search submission, e.g., format and store/send to backend
    }
  }

  // New: Apply filters on button click
  applyFilters(): void {
    const filters: { country?: Country; date?: Date; adventureStyle?: AdventureStyle } = {};

    // Grab selected values
    if (this.selectedCountry) {
      filters.country = this.selectedCountry;
    }
    if (this.whenDate.value) {
      filters.date = this.whenDate.value;
    }
    if (this.selectedAdventureStyle) {
      filters.adventureStyle = this.selectedAdventureStyle;
    }

    console.log('Applying filters:', filters);

    // Emit to parent (CountryComponent) if needed
    this.filtersApplied.emit(filters);

    // Navigate to country route with query params for filters
    let navigationPath = '/';
    let queryParams: any = {};

    if (filters.country) {
      const countrySlug = filters.country.name.toLowerCase().replace(/\s+/g, '-');
      navigationPath = `/${countrySlug}`;
      // Set pageCountry in service if available (assuming TourntripCountryService)
      // this.tourntripCountryService.setCountry(filters.country); // Uncomment if service exists
    }

    if (filters.date) {
      queryParams.departure_date = this.formatDate(filters.date); // YYYY-MM-DD
    }
    if (filters.adventureStyle) {
      queryParams.adventure_style = [filters.adventureStyle.id]; // Array for backend
    }

    // Navigate with params
    this.router.navigate([navigationPath], { 
      queryParamsHandling: 'merge', 
      queryParams 
    }).then(success => {
      if (success) {
        console.log('Navigation successful with filters');
        // Optional: Clear search inputs after apply
        // this.whereSearch.setValue(''); this.adventureSearch.setValue(''); this.whenDate.setValue(null);
      }
    });
  }

  // Helper to format date
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}