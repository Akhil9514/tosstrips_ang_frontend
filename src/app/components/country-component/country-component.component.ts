import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule, isPlatformBrowser, AsyncPipe } from '@angular/common';
import { FormsModule, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription, throwError } from 'rxjs';
import { map, startWith, tap, catchError } from 'rxjs/operators';

import { BackendUrlService } from '../../services/backend-url.service';
import { TourntripCountryService } from '../../services/tourntrip-country.service';
import { RequestingLocationService } from '../../services/requesting-location.service';
import { Country } from '../../models/country.model';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { signal, WritableSignal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

/* ==============================================================
   INTERFACES
   ============================================================== */

export interface User {
  name: string;
}

interface SortOption {
  label: string;
  value: string;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface AdventureStyle {
  id: number;
  name: string;
  description?: string;
}

interface Tour {
  id: number;
  title: string;
  country: string;
  country_id: number;
  duration_display: string;
  _days: number;
  _nights: number;
  rating: number;
  no_of_reviews: number;
  destinations: string[];
  shadow_price: string;
  discount_percentage: string;
  departure_date_us: string;
  adventure_style: string;
  start_city: string;
  end_city: string;
}

interface ToursResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Tour[];
}

interface Filters {
  min_price?: number;
  max_price?: number;
  month?: number[];
  adventure_style?: number[];
  start_city?: number;
  end_city?: number;
  departure_date?: Date;
  search_city?: number
}

interface Month {
  label: string;
  value: number;
  year: number;
}


interface FilterChip {
  key: string;        // e.g., 'departure_date', 'month=7', 'start_city=3'
  label: string;      // e.g., 'Departure: 2025-07-15'
}
/* ==============================================================
   COMPONENT DEFINITION
   ============================================================== */

@Component({
  selector: 'app-country-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSliderModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    AsyncPipe,
    RouterModule,
    SearchBarComponent,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './country-component.component.html',
  styleUrl: './country-component.component.css',
  encapsulation: ViewEncapsulation.None
})
export class CountryComponentComponent implements OnInit, OnDestroy {

  /* ==============================================================
     PRICE SLIDER CONFIGURATION
     ============================================================== */
  minPrice = 100;
  maxPrice = 10000;
  minValue = 100;
  maxValue = 5000;

  /* ==============================================================
     CURRENCY CONFIGURATION
     ============================================================== */
  private currencies: Currency[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: 'EUR', name: 'Euro' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
  ];

  selectedCurrency: Currency = this.currencies[0];

  /* ==============================================================
     COUNTRY & LOCATION STATE
     ============================================================== */
  selectedCountry: string | null = null;
  requestingLocationCountry: string = '';
  pageCountry: Country | null = null;

  // City with ID
  destinationCities: { id: number; name: string }[] = [];

  // Start City
  selectedStartCity: { id: number; name: string } | null = null;
  startCityControl = new FormControl<{ id: number; name: string } | string>('');
  filteredStartCities$!: Observable<{ id: number; name: string }[]>;

  // End City
  selectedEndCity: { id: number; name: string } | null = null;
  endCityControl = new FormControl<{ id: number; name: string } | string>('');
  filteredEndCities$!: Observable<{ id: number; name: string }[]>;

  // Top Search City (for "Search city" in header)
  myControl = new FormControl<{ id: number; name: string } | string>('');
  filteredOptions$!: Observable<{ id: number; name: string }[]>;

  /* ==============================================================
     ADVENTURE STYLES
     ============================================================== */
  adventureStyles: AdventureStyle[] = [];
  adventureStylesForm = new FormArray<FormControl<boolean>>([]);
  loadingAdventureStyles = false;


  // Search City (for "Search city" in filter bar)
selectedSearchCity: { id: number; name: string } | null = null;

  /* ==============================================================
     TOURS & PAGINATION
     ============================================================== */
  tours: Tour[] = [];
  totalTours = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  loadingTours = false;

  selectedDepartureDate = new FormControl<Date | null>(null);

  /* ==============================================================
     SORTING OPTIONS
     ============================================================== */
  sortingOptions: SortOption[] = [
    { label: 'Total Price: Lowest Price', value: 'price=low' },
    { label: 'Total Price: Highest Price', value: 'price=high' },
    { label: 'Duration: Shortest First', value: 'duration=short' },
    { label: 'Duration: Longest First', value: 'duration=long' },
    { label: 'Reviews: Most Reviewed', value: 'reviews=most' },
    { label: 'Biggest Deals: Highest Savings', value: 'discount=high' },
    { label: 'Popularity: Most Popular First', value: 'popularity=high' }
  ];

  selectedSort: string = '';

  /* ==============================================================
     MONTH FILTERS
     ============================================================== */
  months: Month[] = [
    { label: 'July 2025',     value: 7,  year: 2025 },
    { label: 'August 2025',   value: 8,  year: 2025 },
    { label: 'September 2025',value: 9,  year: 2025 },
    { label: 'October 2025',  value: 10, year: 2025 },
    { label: 'November 2025', value: 11, year: 2025 },
    { label: 'December 2025', value: 12, year: 2025 },
    { label: 'January 2026',  value: 1,  year: 2026 },
    { label: 'February 2026', value: 2,  year: 2026 }
  ];

  selectedMonths = signal<number[]>([]);

  /* ==============================================================
     GLOBAL FILTERS & STATE
     ============================================================== */
  globalFilters: Filters = {
    min_price: undefined,
    max_price: undefined,
    month: [],
    adventure_style: [],
    start_city: undefined,
    end_city: undefined,
    departure_date: undefined
  };

  globalFilterArray = signal<string[]>([]);

  activeFilters = signal<FilterChip[]>([]);

// Count for badge
activeFilterCount = signal(0);

  /* ==============================================================
     SUBSCRIPTIONS
     ============================================================== */
  private countrySub?: Subscription;
  private citiesSub?: Subscription;
  private toursSub?: Subscription;

  /* ==============================================================
     CONSTRUCTOR
     ============================================================== */
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
    private backendUrlService: BackendUrlService,
    private tourntripCountryService: TourntripCountryService,
    private http: HttpClient,
    private requestingLocationService: RequestingLocationService
  ) {
    this.requestingLocationService.country$.subscribe(country => {
      this.requestingLocationCountry = country;
      this.updateCurrencyBasedOnCountry(country);
    });
  }

  /* ==============================================================
     LIFECYCLE: ngOnInit
     ============================================================== */
  ngOnInit(): void {
    this.loadAdventureStyles();
    this.pageCountry = this.tourntripCountryService.getCountry();

    if (this.pageCountry) {
      this.loadDestinationCities(this.pageCountry.id);
      this.loadTours(this.pageCountry.id);
    }

    this.handleCountryRouting();

// Listen to specific departure date
  this.selectedDepartureDate.valueChanges.subscribe((date: Date | null) => {
    if (date) {
      const formatted = this.formatDate(date);
      this.onSpecificDateSelected(formatted);
    } else {
      this.onSpecificDateCleared();
    }
  });


  this.updateActiveFilterChips();
}
  /* ==============================================================
     COUNTRY ROUTING & PERSISTENCE
     ============================================================== */
  private handleCountryRouting(): void {
    const countryFromUrl = this.route.snapshot.paramMap.get('country');
    this.selectedCountry = countryFromUrl || null;

    if (isPlatformBrowser(this.platformId)) {
      if (countryFromUrl) {
        localStorage.setItem('selectedCountry', countryFromUrl);
        this.selectedCountry = countryFromUrl;
      } else {
        const savedCountry = localStorage.getItem('selectedCountry');
        const targetCountry = savedCountry || 'india';
        localStorage.setItem('selectedCountry', targetCountry);
        this.router.navigate([`/${targetCountry}`], { replaceUrl: true });
      }

      if (this.selectedCountry === 'india') {
        this.selectedCurrency = this.currencies.find(c => c.code === 'INR')!;
      }
    }
  }

  /* ==============================================================
     CURRENCY HANDLING
     ============================================================== */
  onCurrencyChange(currency: Currency): void {
    this.selectedCurrency = currency;
  }

  private updateCurrencyBasedOnCountry(country: string | null): void {
    if (!country) {
      this.selectedCurrency = this.currencies[0];
      return;
    }

    const countryToCurrency: { [key: string]: Currency } = {
      US: this.currencies[0], USA: this.currencies[0], UnitedStates: this.currencies[0],
      IN: this.currencies[2], India: this.currencies[2],
      FR: this.currencies[1], DE: this.currencies[1], IT: this.currencies[1], ES: this.currencies[1]
    };

    const exact = this.currencies.find(c => c.code === country);
    if (exact) {
      this.selectedCurrency = exact;
      return;
    }

    const mapped = countryToCurrency[country];
    if (mapped) {
      this.selectedCurrency = mapped;
      return;
    }

    this.selectedCurrency = this.currencies[0];
  }

  /* ==============================================================
     DESTINATION CITIES LOADING (WITH ID)
     ============================================================== */
  private getCityForCountryDestinations(countryId: number): Observable<{ city: string }[]> {
    const url = `${this.backendUrlService.getTournTripUrl()}countries/${countryId}/cities/`;
    return this.http.get<{ city: string }[]>(url).pipe(
      tap(data => console.log('Raw cities:', data)),
      catchError(error => {
        console.error('Failed to load cities:', error);
        return throwError(() => error);
      })
    );
  }

private loadDestinationCities(countryId: number): void {
  this.citiesSub = this.getCityForCountryDestinations(countryId).subscribe({
    next: (data) => {
      this.destinationCities = data
        .map((item, index) => ({
          id: index,
          name: (item.city || '').trim()
        }))
        .filter(city => city.name.length > 0);

      console.log('Loaded cities:', this.destinationCities);
      this.setupCityAutocompletes();
    },
    error: (err) => {
      console.error('Failed to load cities:', err);
      this.destinationCities = [];
      this.setupCityAutocompletes();
    }
  });
}

  /* ==============================================================
     CITY AUTOCOMPLETE SETUP (ALL THREE)
     ============================================================== */
  private setupCityAutocompletes(): void {
    // Start City
    this.filteredStartCities$ = this.startCityControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const term = typeof value === 'string' ? value : value?.name ?? '';
        return this.filterCities(term);
      })
    );

    // End City
    this.filteredEndCities$ = this.endCityControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const term = typeof value === 'string' ? value : value?.name ?? '';
        return this.filterCities(term);
      })
    );

    // Top Search City (in header)
    this.filteredOptions$ = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const term = typeof value === 'string' ? value : value?.name ?? '';
        return this.filterCities(term);
      })
    );
  }

private filterCities(term: string): { id: number; name: string }[] {
  if (!term) return this.destinationCities;
  const filterValue = term.toLowerCase();
  return this.destinationCities.filter(city =>
    city.name.toLowerCase().includes(filterValue)
  );
}

displayFn(city: { id: number; name: string } | string | null): string {
  return city && typeof city === 'object' ? city.name : '';
}

  /* ==============================================================
     START CITY SELECTION
     ============================================================== */
  onStartCitySelected(event: MatAutocompleteSelectedEvent): void {
    const city = event.option.value as { id: number; name: string };

    if (this.selectedStartCity) {
      this.removeFilter(`start_city=${this.selectedStartCity.id}`);
    }

    this.selectedStartCity = city;
    this.globalFilters.start_city = city.id;
    this.addFilter(`start_city=${city.id}`);

    this.reloadTours();
    console.log('Start city selected:', city);

    this.updateActiveFilterChips();
  }

  /* ==============================================================
     END CITY SELECTION
     ============================================================== */
  onEndCitySelected(event: MatAutocompleteSelectedEvent): void {
    const city = event.option.value as { id: number; name: string };

    if (this.selectedEndCity) {
      this.removeFilter(`end_city=${this.selectedEndCity.id}`);
    }

    this.selectedEndCity = city;
    this.globalFilters.end_city = city.id;
    this.addFilter(`end_city=${city.id}`);

    this.reloadTours();
    console.log('End city selected:', city);

    this.updateActiveFilterChips();
  }

  /* ==============================================================
     TOP CITY SEARCH SELECTION (in header)
     ============================================================== */
onCitySelected(event: MatAutocompleteSelectedEvent): void {
  const city = event.option.value as { id: number; name: string };

  // Remove previous search_city filter
  if (this.selectedSearchCity) {
    this.removeFilter(`search_city=${this.selectedSearchCity.id}`);
  }

  this.selectedSearchCity = city;
  this.globalFilters.search_city = city.id;
  this.addFilter(`search_city=${city.id}`);

  this.reloadTours();
  this.updateActiveFilterChips();

  console.log('Search city selected:', city);
}

  /* ==============================================================
     ADVENTURE STYLES
     ============================================================== */
  private getAdventureStyles(): Observable<AdventureStyle[]> {
    const url = `${this.backendUrlService.getTournTripUrl()}adventure-styles/`;
    return this.http.get<AdventureStyle[]>(url).pipe(
      tap(data => console.log('Adventure styles loaded:', data)),
      catchError(error => {
        console.error('Failed to load adventure styles:', error);
        return throwError(() => error);
      })
    );
  }

  private loadAdventureStyles(): void {
    this.loadingAdventureStyles = true;

    this.getAdventureStyles().subscribe({
      next: (data) => {
        this.adventureStyles = data;
        this.adventureStylesForm = new FormArray<FormControl<boolean>>(
          data.map(() => new FormControl<boolean>(false, { nonNullable: true }))
        );
        this.loadingAdventureStyles = false;
      },
      error: (err) => {
        console.error('Failed to load adventure styles:', err);
        this.adventureStyles = [];
        this.adventureStylesForm = new FormArray<FormControl<boolean>>([]);
        this.loadingAdventureStyles = false;
      }
    });
  }

  onAdventureStyleChange(index: number, event: MatCheckboxChange): void {
    const checked = event.checked;
    const styleId = this.adventureStyles[index].id;

    this.adventureStylesForm.at(index).setValue(checked);

    if (checked) {
      if (!this.globalFilters.adventure_style?.includes(styleId)) {
        this.globalFilters.adventure_style = [...(this.globalFilters.adventure_style || []), styleId];
      }
      this.addFilter(`adventure_style=${styleId}`);
    } else {
      this.globalFilters.adventure_style = this.globalFilters.adventure_style?.filter(id => id !== styleId) || [];
      this.removeFilter(`adventure_style=${styleId}`);
    }

    this.reloadTours();
    this.updateActiveFilterChips();
  }

  getSelectedAdventureStyles(): number[] {
    return this.adventureStylesForm.controls
      .map((control, index) => control.value ? this.adventureStyles[index].id : null)
      .filter((id): id is number => id !== null);
  }

  /* ==============================================================
     TOURS LOADING & PAGINATION
     ============================================================== */
  private grabToursnTrips(countryId: number, page: number = 1): Observable<ToursResponse> {
    const url = `${this.backendUrlService.getTournTripUrl()}countries/${countryId}/tours/?page=${page}&page_size=${this.pageSize}`;
    return this.http.get<ToursResponse>(url).pipe(
      tap(data => console.log('Tours response:', data)),
      catchError(error => {
        console.error('Failed to load tours:', error);
        return throwError(() => error);
      })
    );
  }

  private loadTours(countryId: number, page: number = 1): void {
    this.loadingTours = true;
    this.currentPage = page;
    this.toursSub?.unsubscribe();

    this.toursSub = this.grabToursnTrips(countryId, page).subscribe({
      next: (response) => {
        this.tours = response.results;
        this.totalTours = response.count;
        this.totalPages = Math.ceil(this.totalTours / this.pageSize);
        this.loadingTours = false;
      },
      error: (err) => {
        console.error('Failed to load tours:', err);
        this.tours = [];
        this.totalTours = 0;
        this.totalPages = 0;
        this.loadingTours = false;
      }
    });
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1 && this.pageCountry) {
      this.loadTours(this.pageCountry.id, this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages && this.pageCountry) {
      this.loadTours(this.pageCountry.id, this.currentPage + 1);
    }
  }

  trackByTourId(index: number, tour: Tour): number {
    return tour.id;
  }

  /* ==============================================================
     FILTERS: PRICE, MONTH, SORT
     ============================================================== */
  onRangeChange(value: number, type: 'min' | 'max'): void {
    this.globalFilters.min_price = this.minValue;
    this.globalFilters.max_price = this.maxValue;
    console.log('Price range:', this.globalFilters);

    this.updateActiveFilterChips();
  }

  onSortChange(): void {


    console.log('Selected sort:', this.selectedSort);

    if (!this.selectedSort) {
      this.router.navigate([], { queryParams: {}, queryParamsHandling: 'merge' });
      return;
    }

    console.log()

    const [key, value] = this.selectedSort.split('=');
    const queryParams: any = { [key]: value };
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  // toggleMonth(month: Month, event: MatCheckboxChange): void {
  //   const monthNum = month.value;

  //   if (event.checked) {
  //     this.selectedMonths.update(arr => [...arr, monthNum]);
  //     this.globalFilters.departure_date = undefined;
  //   } else {
  //     this.selectedMonths.update(arr => arr.filter(m => m !== monthNum));
  //   }

  //   this.syncMonthFilters();
  // }



  // 1. toggleMonth
toggleMonth(month: Month, event: MatCheckboxChange): void {
  const monthNum = month.value;

  if (event.checked) {
    this.selectedDepartureDate.setValue(null);
    this.globalFilters.departure_date = undefined;
    this.globalFilterArray.update(arr => arr.filter(f => !f.startsWith('departure_date=')));

    this.selectedMonths.update(arr => [...arr, monthNum]);
  } else {
    this.selectedMonths.update(arr => arr.filter(m => m !== monthNum));
  }

  this.syncMonthFilters();
}


  private syncMonthFilters(): void {
    const currentSelected = this.selectedMonths();

    this.globalFilterArray.update(arr =>
      arr.filter(f => !f.startsWith('month='))
    );

    currentSelected.forEach(month => {
      this.addFilter(`month=${month}`);
    });

    this.globalFilters.month = [...currentSelected];
    this.reloadTours();
    this.updateActiveFilterChips();
  }

  clearMonths(): void {
    this.selectedMonths.set([]);
    this.syncMonthFilters();
  }

  private addFilter(filter: string): void {
    this.globalFilterArray.update(arr => {
      if (!arr.includes(filter)) {
        return [...arr, filter];
      }
      return arr;
    });
  }

  removeFilter(filter: string): void {
    this.globalFilterArray.update(arr => arr.filter(f => f !== filter));
  }

  private reloadTours(): void {
    if (this.pageCountry) {
      this.currentPage = 1;
      this.loadTours(this.pageCountry.id, 1);

     
    }

     this.updateActiveFilterChips();
  }


  /* ==============================================================
   SPECIFIC DATE SELECTED → CLEAR MONTHS & ADD DATE FILTER
   ============================================================== */
/* ==============================================================
   SPECIFIC DATE SELECTED → CLEAR MONTHS & ADD DATE FILTER
   ============================================================== */
// 2. onSpecificDateSelected
private onSpecificDateSelected(dateStr: string): void {
  this.selectedMonths.set([]);
  this.globalFilterArray.update(arr => arr.filter(f => !f.startsWith('month=')));
  this.globalFilterArray.update(arr => arr.filter(f => !f.startsWith('departure_date=')));
  this.addFilter(`departure_date=${dateStr}`);

  this.globalFilters.month = [];
  this.globalFilters.departure_date = new Date(dateStr);

  // this.reloadTours();   // ← UNCOMMENTED
  this.updateActiveFilterChips();
}
/* ==============================================================
   SPECIFIC DATE CLEARED → REMOVE DATE FILTER
   ============================================================== */
// 3. onSpecificDateCleared
private onSpecificDateCleared(): void {
  this.globalFilterArray.update(arr => arr.filter(f => !f.startsWith('departure_date=')));
  this.globalFilters.departure_date = undefined;
  // this.reloadTours();   // ← UNCOMMENTED
  this.updateActiveFilterChips();
}
  /* ==============================================================
     UTILITIES
     ============================================================== */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  private updateActiveFilterChips(): void {
  const chips: FilterChip[] = [];

  // Departure Date
  if (this.globalFilters.departure_date) {
    const dateStr = this.formatDate(this.globalFilters.departure_date);
    chips.push({ key: `departure_date=${dateStr}`, label: `Departure: ${dateStr}` });
  }

  // Months
  this.selectedMonths().forEach(monthNum => {
    const month = this.months.find(m => m.value === monthNum);
    if (month) {
      chips.push({ key: `month=${monthNum}`, label: `Month: ${month.label}` });
    }
  });

  // Start City
  if (this.selectedStartCity) {
    chips.push({ key: `start_city=${this.selectedStartCity.id}`, label: `Start: ${this.selectedStartCity.name}` });
  }

  // End City
  if (this.selectedEndCity) {
    chips.push({ key: `end_city=${this.selectedEndCity.id}`, label: `End: ${this.selectedEndCity.name}` });
  }

  // Price Range
  if (this.minValue > this.minPrice || this.maxValue < this.maxPrice) {
    chips.push({
      key: `price=${this.minValue}-${this.maxValue}`,
      label: `Price: ${this.selectedCurrency.symbol}${this.minValue} - ${this.selectedCurrency.symbol}${this.maxValue}`
    });
  }

  // Adventure Styles
  this.adventureStylesForm.controls.forEach((control, i) => {
    if (control.value) {
      const style = this.adventureStyles[i];
      chips.push({ key: `adventure_style=${style.id}`, label: `Style: ${style.name}` });
    }
  });

  // Search City
if (this.selectedSearchCity) {
  chips.push({ key: `search_city=${this.selectedSearchCity.id}`, label: `Search: ${this.selectedSearchCity.name}` });
}

  this.activeFilters.set(chips);
  this.activeFilterCount.set(chips.length);
}


removeFilterByKey(key: string, event: Event): void {
  event.stopPropagation();

  const [type, value] = key.split('=');

  if (type === 'departure_date') {
    this.selectedDepartureDate.setValue(null);
    this.onSpecificDateCleared();
  }
  else if (type === 'month') {
    const monthNum = +value;
    this.selectedMonths.update(arr => arr.filter(m => m !== monthNum));
    this.syncMonthFilters();
  }
  else if (type === 'start_city') {
    this.selectedStartCity = null;
    this.startCityControl.setValue('');
    this.globalFilters.start_city = undefined;
    this.removeFilter(key);
    this.reloadTours();
  }
  else if (type === 'end_city') {
    this.selectedEndCity = null;
    this.endCityControl.setValue('');
    this.globalFilters.end_city = undefined;
    this.removeFilter(key);
    this.reloadTours();
  }
  else if (type === 'price') {
    this.minValue = this.minPrice;
    this.maxValue = this.maxPrice;
    this.globalFilters.min_price = undefined;
    this.globalFilters.max_price = undefined;
    this.reloadTours();
  }
  else if (type === 'adventure_style') {
    const styleId = +value;
    const index = this.adventureStyles.findIndex(s => s.id === styleId);
    if (index !== -1) {
      this.adventureStylesForm.at(index).setValue(false);
      this.onAdventureStyleChange(index, { checked: false } as MatCheckboxChange);
    }
  }

  else if (type === 'search_city') {
  this.selectedSearchCity = null;
  this.myControl.setValue('');
  this.globalFilters.search_city = undefined;
  this.removeFilter(key);
  this.reloadTours();
}

  // Update chips
  this.updateActiveFilterChips();
}



clearAllFilters(): void {
  // Clear all UI
  this.selectedDepartureDate.setValue(null);
  this.selectedMonths.set([]);
  this.selectedStartCity = null;
  this.startCityControl.setValue('');
  this.selectedEndCity = null;
  this.endCityControl.setValue('');
  this.minValue = this.minPrice;
  this.maxValue = this.maxPrice;
  this.adventureStylesForm.controls.forEach(c => c.setValue(false));
  this.selectedSearchCity = null;
this.myControl.setValue('');

  // Clear all filters
  this.globalFilters = {
    min_price: undefined,
    max_price: undefined,
    month: [],
    adventure_style: [],
    start_city: undefined,
    end_city: undefined,
    departure_date: undefined,
    search_city: undefined
  };

  this.globalFilterArray.set([]);

  this.reloadTours();
  this.updateActiveFilterChips();
}


onFilterMenuClosed(): void {
  // Do nothing — prevents any value from being selected
}

  onStateChanged(sort: string, filters: string[]) {
    console.log('Sort changed:', sort);
    console.log('Filters changed:', filters);
  }


//   applyFilters(): void {

//     console.log(this.globalFilters);
//   // this.reloadTours();
// }





applyFilters(): void {
  if (!this.pageCountry) return;

  // Build query params object
  const params: any = {};

  // 1. Price range
  if (this.minValue > this.minPrice) {
    params.min_price = this.minValue;
  }
  if (this.maxValue < this.maxPrice) {
    params.max_price = this.maxValue;
  }

  // 2. Search city → city_id
  if (this.selectedSearchCity) {
    params.city_id = this.selectedSearchCity.id;
  }

  // 3. Departure date
  if (this.globalFilters.departure_date) {
    const dateStr = this.formatDate(this.globalFilters.departure_date);
    params.departure_date = dateStr;
  }

  // 4. Months
  this.selectedMonths().forEach(monthNum => {
    if (!params.month) params.month = [];
    params.month.push(monthNum);
  });

  // 5. Start city (string)
  if (this.selectedStartCity) {
    params.start_city = this.selectedStartCity.name;
  }

  // 6. End city (string)
  if (this.selectedEndCity) {
    params.end_city = this.selectedEndCity.name;
  }

  // 7. Sorting
  if (this.selectedSort) {
    params.filter = this.selectedSort; // e.g., 'price=low'
  }

  // 8. Adventure styles (not in backend yet → skip for now)
  // → Add later when backend supports ?adventure_style=1,2

  // Build full URL
  const baseUrl = `${this.backendUrlService.getTournTripUrl()}countries/${this.pageCountry.id}/tours/`;
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    if (Array.isArray(params[key])) {
      params[key].forEach((val: any) => url.searchParams.append(key, val));
    } else {
      url.searchParams.set(key, params[key]);
    }
  });

  console.log('Fetching tours from:', url.toString());

  // Cancel previous request
  this.toursSub?.unsubscribe();

  // Make request
  this.loadingTours = true;
  this.toursSub = this.http.get<ToursResponse>(url.toString()).subscribe({
    next: (response) => {
      this.tours = response.results;
      this.totalTours = response.count;
      this.totalPages = Math.ceil(this.totalTours / this.pageSize);
      this.loadingTours = false;
      this.currentPage = 1;
    },
    error: (err) => {
      console.error('Failed to load tours:', err);
      this.tours = [];
      this.totalTours = 0;
      this.totalPages = 0;
      this.loadingTours = false;
    }
  });

  // Update chips
  this.updateActiveFilterChips();
}




  /* ==============================================================
     LIFECYCLE: ngOnDestroy
     ============================================================== */
  ngOnDestroy(): void {
    this.countrySub?.unsubscribe();
    this.citiesSub?.unsubscribe();
    this.toursSub?.unsubscribe();
  }
}