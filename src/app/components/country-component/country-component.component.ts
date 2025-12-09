import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  inject,
  PLATFORM_ID,
  ViewEncapsulation,
  TemplateRef
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { ActivatedRoute, Router, RouterModule, NavigationExtras } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription, throwError } from 'rxjs';
import { map, startWith, tap, catchError } from 'rxjs/operators';

import { BackendUrlService } from '../../services/backend-url.service';
import { TourntripCountryService } from '../../services/tourntrip-country.service';
import { RequestingLocationService } from '../../services/requesting-location.service';
import { Country } from '../../models/country.model';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { signal, WritableSignal } from '@angular/core';
import { HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NgbModal, NgbModalUpdatableOptions, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { trigger, state, style, transition, animate } from '@angular/animations';


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
  image: string;
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
  start_city?: string;
  end_city?: string;
  departure_date?: Date;
  search_city?: string;
  page?: number;
}

interface Month {
  label: string;
  value: number;
  year: number;
}

interface FilterChip {
  key: string;
  label: string;
}

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
    MatButtonModule,
  ],
  templateUrl: './country-component.component.html',
  styleUrl: './country-component.component.css',
  encapsulation: ViewEncapsulation.None,
  animations: [
    // Slide up/down from bottom
    trigger('slideInOut', [
      state('true', style({
        transform: 'translateY(0)',
        opacity: 1,
        visibility: 'visible'
      })),
      state('false', style({
        transform: 'translateY(100%)',
        opacity: 0,
        visibility: 'hidden'
      })),
      transition('false => true', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('350ms cubic-bezier(0.4, 0, 0.2, 1)')
      ]),
      transition('true => false', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ]),

    // FAB icon rotate
    trigger('fabTransform', [
      state('closed', style({ transform: 'rotate(0)' })),
      state('open', style({ transform: 'rotate(135deg)' })),
      transition('closed <=> open', animate('300ms ease-in-out'))
    ])
  ]
})
export class CountryComponentComponent implements OnInit, OnDestroy {


  // Inside your CountryComponentComponent class
  today: Date = new Date();

  /* PRICE SLIDER */
  minPrice = 100;
  maxPrice = 50000;
  minValue = 100;
  maxValue = 50000;

  /* CURRENCY */
  private currencies: Currency[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: 'EUR', name: 'Euro' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
  ];
  selectedCurrency: Currency = this.currencies[0];

  /* COUNTRY & LOCATION */
  selectedCountry: string | null = null;
  requestingLocationCountry: string = '';
  pageCountry: Country | null = null;
  destinationCities: { id: number; name: string }[] = [];

  // City Controls
  myControl = new FormControl<{ id: number; name: string } | string>('');
  filteredOptions$!: Observable<{ id: number; name: string }[]>;
  selectedSearchCity: { id: number; name: string } | null = null;

  startCityControl = new FormControl<{ id: number; name: string } | string>('');
  filteredStartCities$!: Observable<{ id: number; name: string }[]>;
  selectedStartCity: { id: number; name: string } | null = null;

  endCityControl = new FormControl<{ id: number; name: string } | string>('');
  filteredEndCities$!: Observable<{ id: number; name: string }[]>;
  selectedEndCity: { id: number; name: string } | null = null;

  /* ADVENTURE STYLES */
  adventureStyles: AdventureStyle[] = [];
  adventureStylesForm = new FormArray<FormControl<boolean>>([]);
  loadingAdventureStyles = false;

  /* TOURS & PAGINATION */
  tours: Tour[] = [];
  totalTours = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  loadingTours = false;
  selectedDepartureDate = new FormControl<Date | null>(null);

  /* SORTING */
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

  /* MONTH FILTERS */
  months: Month[] = [
    { label: 'July 2025', value: 7, year: 2025 },
    { label: 'August 2025', value: 8, year: 2025 },
    { label: 'September 2025', value: 9, year: 2025 },
    { label: 'October 2025', value: 10, year: 2025 },
    { label: 'November 2025', value: 11, year: 2025 },
    { label: 'December 2025', value: 12, year: 2025 },
    { label: 'January 2026', value: 1, year: 2026 },
    { label: 'February 2026', value: 2, year: 2026 }
  ];
  selectedMonths = signal<number[]>([]);

  /* FILTERS STATE */
  globalFilters: Filters = {
    min_price: undefined,
    max_price: undefined,
    month: [],
    adventure_style: [],
    start_city: undefined,
    end_city: undefined,
    departure_date: undefined,
    search_city: undefined,
    page: undefined
  };

  globalFilterArray = signal<string[]>([]);
  activeFilters = signal<FilterChip[]>([]);
  activeFilterCount = signal(0);

  isDepartureOpen = true;
  isAdventureStyles = true;
  isStartandEndCityOpen = true;

  private countrySub?: Subscription;
  private citiesSub?: Subscription;
  private toursSub?: Subscription;
  private routeSub?: Subscription;
  private startCitySub?: Subscription;
  private endCitySub?: Subscription;
  private searchCitySub?: Subscription;

  showMobileFilters = false;
  private pendingAdventureStyleIds: number[] = [];  // ← NEW: Store pending IDs during load race

  private previousParams: any = {};  // Track last params to detect changes
  private isPageOnlyChange = false;  // Flag for pagination nav
  private restoringFromParams = false;

  private pendingStartCity: string | null = null;
  private pendingEndCity: string | null = null;
  private pendingSearchCity: string | null = null;

  private modalService = inject(NgbModal);

  @ViewChild("filtersBlock") filtersBlock!: ElementRef;
  @ViewChild('filtersTemplate') filtersTemplate!: TemplateRef<any>;
  
  @ViewChild('sidefiltersTemplate') sidefiltersTemplate!: TemplateRef<any>;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;
  @ViewChild('searchModal') searchModal!: TemplateRef<any>;

  mobileSearchOpen = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private route: ActivatedRoute,
    private router: Router,
    private backendUrlService: BackendUrlService,
    private tourntripCountryService: TourntripCountryService,
    private http: HttpClient,
    private requestingLocationService: RequestingLocationService,
    private dialog: MatDialog

  ) {
    this.requestingLocationService.country$.subscribe(country => {
      this.requestingLocationCountry = country;
      this.updateCurrencyBasedOnCountry(country);
    });
  }



  ngOnInit(): void {


    this.loadAdventureStyles();


    // Extract country from route early
    const countryFromUrl = this.route.snapshot.paramMap.get('country');
    this.selectedCountry = countryFromUrl || null;
    if (this.selectedCountry) {
      // Prime pageCountry from service (now with getCountryBySlug)
      this.pageCountry = this.tourntripCountryService.getCountryBySlug(this.selectedCountry) || this.tourntripCountryService.getCountry();
      if (!this.pageCountry) {
        // Fallback: Fetch country by slug if service doesn't have it
        this.tourntripCountryService.loadCountryBySlug(this.selectedCountry).subscribe({
          next: (country) => {
            if (country) {
              this.pageCountry = country;
              this.loadDestinationCities(country.id);
              // Trigger initial load after country is ready
              this.applySearchFiltersFromParams(this.route.snapshot.queryParams);
            } else {
              console.warn(`No country found for slug: ${this.selectedCountry}`);
              // Optional: Redirect to default or error page
            }
          },
          error: (err) => {
            console.error('Failed to load country:', err);
            // Optional: Fallback to default country
          }
        });
        return;  // Exit early, load will happen in subscribe
      }
    }

    if (this.pageCountry) {
      this.loadDestinationCities(this.pageCountry.id);
    }

    this.handleCountryRouting();
    this.selectedDepartureDate.valueChanges.subscribe((date: Date | null) => {
      if (date && !this.restoringFromParams) {  // Add flag
        const formatted = this.formatDate(date);
        this.onSpecificDateSelected(formatted);
      } else {
        this.onSpecificDateCleared();
      }
    });

    // NEW: Subscribe to queryParams changes for search filters
    this.routeSub = this.route.queryParams.subscribe(params => {
      this.applySearchFiltersFromParams(params);
    });

    this.setupCityValueChanges();

    this.updateActiveFilterChips();
  }

  private setupCityValueChanges(): void {
    const dummyEvent = { stopPropagation: () => { } } as Event;

    this.startCitySub = this.startCityControl.valueChanges.subscribe(value => {
      if ((typeof value === 'string' && value.trim() === '') || value === null || value === undefined) {
        if (this.globalFilters.start_city !== undefined) {
          this.removeFilterByKey(`start_city=${this.globalFilters.start_city}`, dummyEvent);
        }
      }
    });

    this.endCitySub = this.endCityControl.valueChanges.subscribe(value => {
      if ((typeof value === 'string' && value.trim() === '') || value === null || value === undefined) {
        if (this.globalFilters.end_city !== undefined) {
          this.removeFilterByKey(`end_city=${this.globalFilters.end_city}`, dummyEvent);
        }
      }
    });

    this.searchCitySub = this.myControl.valueChanges.subscribe(value => {
      if ((typeof value === 'string' && value.trim() === '') || value === null || value === undefined) {
        if (this.globalFilters.search_city !== undefined) {
          this.removeFilterByKey(`search_city=${this.globalFilters.search_city}`, dummyEvent);
        }
      }
    });
  }

  



  private applySearchFiltersFromParams(params: any): void {
    console.log('Applying ALL filters from params:', params);

    const isInitialLoad = Object.keys(this.previousParams).length === 0;

    const isOnlyPageChange = this.isPageOnlyChange || this.areParamsEqualExceptPage(this.previousParams, params);
    console.log('isOnlyPageChange in sub:', isOnlyPageChange);
    this.previousParams = { ...params };

    // Handle date (silently restore state to avoid loop)
    if (params['departure_date']) {
      const dateStr = params['departure_date'];
      this.restoringFromParams = true;
      // Set without emitting to prevent recursive onSpecificDateSelected
      this.selectedDepartureDate.setValue(new Date(dateStr), { emitEvent: false });
      this.globalFilters.departure_date = new Date(dateStr);
      // Manually clear months + add filter (from onSpecificDateSelected logic)
      this.selectedMonths.set([]);
      this.globalFilters.month = [];
      this.globalFilterArray.update(arr =>
        arr.filter(f => !f.startsWith('month=') && !f.startsWith('departure_date='))
      );
      this.addFilter(`departure_date=${dateStr}`);
      this.restoringFromParams = false;
    }

    // Handle months (array)
    if (params['month']) {
      this.restoringFromParams = true;
      const monthNums = Array.isArray(params['month']) ? params['month'].map(Number) : [Number(params['month'])];
      monthNums.forEach(monthNum => {
        if (!this.selectedMonths().includes(monthNum)) {
          this.selectedMonths.update(arr => [...arr, monthNum]);
        }
      });
      this.syncMonthFilters();  // This clears date if months are set
      this.restoringFromParams = false;
    }

    // Handle adventure styles (array) - unchanged
    if (params['adventure_style']) {
      const styleIds = Array.isArray(params['adventure_style']) ? params['adventure_style'].map(Number) : [Number(params['adventure_style'])];
      console.log("Grabbing Adv Style", styleIds);

      const validIds = styleIds.filter(id => !isNaN(id) && id > 0);

      if (validIds.length > 0) {
        if (this.adventureStyles.length > 0) {
          console.log("Styles ready: Applying to checkboxes");
          this.restoringFromParams = true;
          validIds.forEach((id: number) => {
            const index = this.adventureStyles.findIndex(s => s.id === id);
            console.log("Id", id, "Index", index);
            if (index !== -1 && !this.adventureStylesForm.at(index).value) {
              this.adventureStylesForm.at(index).setValue(true, { emitEvent: false });  // Prevent extra changes
              this.onAdventureStyleChange(index, { checked: true } as MatCheckboxChange);
            }
          });
          this.restoringFromParams = false;
        } else {
          console.log("Styles loading: Storing pending IDs", validIds);
          this.pendingAdventureStyleIds = [...new Set([...this.pendingAdventureStyleIds, ...validIds])];
          validIds.forEach(id => {
            if (!this.globalFilters.adventure_style?.includes(id)) {
              this.globalFilters.adventure_style = [...(this.globalFilters.adventure_style || []), id];
            }
          });
          this.reloadTours();
        }
      }
    }

    // Handle price range
    if (params['min_price'] || params['max_price']) {
      this.minValue = Number(params['min_price']) || this.minPrice;
      this.maxValue = Number(params['max_price']) || this.maxPrice;
      this.globalFilters.min_price = this.minValue;
      this.globalFilters.max_price = this.maxValue;
    }

    // Handle start city (add emitEvent: false to prevent loops)
    if (params['start_city']) {
      const cityName = params['start_city'];
      this.globalFilters.start_city = cityName;
      this.addFilter(`start_city=${cityName}`);
      const city = this.destinationCities.find(c => c.name === cityName);
      if (city) {
        this.startCityControl.setValue(city, { emitEvent: false });
        this.selectedStartCity = city;
        this.pendingStartCity = null;
      } else {
        this.pendingStartCity = cityName;
      }
    }

    // Handle end city (similar)
    if (params['end_city']) {
      const cityName = params['end_city'];
      this.globalFilters.end_city = cityName;
      this.addFilter(`end_city=${cityName}`);
      const city = this.destinationCities.find(c => c.name === cityName);
      if (city) {
        this.endCityControl.setValue(city, { emitEvent: false });
        this.selectedEndCity = city;
        this.pendingEndCity = null;
      } else {
        this.pendingEndCity = cityName;
      }
    }

    // Handle search city (similar)
    if (params['search_city']) {
      const cityName = params['search_city'];
      this.globalFilters.search_city = cityName;
      this.addFilter(`search_city=${cityName}`);
      const city = this.destinationCities.find(c => c.name === cityName);
      if (city) {
        this.myControl.setValue(city, { emitEvent: false });
        this.selectedSearchCity = city;
        this.pendingSearchCity = null;
      } else {
        this.pendingSearchCity = cityName;
      }
    }

    // Handle sorting (unchanged)
    if (params['filter']) {
      const sortValue = params['filter'];
      if (this.sortingOptions.some(o => o.value === sortValue)) {
        this.selectedSort = sortValue;
      }
    }

    if (this.pageCountry) {
      let loadPage = 1;
      if (isOnlyPageChange || isInitialLoad) {
        loadPage = Number(params['page']) || 1;  // Use URL page on init or page-only changes
      } else {
        this.currentPage = 1;  // Reset only on filter changes (not init/page-only)
      }
      console.log('Loading page in sub:', loadPage, 'isOnlyPageChange:', isOnlyPageChange, 'isInitialLoad:', isInitialLoad);
      this.loadToursWithCurrentFilters(loadPage);
    } else {
      console.warn('Skipping load: pageCountry not set');
    }

    this.updateActiveFilterChips();
  }


  private areParamsEqualExceptPage(oldParams: any, newParams: any): boolean {
    const oldFiltered = { ...oldParams };
    const newFiltered = { ...newParams };
    delete oldFiltered.page;
    delete newFiltered.page;
    return JSON.stringify(oldFiltered) === JSON.stringify(newFiltered);
  }



  private updateUrlWithFilters(page?: number, mergeOnlyPage = false): void {
    const queryParams: any = {};

    // Date
    if (this.globalFilters.departure_date) {
      queryParams.departure_date = this.formatDate(this.globalFilters.departure_date);
    }

    // Months (array)
    this.selectedMonths().forEach(monthNum => {
      if (!queryParams.month) queryParams.month = [];
      queryParams.month.push(monthNum);
    });

    // Adventure styles (array)
    const selectedStyles = this.getSelectedAdventureStyles();
    if (selectedStyles.length > 0) {
      queryParams.adventure_style = selectedStyles;
    }

    // Price
    if (this.globalFilters.min_price && this.globalFilters.min_price > this.minPrice) {
      queryParams.min_price = this.globalFilters.min_price;
    }
    if (this.globalFilters.max_price && this.globalFilters.max_price < this.maxPrice) {
      queryParams.max_price = this.globalFilters.max_price;
    }

    // Start/End cities
    if (this.globalFilters.start_city) {
      queryParams.start_city = this.globalFilters.start_city;
    }
    if (this.globalFilters.end_city) {
      queryParams.end_city = this.globalFilters.end_city;
    }

    // Search city
    if (this.globalFilters.search_city) {
      queryParams.search_city = this.globalFilters.search_city;
    }

    // Sorting - FIXED: Use 'filter' to match backend
    if (this.selectedSort) {
      queryParams.filter = this.selectedSort;  // ← Changed from 'sort'
    }

    if (page !== undefined) {
      queryParams.page = page;
    }

    const navOptions: NavigationExtras = {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true,
    };

    if (mergeOnlyPage && page !== undefined) {
      navOptions.queryParamsHandling = 'merge';
      navOptions.queryParams = { page };
    } else {
      navOptions.queryParamsHandling = '';
    }

    // Log only if needed (remove for prod)
    if (page !== undefined) console.log("Updating URL with page:", page);

    // this.router.navigate([], navOptions).then(() => {
    //   this.loadToursWithCurrentFilters(page ?? 1);
    // });

    this.router.navigate([], navOptions);


  }



  private handleCountryRouting(): void {
    const countryFromUrl = this.route.snapshot.paramMap.get('country');
    this.selectedCountry = countryFromUrl || null;

    if (isPlatformBrowser(this.platformId)) {
      if (countryFromUrl) {
        localStorage.setItem('selectedCountry', countryFromUrl);
      } else {
        const savedCountry = localStorage.getItem('selectedCountry');
        const targetCountry = savedCountry || 'india';
        localStorage.setItem('selectedCountry', targetCountry);
        this.router.navigate([`/${targetCountry}`], { replaceUrl: true });
      }

      // if (this.selectedCountry === 'india') {
      //   this.selectedCurrency = this.currencies.find(c => c.code === 'INR')!;
      // }
    }
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

        this.setupCityAutocompletes();
        this.applyPendingCities();
      },
      error: (err) => {
        console.error('Failed to load cities:', err);
        this.destinationCities = [];
        this.setupCityAutocompletes();
        this.applyPendingCities();
      }
    });
  }

  private applyPendingCities(): void {
    if (this.pendingStartCity) {
      const city = this.destinationCities.find(c => c.name === this.pendingStartCity!);
      if (city) {
        this.startCityControl.setValue(city, { emitEvent: false });
        this.selectedStartCity = city;
        this.pendingStartCity = null;
      }
    }

    if (this.pendingEndCity) {
      const city = this.destinationCities.find(c => c.name === this.pendingEndCity!);
      if (city) {
        this.endCityControl.setValue(city, { emitEvent: false });
        this.selectedEndCity = city;
        this.pendingEndCity = null;
      }
    }

    if (this.pendingSearchCity) {
      const city = this.destinationCities.find(c => c.name === this.pendingSearchCity!);
      if (city) {
        this.myControl.setValue(city, { emitEvent: false });
        this.selectedSearchCity = city;
        this.pendingSearchCity = null;
      }
    }

    this.updateActiveFilterChips();
  }

  private setupCityAutocompletes(): void {
    this.filteredStartCities$ = this.startCityControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterCities(typeof value === 'string' ? value : value?.name ?? ''))
    );

    this.filteredEndCities$ = this.endCityControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterCities(typeof value === 'string' ? value : value?.name ?? ''))
    );

    this.filteredOptions$ = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterCities(typeof value === 'string' ? value : value?.name ?? ''))
    );
  }

  private filterCities(term: string): { id: number; name: string }[] {
    if (!term) return this.destinationCities;
    const filterValue = term.toLowerCase();
    return this.destinationCities.filter(city => city.name.toLowerCase().includes(filterValue));
  }

  displayFn(city: { id: number; name: string } | string | null): string {
    return city && typeof city === 'object' ? city.name : '';
  }

  onStartCitySelected(event: MatAutocompleteSelectedEvent): void {
    const city = event.option.value as { id: number; name: string };
    if (this.globalFilters.start_city) {
      this.removeFilter(`start_city=${this.globalFilters.start_city}`);
    }
    this.selectedStartCity = city;
    this.globalFilters.start_city = city.name;
    this.addFilter(`start_city=${city.name}`);
    this.pendingStartCity = null;
    this.reloadTours();
    this.updateActiveFilterChips();
    this.updateUrlWithFilters();
  }

  onEndCitySelected(event: MatAutocompleteSelectedEvent): void {
    const city = event.option.value as { id: number; name: string };
    if (this.globalFilters.end_city) {
      this.removeFilter(`end_city=${this.globalFilters.end_city}`);
    }
    this.selectedEndCity = city;
    this.globalFilters.end_city = city.name;
    this.addFilter(`end_city=${city.name}`);
    this.pendingEndCity = null;
    this.reloadTours();
    this.updateActiveFilterChips();
    this.updateUrlWithFilters();
  }

  onCitySelected(event: MatAutocompleteSelectedEvent): void {
    const city = event.option.value as { id: number; name: string };
    if (this.globalFilters.search_city) {
      this.removeFilter(`search_city=${this.globalFilters.search_city}`);
    }
    this.selectedSearchCity = city;
    this.globalFilters.search_city = city.name
    this.addFilter(`search_city=${city.name}`);
    this.pendingSearchCity = null;
    this.reloadTours();
    this.updateActiveFilterChips();
    this.updateUrlWithFilters();
  }

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


  private loadAdventureStyles(): void {  // Keep void (no Promise needed now)
    this.loadingAdventureStyles = true;
    this.getAdventureStyles().subscribe({
      next: (data) => {
        this.adventureStyles = data;
        this.adventureStylesForm = new FormArray<FormControl<boolean>>(
          data.map(() => new FormControl<boolean>(false, { nonNullable: true }))
        );
        this.loadingAdventureStyles = false;
        console.log('Adventure styles loaded:', data);

        // NEW: Apply any pending IDs now that data/UI is ready
        if (this.pendingAdventureStyleIds.length > 0) {
          console.log("Applying pending styles:", this.pendingAdventureStyleIds);
          this.restoringFromParams = true;
          this.pendingAdventureStyleIds.forEach((id: number) => {
            const index = this.adventureStyles.findIndex(s => s.id === id);
            if (index !== -1 && !this.adventureStylesForm.at(index).value) {
              this.adventureStylesForm.at(index).setValue(true);
              this.onAdventureStyleChange(index, { checked: true } as MatCheckboxChange);
              console.log(`Applied pending ID ${id} at index ${index}`);
            } else {
              console.warn(`Pending ID ${id} not found after load (index: ${index})`);
            }
          });
          this.restoringFromParams = false;
          this.pendingAdventureStyleIds = [];  // Clear after apply
        }

            },
      error: (err) => {
        console.error('Failed to load adventure styles:', err);
        this.adventureStyles = [];
        this.adventureStylesForm = new FormArray<FormControl<boolean>>([]);
        this.loadingAdventureStyles = false;
        this.pendingAdventureStyleIds = [];  // Clear on error
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
    if (!this.restoringFromParams) {
      this.reloadTours();
      this.updateUrlWithFilters();
    }
    this.updateActiveFilterChips();
  }

  getSelectedAdventureStyles(): number[] {
    return this.adventureStylesForm.controls
      .map((control, index) => control.value ? this.adventureStyles[index].id : null)
      .filter((id): id is number => id !== null);
  }

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



  private loadToursWithCurrentFilters(page: number = 1): void {
    if (!this.pageCountry) return;

    const params: any = {};
    const baseUrl = `${this.backendUrlService.getTournTripUrl()}countries/${this.pageCountry.id}/tours/`;
    const url = new URL(baseUrl);

    this.currentPage = page;  // ← MOVED: Set early, before validation

    // NEW: Skip validation if totalPages unknown (initial load/refresh); backend handles invalid pages
    if (this.totalPages > 0) {
      const validPage = Math.max(1, Math.min(page, this.totalPages));
      if (validPage !== page) {
        this.currentPage = validPage;
        this.updateUrlWithFilters(validPage, true);  // Merge-only for page
        return;
      }
    }

    // Rebuild ALL current filters (add to params for URL/HTTP)
    if (this.minValue > this.minPrice) params.min_price = this.minValue;
    if (this.maxValue < this.maxPrice) params.max_price = this.maxValue;
    if (this.globalFilters.search_city) params.city_name = this.globalFilters.search_city;
    if (this.globalFilters.departure_date) {
      params.departure_date = this.formatDate(this.globalFilters.departure_date);
    }
    this.selectedMonths().forEach(m => {
      if (!params.month) params.month = [];
      params.month.push(m);
    });
    if (this.globalFilters.start_city) params.start_city = this.globalFilters.start_city;
    if (this.globalFilters.end_city) params.end_city = this.globalFilters.end_city;
    if (this.selectedSort) params.filter = this.selectedSort;

    const selectedStyles = this.globalFilters.adventure_style || [];
    if (selectedStyles.length > 0) {
      params.adventure_style = selectedStyles;
    }

    // Add pagination
    url.searchParams.set('page', page.toString());
    url.searchParams.set('page_size', this.pageSize.toString());

    // Append all other params
    Object.keys(params).forEach(key => {
      if (Array.isArray(params[key])) {
        params[key].forEach((val: any) => url.searchParams.append(key, val));
      } else {
        url.searchParams.set(key, params[key]);
      }
    });

    console.log('Loading tours from:', url.toString());

    this.loadingTours = true;
    this.toursSub?.unsubscribe();





    this.toursSub = this.http.get<ToursResponse>(url.toString()).subscribe({
      next: (response) => {
        this.tours = response.results;
        this.totalTours = response.count;
        this.totalPages = Math.ceil(this.totalTours / this.pageSize) || 1;
        if (this.totalTours === 0 || this.currentPage > this.totalPages) {
          this.currentPage = 1;
          this.updateUrlWithFilters(1, true);
        }
        this.loadingTours = false;
      },
      error: (err) => {
        console.error('Failed to load tours:', err);
        this.tours = [];
        this.totalTours = 0;
        this.totalPages = 1;  // Fallback
        this.loadingTours = false;
      }
    });



  }



  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      const newPage = this.currentPage - 1;
      this.isPageOnlyChange = true;  // ← FIXED: Set BEFORE nav
      this.updateUrlWithFilters(newPage, true);  // ← Merge-only for page
      this.isPageOnlyChange = false;  // ← Reset AFTER
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      const newPage = this.currentPage + 1;
      this.isPageOnlyChange = true;  // ← FIXED: Set BEFORE nav
      this.updateUrlWithFilters(newPage, true);  // ← Merge-only for page
      this.isPageOnlyChange = false;  // ← Reset AFTER
    }
  }

  trackByTourId(index: number, tour: Tour): number {
    return tour.id;
  }

  onRangeChange(value: number, type: 'min' | 'max'): void {
    this.globalFilters.min_price = this.minValue;
    this.globalFilters.max_price = this.maxValue;
    this.updateUrlWithFilters();
    this.updateActiveFilterChips();
  }

  onSortChange(): void {
    this.updateUrlWithFilters();
    this.reloadTours();
  }

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
    this.globalFilterArray.update(arr => arr.filter(f => !f.startsWith('month=')));
    currentSelected.forEach(month => this.addFilter(`month=${month}`));
    this.globalFilters.month = [...currentSelected];
    if (!this.restoringFromParams) {
      this.reloadTours();
      this.updateUrlWithFilters();
    }
    this.updateActiveFilterChips();
  }

  private addFilter(filter: string): void {
    this.globalFilterArray.update(arr => arr.includes(filter) ? arr : [...arr, filter]);
  }

  removeFilter(filter: string): void {
    this.globalFilterArray.update(arr => arr.filter(f => f !== filter));
  }

  private reloadTours(): void {
    this.updateActiveFilterChips();
  }

  private onSpecificDateSelected(dateStr: string): void {
    this.selectedMonths.set([]);
    this.globalFilterArray.update(arr => arr.filter(f => !f.startsWith('month=')));
    this.globalFilterArray.update(arr => arr.filter(f => !f.startsWith('departure_date=')));
    this.addFilter(`departure_date=${dateStr}`);
    this.globalFilters.month = [];
    this.globalFilters.departure_date = new Date(dateStr);
    this.updateUrlWithFilters();
    this.updateActiveFilterChips();
  }

  private onSpecificDateCleared(): void {
    this.globalFilterArray.update(arr => arr.filter(f => !f.startsWith('departure_date=')));
    this.globalFilters.departure_date = undefined;
    this.updateUrlWithFilters();
    this.updateActiveFilterChips();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private updateActiveFilterChips(): void {
    const chips: FilterChip[] = [];

    if (this.globalFilters.departure_date) {
      const dateStr = this.formatDate(this.globalFilters.departure_date);
      chips.push({ key: `departure_date=${dateStr}`, label: `Departure: ${dateStr}` });
    }

    this.selectedMonths().forEach(monthNum => {
      const month = this.months.find(m => m.value === monthNum);
      if (month) {
        chips.push({ key: `month=${monthNum}`, label: `Month: ${month.label}` });
      }
    });

    if (this.globalFilters.start_city) {
      chips.push({ key: `start_city=${this.globalFilters.start_city}`, label: `Start: ${this.globalFilters.start_city}` });
    }

    if (this.globalFilters.end_city) {
      chips.push({ key: `end_city=${this.globalFilters.end_city}`, label: `End: ${this.globalFilters.end_city}` });
    }

    if (this.minValue > this.minPrice || this.maxValue < this.maxPrice) {
      chips.push({
        key: `price=${this.minValue}-${this.maxValue}`,
        label: `Price: ${this.selectedCurrency.symbol}${this.minValue} - ${this.selectedCurrency.symbol}${this.maxValue}`
      });
    }

    this.adventureStylesForm.controls.forEach((control, i) => {
      if (control.value) {
        const style = this.adventureStyles[i];
        chips.push({ key: `adventure_style=${style.id}`, label: `Style: ${style.name}` });
      }
    });

    if (this.globalFilters.search_city) {
      chips.push({ key: `search_city=${this.globalFilters.search_city}`, label: `Search: ${this.globalFilters.search_city}` });
    }

    // ----- NEW: SORT CHIP -----
    if (this.selectedSort) {
      const option = this.sortingOptions.find(o => o.value === this.selectedSort);
      if (option) {
        chips.push({
          key: `sort=${this.selectedSort}`,               // unique key
          label: `Sort: ${option.label}`
        });
      }
    }

    // At the end of updateActiveFilterChips():
    if (this.currentPage > 1) {
      const pageKey = `page=${this.currentPage}`;
      chips.push({ key: pageKey, label: `Page: ${this.currentPage}` });
      this.addFilter(pageKey);  // ← NEW: Track in globalFilterArray for removal
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
    } else if (type === 'month') {
      const monthNum = +value;
      this.selectedMonths.update(arr => arr.filter(m => m !== monthNum));
      this.syncMonthFilters();
    } else if (type === 'start_city') {
      this.globalFilters.start_city = undefined;
      this.selectedStartCity = null;
      this.pendingStartCity = null;
      this.startCityControl.setValue('');
      this.removeFilter(key);
    } else if (type === 'end_city') {
      this.globalFilters.end_city = undefined;
      this.selectedEndCity = null;
      this.pendingEndCity = null;
      this.endCityControl.setValue('');
      this.removeFilter(key);
    } else if (type === 'price') {
      this.minValue = this.minPrice;
      this.maxValue = this.maxPrice;
      this.globalFilters.min_price = undefined;
      this.globalFilters.max_price = undefined;
    } else if (type === 'adventure_style') {
      const styleId = +value;
      const index = this.adventureStyles.findIndex(s => s.id === styleId);
      if (index !== -1) {
        this.adventureStylesForm.at(index).setValue(false);
        this.onAdventureStyleChange(index, { checked: false } as MatCheckboxChange);
      }
    } else if (type === 'search_city') {
      this.globalFilters.search_city = undefined;
      this.selectedSearchCity = null;
      this.pendingSearchCity = null;
      this.myControl.setValue('');
      this.removeFilter(key);
    }
    // ----- NEW: SORT -----
    else if (type === 'sort') {
      this.selectedSort = '';               // reset model
      this.onSortChange();                  // clean URL + reload
    }

    else if (type === 'page') {
      this.currentPage = 1;
      this.removeFilter(key);  // Remove from globalFilterArray if tracked there
      this.updateUrlWithFilters(1);  // Updates URL and triggers loadToursWithCurrentFilters(1)
    }

    this.updateActiveFilterChips();
    this.updateUrlWithFilters();
  }

  clearAllFilters(): void {
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

    this.selectedSort = '';

    this.globalFilterArray.set([]);
    this.pendingStartCity = null;
    this.pendingEndCity = null;
    this.pendingSearchCity = null;
    this.reloadTours();
    // ... (keep existing resets)
    this.router.navigate([], { relativeTo: this.route, queryParams: { page: 1 }, replaceUrl: true });  // Force page=1
    this.loadToursWithCurrentFilters(1);
    this.updateActiveFilterChips();
  }

  onFilterMenuClosed(): void { }


  applyFilters(): void {
    this.loadToursWithCurrentFilters(1); // ← Always reset to page 1
    this.updateActiveFilterChips();
  }

  toggleDeparture() { this.isDepartureOpen = !this.isDepartureOpen; }
  toggleAdventure() { this.isAdventureStyles = !this.isAdventureStyles; }
  toggleStartandEndCity() { this.isStartandEndCityOpen = !this.isStartandEndCityOpen; }

  ngOnDestroy(): void {
    this.countrySub?.unsubscribe();
    this.citiesSub?.unsubscribe();
    this.toursSub?.unsubscribe();
    this.startCitySub?.unsubscribe();
    this.endCitySub?.unsubscribe();
    this.searchCitySub?.unsubscribe();
  }


  @HostListener('wheel', ['$event'])
  onWheel(e: WheelEvent) {
    const container = e.target as HTMLElement;
    const scrollContainer = container.closest('.applied-filters-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }




  // tours.component.ts — only change this method
openFullscreen() {
  this.modalService.open(this.modalContent, {
    fullscreen: true,
    windowClass: 'filters-modal',
    backdrop: 'static',
    keyboard: true, // optional: prevent ESC close if you want
  });
}


openSearch() {
  this.modalService.open(this.searchModal, {
    fullscreen: true,
    backdrop: true,
    keyboard: true,
    modalDialogClass: 'mat-modal',
    centered: true,
    scrollable: true,
    backdropClass: 'light-backdrop',
    container: 'body'  // IMPORTANT
  });
}







}

