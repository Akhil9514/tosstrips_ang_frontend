import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BackendUrlService } from '../../services/backend-url.service';
import Swal from 'sweetalert2'; // Import SweetAlert2

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent implements OnInit {

  contactForm: FormGroup;
  isSubmitted = false;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder, private http: HttpClient,
    private backendUrlService: BackendUrlService,
  ) {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]], // Relaxed to 3 chars
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    // Mark all fields as touched to show errors immediately
    this.contactForm.markAllAsTouched();
    if (this.contactForm.invalid) {
      this.isSubmitted = true;
      this.errorMessage = 'Please fill in all fields correctly.';
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Sanitize form data (trim whitespace, escape basic HTML if needed)
    const formData = {
      full_name: this.sanitizeInput(this.contactForm.value.fullName),
      email: this.sanitizeInput(this.contactForm.value.email),
      subject: this.sanitizeInput(this.contactForm.value.subject),
      message: this.sanitizeInput(this.contactForm.value.message)
    };

    const url = `${this.backendUrlService.getBookingUrl()}contact/`;

    // HTTP POST to Django API
    this.http.post(url, formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        const successMsg = response.message || 'Thank you for your message! We will get back to you soon.';
        
        // Show SweetAlert on success
        Swal.fire({
          title: 'Success!',
          text: successMsg,
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 3000, // Auto-close after 3 seconds (optional)
          timerProgressBar: true
        }).then((result) => {
          if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
            this.contactForm.reset();
            this.isSubmitted = false;
          }
        });
        
        this.successMessage = successMsg; // Optionally keep the div message as fallback
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.errors?.non_field_errors?.[0] || 
                           error.error?.errors?.message || 
                           'An error occurred. Please try again.';
      }
    });
  }

  // Basic sanitization: trim, remove leading/trailing whitespace, and escape common HTML entities
  private sanitizeInput(value: string): string {
    if (!value) return '';
    return value.trim()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  // Getter for easy template access
  get f() { return this.contactForm.controls; }

  // Helper to check if control has value (for floating labels)
  hasValue(controlName: string): boolean {
    return !!this.contactForm.get(controlName)?.value?.trim();
  }
}