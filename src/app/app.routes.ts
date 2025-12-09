import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CountryComponentComponent } from './components/country-component/country-component.component';
import { PaymentComponent } from './components/payment/payment.component';

import { AboutUsComponent } from './components/about-us/about-us.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';

// Footer
import { MyBookingComponent } from './components/my-booking/my-booking.component';
import { TravelAlertsComponent } from './components/travel-alerts/travel-alerts.component';
import { AfterYourBookingComponent } from './components/after-your-booking/after-your-booking.component';
import { CancellationPolicyComponent } from './components/cancellation-policy/cancellation-policy.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { TermsAndConditionsComponent } from './components/terms-and-conditions/terms-and-conditions.component';
import { FaqComponent } from './components/faq/faq.component';
import { DaysToComeComponent } from './components/days-to-come/days-to-come.component';
import { WinAnAdventureComponent } from './components/win-an-adventure/win-an-adventure.component';

// Ways to Explore
import { SailingToursComponent } from './components/ways-to-explore/sailing-tours/sailing-tours.component';
import { OverlandJourneysComponent } from './components/ways-to-explore/overland-journeys/overland-journeys.component';
import { WellnessRetreatsComponent } from './components/ways-to-explore/wellness-retreats/wellness-retreats.component';
import { ExplorerTripsComponent } from './components/ways-to-explore/explorer-trips/explorer-trips.component';
import { WildlifeSafarisComponent } from './components/ways-to-explore/wildlife-safaris/wildlife-safaris.component';
import { FeelTheCultureComponent } from './components/ways-to-explore/feel-the-culture/feel-the-culture.component';
import { TasteTheWorldComponent } from './components/ways-to-explore/taste-the-world/taste-the-world.component';
import { CyclicAdventuresComponent } from './components/ways-to-explore/cyclic-adventures/cyclic-adventures.component';
import { RiverCruisesComponent } from './components/ways-to-explore/river-cruises/river-cruises.component';
import { WalkTheTrailsComponent } from './components/ways-to-explore/walk-the-trails/walk-the-trails.component';
import { CelebrateMomentsComponent } from './components/ways-to-explore/celebrate-moments/celebrate-moments.component';
import { GetMovingComponent } from './components/ways-to-explore/get-moving/get-moving.component';

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

    {path: 'sailing-tours', component:SailingToursComponent},
    {path: 'overland-journeys', component:OverlandJourneysComponent},

    {path: 'wellness-retreats', component:WellnessRetreatsComponent},

    {path: 'explorer-trips', component:ExplorerTripsComponent},
    {path: 'wildlife-safaris', component:WildlifeSafarisComponent},
    {path: 'feel-the-culture', component:FeelTheCultureComponent},
    {path: 'taste-the-world', component:TasteTheWorldComponent},
    {path: 'cyclic-adventures', component:CyclicAdventuresComponent},
    {path: 'river-cruises', component:RiverCruisesComponent},
    {path: 'walk-the-trails', component:WalkTheTrailsComponent},
    {path: 'celebrate-moments', component:CelebrateMomentsComponent},
    {path: 'get-moving', component:GetMovingComponent},



  { path: ':country', component: CountryComponentComponent, runGuardsAndResolvers: 'always' },
  { path: '**', redirectTo: '' }
];
