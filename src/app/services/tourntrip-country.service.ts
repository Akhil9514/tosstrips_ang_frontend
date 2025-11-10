// src/app/services/tourntrip-country.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Country } from '../models/country.model';

@Injectable({
  providedIn: 'root'
})
export class TourntripCountryService {

  private readonly STORAGE_KEY = 'tourntrip_country';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

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
}