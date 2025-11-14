import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class BusyService {
  private busyRequestCount = 0;
  private spinnerShownAt: number | null = null;
  private hideTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly minDisplayMs = 3000; // minimum spinner display time in ms

  constructor(private spinnerService: NgxSpinnerService) {}

  busy() {
    this.busyRequestCount++;

    // If there was a pending hide scheduled, cancel it because a new request started
    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId);
      this.hideTimeoutId = null;
    }

    // Only show the spinner on the transition from 0 -> 1
    if (this.busyRequestCount === 1) {
      this.spinnerShownAt = Date.now();
      this.spinnerService.show();
    }
  }

  idle() {
    if (this.busyRequestCount > 0) {
      this.busyRequestCount--;
    }

    if (this.busyRequestCount <= 0) {
      this.busyRequestCount = 0;

      const shownAt = this.spinnerShownAt ?? 0;
      const elapsed = Date.now() - shownAt;
      const remaining = this.minDisplayMs - elapsed;

      // If spinner already shown for long enough, hide immediately
      if (remaining <= 0) {
        this.spinnerShownAt = null;
        this.spinnerService.hide();
      } else {
        // Otherwise schedule hide after the remaining time
        this.hideTimeoutId = setTimeout(() => {
          this.spinnerShownAt = null;
          this.hideTimeoutId = null;
          this.spinnerService.hide();
        }, remaining);
      }
    }
  }
}