import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CountryComponentComponent } from './components/country-component/country-component.component';
import { PaymentComponent } from './components/payment/payment.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { MyBookingComponent } from './components/my-booking/my-booking.component';
import { TravelAlertsComponent } from './components/travel-alerts/travel-alerts.component';
import { AfterYourBookingComponent } from './components/after-your-booking/after-your-booking.component';
import { CancellationPolicyComponent } from './components/cancellation-policy/cancellation-policy.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { TermsAndConditionsComponent } from './components/terms-and-conditions/terms-and-conditions.component';
import { FaqComponent } from './components/faq/faq.component';
import { DaysToComeComponent } from './components/days-to-come/days-to-come.component';
import { WinAnAdventureComponent } from './components/win-an-adventure/win-an-adventure.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'payment/:id', component: PaymentComponent }, 
  { path: 'about-us', component: AboutUsComponent },  
  { path: 'contact-us', component: ContactUsComponent }, 
  { path: 'my-booking', component: MyBookingComponent},
    {path: 'travel-alerts', component:TravelAlertsComponent},
    {path: 'after-your-booking', component: AfterYourBookingComponent},
    {path: 'cancellations-and-rebookings', component:CancellationPolicyComponent},
    {path: 'privacy-policy', component: PrivacyPolicyComponent },
    {path: 'terms-and-conditions', component: TermsAndConditionsComponent},
    {path:'FAQ', component: FaqComponent},
    {path: 'days-to-come', component: DaysToComeComponent},
    {path: 'win-an-adventure', component: WinAnAdventureComponent},

  { path: ':country', component: CountryComponentComponent },
  { path: '**', redirectTo: '' }
];
