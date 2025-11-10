// requesting-location.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RequestingLocationService {
  private readonly countrySubject = new BehaviorSubject<string>('USA');
  public readonly country$: Observable<string> = this.countrySubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadInitialCountry();
    this.setupStorageListener();
  }

  /** Load the saved value (or fallback) – only in the browser */
  private loadInitialCountry(): void {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('requestingLocationCountry');
      this.setCountry(saved ?? 'USA');
    }
  }

  /** Public API – used by the dropdown component */
  setCountry(country: string): void {
    this.countrySubject.next(country);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('requestingLocationCountry', country);
    }
  }

  /** Listen to changes that happen in *other* tabs/windows */
  private setupStorageListener(): void {
    if (isPlatformBrowser(this.platformId)) {
      const handler = (event: StorageEvent) => {
        if (event.key === 'requestingLocationCountry' && event.newValue) {
          this.countrySubject.next(event.newValue);
        }
      };

      window.addEventListener('storage', handler);

      // Clean-up when Angular destroys the service (unlikely, but good practice)
      // If you ever need it, inject NgZone and run the removal in ngOnDestroy.
    }
  }
}