import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {environment} from '../environments/environment';
import { GoogleLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes),
    importProvidersFrom([BrowserAnimationsModule]),
    provideSocialAuthServiceConfig(),
  ]
};

export function provideSocialAuthServiceConfig(): {provide: string, useValue: SocialAuthServiceConfig} {
  return {
    provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: true,
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider(environment.googleLoginProviderId, {
            oneTapEnabled: false, // Recommended for newer implementation
            scopes: 'email profile'
          })
        }
      ]
    } as SocialAuthServiceConfig
  };
}
