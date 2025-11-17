// src/app/services/tourntrip-country.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { BackendUrlService } from './backend-url.service';  // Assuming this service exists for base URL
import { Country } from '../models/country.model';

@Injectable({
  providedIn: 'root'
})
export class TourntripCountryService {

  private readonly STORAGE_KEY = 'tourntrip_country';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private backendUrlService: BackendUrlService
  ) {}

  // Save country to localStorage
  setCountry(country: Country): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(country));
    }
  }

  // Retrieve country from localStorage
  getCountry(): Country | null {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    }
    return null;
  }

  // Optional: Clear saved country
  clearCountry(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  // NEW: Load country by slug from backend (with caching)
  loadCountryBySlug(slug: string): Observable<Country | null> {
    const url = `${this.backendUrlService.getTournTripUrl()}countries/?slug=${slug}`;
    return this.http.get<Country[]>(url).pipe(
      // Assuming backend returns array; take first (or adjust if single object)
      map(countries => countries[0] || null),
      tap(country => {
        if (country) {
          this.setCountry(country);  // Cache in localStorage for future gets
        }
      }),
      // Handle errors (e.g., 404) by returning null instead of throwing
      catchError(error => {
        console.error(`Failed to load country for slug '${slug}':`, error);
        return throwError(() => error);
      })
    );
  }

  // NEW: Get country by slug (sync, from cache; returns null if not cached or no match)
  getCountryBySlug(slug: string): Country | null {
    const cached = this.getCountry();
    // Derive slug from name (lowercase) for matching
    const derivedSlug = cached?.name.toLowerCase();
    return cached && derivedSlug === slug ? cached : null;
  }
}