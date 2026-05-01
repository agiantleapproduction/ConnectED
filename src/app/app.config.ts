import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { NgHcaptchaModule } from 'ng-hcaptcha';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    importProvidersFrom(
      NgHcaptchaModule.forRoot({
        siteKey: '26628c02-a9c6-4f3a-8578-60489da6e22e'
      })
    )
  ]
};
