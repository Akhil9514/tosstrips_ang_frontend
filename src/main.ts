/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { register as registerSwiper } from 'swiper/element/bundle';


export const environment = {
  production: false,

  mode: 'Dev'
} 

if (environment.production) {
  window.console.log = () => {};
  window.console.warn = () => {};
  window.console.error = () => {};
  window.onerror = () => true;
}



// Register Swiper web components globally
registerSwiper();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
