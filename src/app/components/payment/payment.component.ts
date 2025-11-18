import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, Subscription } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { Tour, ToursResponse } from '../../models/tour.model';
import { BackendUrlService } from '../../services/backend-url.service';
import { MatMenuModule } from '@angular/material/menu'; // Add this import
import { RequestingLocationService } from '../../services/requesting-location.service'; // Add this import
import Swal from 'sweetalert2';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatNativeDateModule,
    MatMenuModule,
    MatCheckbox,
    MatButtonModule,
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit, OnDestroy {
  paymentForm: FormGroup;
  tourId: number | null = null;
  tourData: any = null;
  travelers = { adult: 1, child: 0, infant: 0 }; // Track travelers state
  today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  submitError: string = '';
  startDateFormatted: string = '';
  endDateFormatted: string = '';
  country: string = 'USA'; // Current country from service
  private countrySubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private backendUrlService: BackendUrlService,
    private requestingLocationService: RequestingLocationService  // Inject the service
  ) {
    this.paymentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      nationality: ['', Validators.required],
      checkIn: ['', [Validators.required]],
      checkOut: ['', [Validators.required]],
      travelers: ['', Validators.required], // Initial empty; set via updateDisplay()
      hotelRating: ['', Validators.required],
      directFlight: [false]
    }, { validators: this.dateRangeValidator, updateOn: 'blur' });
    // Set initial display after form creation
    this.updateDisplay();
  }

  // Custom validator for min date (using matDatepickerMin error key)
  minDateValidator(minDate: Date | string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value || !minDate) return null;
      const controlDate = new Date(value);
      const min = new Date(minDate);
      if (controlDate < min) {
        return { matDatepickerMin: { value: control.value, minDate } };
      }
      return null;
    };
  }

  // Dynamic validator for checkOut after checkIn
  dateAfterCheckInValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const checkOut = control.value;
      const checkIn = this.paymentForm?.get('checkIn')?.value;
      if (!checkOut || !checkIn) return null;
      const outDate = new Date(checkOut);
      const inDate = new Date(checkIn);
      if (outDate <= inDate) {
        return { matDatepickerMin: { value: checkOut, minDate: checkIn } };
      }
      return null;
    };
  }

  // Form-level validator for date range
  dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const checkIn = group.get('checkIn')?.value;
    const checkOut = group.get('checkOut')?.value;
    if (checkIn && checkOut && new Date(checkOut) < new Date(checkIn)) {
      return { dateRange: true };
    }
    return null;
  }

  // Get formatted display string for travelers
  getTravelersDisplay(): string {
    const parts: string[] = [];
    if (this.travelers.adult > 0) {
      parts.push(`${this.travelers.adult} Adult${this.travelers.adult !== 1 ? 's' : ''}`);
    }
    if (this.travelers.child > 0) {
      parts.push(`${this.travelers.child} Child${this.travelers.child !== 1 ? 'ren' : ''}`);
    }
    if (this.travelers.infant > 0) {
      parts.push(`${this.travelers.infant} Infant${this.travelers.infant !== 1 ? 's' : ''}`);
    }
    return parts.length > 0 ? parts.join(', ') : 'Add Travelers';
  }

  // Update the form control with current display
  private updateDisplay(): void {
    this.paymentForm.get('travelers')?.setValue(this.getTravelersDisplay());
    this.paymentForm.get('travelers')?.markAsTouched();
  }

  ngOnInit(): void {
    this.tourId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (this.tourId) {
      console.log('Tour ID from URL:', this.tourId);
      this.fetchTourById(this.tourId).subscribe({
        next: (data) => {
          this.tourData = data;
          console.log('Fetched Tour Data:', data);
          if (this.tourData) {
            const start = new Date(this.tourData.departure_date);
            this.startDateFormatted = start.toLocaleDateString('en-GB', {
              weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
            });
            
            const end = new Date(start);
            end.setDate(start.getDate() + (this.tourData._days - 1));
            this.endDateFormatted = end.toLocaleDateString('en-GB', {
              weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
            });
            // Apply min date validators after tour data loads
            this.paymentForm.get('checkIn')?.setValidators([
              Validators.required,
              this.minDateValidator(this.tourData.departure_date)
            ]);
            this.paymentForm.get('checkOut')?.setValidators([
              Validators.required,
              this.dateAfterCheckInValidator()
            ]);
            this.paymentForm.get('checkIn')?.updateValueAndValidity();
            this.paymentForm.get('checkOut')?.updateValueAndValidity();
          }
        },
        error: (error) => {
          console.error('Error fetching tour:', error);
          this.submitError = 'Failed to load tour details. Please try again.';
        }
      });
    } else {
      console.error('No tour ID found in URL');
      this.submitError = 'Invalid tour ID.';
    }
    // Listen for checkIn changes to update checkOut validator
    this.paymentForm.get('checkIn')?.valueChanges.subscribe(() => {
      this.paymentForm.get('checkOut')?.updateValueAndValidity();
    });

    // Subscribe to country changes
    this.countrySubscription = this.requestingLocationService.country$.subscribe(country => {
      this.country = country;
    });
  }

  ngOnDestroy(): void {
    if (this.countrySubscription) {
      this.countrySubscription.unsubscribe();
    }
  }

  clearDate(field: string): void {
    this.paymentForm.get(field)?.setValue(null);
  }

  updateTravelers(type: 'adult' | 'child' | 'infant', delta: number): void {
    const current = this.travelers[type];
    if (current + delta >= 0) {
      this.travelers[type] += delta;
      this.updateDisplay(); // Update display after change
    }
    // Menu closes automatically on button click within matMenuItem
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      const formValue = this.paymentForm.value;
      // Sanitize inputs (trim strings)
      Object.keys(formValue).forEach(key => {
        if (typeof formValue[key] === 'string' && formValue[key]) {
          formValue[key] = formValue[key].trim();
        }
      });

      // Prepare backend payload
      const requestCountry = this.country;
      const hotelRatingValue = parseInt(formValue.hotelRating.split(' ')[0], 10);
      const checkInDate = new Date(formValue.checkIn).toISOString().split('T')[0]; // YYYY-MM-DD
      const checkOutDate = new Date(formValue.checkOut).toISOString().split('T')[0]; // YYYY-MM-DD

      const bookingData = {
        request_country: requestCountry,
        traveller: {
          name: formValue.name,
          phone_number: formValue.phoneNumber, // No '+' added; model allows optional
          email: formValue.email,
          nationality: formValue.nationality,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          hotel_rating: hotelRatingValue,
          is_direct_flight: formValue.directFlight,
          count: {
            adults: this.travelers.adult,
            children: this.travelers.child,
            infants: this.travelers.infant
          }
        },
        tour: this.tourId,
        notes: ''  // Can be extended if notes field added to form
      };

      console.log('Booking Data to Backend:', bookingData);

      // Assume backend URL for visiting/bookings; adjust via BackendUrlService if needed
      const url = `${this.backendUrlService.getBookingUrl()}visiting/`; // Or add getVisitingUrl() to service

      this.http.post(url, bookingData).subscribe({
        next: (response) => {
          console.log('Booking created:', response);
          Swal.fire({
            title: 'Booking Submitted!',
            text: `Thank you, ${formValue.name}! Your tailored trip details have been received.`,
            icon: 'success',
            confirmButtonText: 'OK',
            timer: 3500, // Auto-close after 3 seconds (optional)
            showClass: {
              popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
            }
          }).then((result) => {
            if (result.isConfirmed) {
              // Optional: Reset form or navigate after confirmation
              this.paymentForm.reset();
              this.updateDisplay(); // Reset travelers display
            }
          });
          this.submitError = ''; // Clear errors on success
        },
        error: (error) => {
          console.error('Booking submission error:', error);
          Swal.fire({
            title: 'Oops...',
            text: 'Failed to submit booking. Please try again.',
            icon: 'error',
            confirmButtonText: 'Got it'
          });
        }
      });
    } else {
      // Error alert with SweetAlert2
      Swal.fire({
        title: 'Oops...',
        text: 'Please fix the errors before submitting.',
        icon: 'warning',
        confirmButtonText: 'Got it',
        footer: '<a href="">Need help? Contact support</a>' // Optional footer link
      });
      // Mark fields as touched for validation display
      Object.keys(this.paymentForm.controls).forEach(key => {
        this.paymentForm.get(key)?.markAsTouched();
      });
    }
  }

  private fetchTourById(tourId: number): Observable<Tour> {
    const url = `${this.backendUrlService.getTournTripUrl()}tours/${tourId}/`;
    return this.http.get<Tour>(url).pipe(
      tap(data => console.log('Raw API response for tour:', data)),
      catchError(error => {
        console.error('Failed to load tour:', error);
        return throwError(() => error);
      })
    );
  }








  // Add this method inside your PaymentComponent class
triggerRipple(event: MouseEvent): void {
  const button = event.currentTarget as HTMLElement;
  const ripple = document.createElement('span');
  
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.classList.add('ripple');
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  button.appendChild(ripple);

  // Remove the ripple element after animation ends
  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
}
}