import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CountryComponentComponent } from './components/country-component/country-component.component';
import { PaymentComponent } from './components/payment/payment.component';


export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: ':country', component: CountryComponentComponent }, 
    { path: 'payment/:id', component: PaymentComponent }, 
    { path: '**', redirectTo: '' }
];
