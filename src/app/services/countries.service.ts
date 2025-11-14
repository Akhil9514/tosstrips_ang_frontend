// countries.service.ts - New service to share countries between components
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Country } from '../models/country.model'; // Adjust path as needed

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  private countriesSubject = new BehaviorSubject<Country[]>([]);
  public countries$: Observable<Country[]> = this.countriesSubject.asObservable();

  setCountries(countries: Country[]): void {
    this.countriesSubject.next(countries);
  }

  getCountries(): Country[] {
    return this.countriesSubject.value;
  }
}