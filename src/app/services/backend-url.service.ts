import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackendUrlService {

  // private mainUrl: string = 'http://127.0.0.1:8000/'
  // private mainUrl: string ='https://mybackend.app/'
  private mainUrl: string = "http://34.228.153.200/"

  private tourntripUrl: string = this.mainUrl + 'tourntrips/'; // Django backend URL
  private bookingUrl: string = this.mainUrl + 'bookings/'; // Django backend URL
  
  constructor() {}


  getMainUrl(): string {
    return this.mainUrl;
  }

  getTournTripUrl(): string {
    return this.tourntripUrl;
  }
  getBookingUrl(): string {
    return this.bookingUrl;
  }



}
