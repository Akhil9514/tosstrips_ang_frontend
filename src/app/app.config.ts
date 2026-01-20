// import { ApplicationConfig } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { routes } from './app.routes';
// import { provideClientHydration } from '@angular/platform-browser';
// import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// import { loadingInterceptor } from './interceptor/loading.interceptor';
// import { provideHttpClient, withInterceptors } from '@angular/common/http';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     // provideRouter(routes),
//         provideRouter(routes, {
//       onSameUrlNavigation: 'reload'
//     }),
//     provideClientHydration(),
//     provideAnimationsAsync(),
//     provideHttpClient(withInterceptors([loadingInterceptor])),
//   ]
// };









import { ApplicationConfig } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { loadingInterceptor } from './interceptor/loading.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      })
    ),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([loadingInterceptor])),
  ]
};
