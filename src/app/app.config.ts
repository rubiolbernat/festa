import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core'; // Importa LOCALE_ID
import { provideRouter } from '@angular/router';

// 1. Importa les funcions i dades de locale necessàries
import { registerLocaleData } from '@angular/common';
import localeCa from '@angular/common/locales/ca'; // Importa només el locale català

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/jwt/auth.interceptor';

// 2. Registra el locale català amb l'identificador 'ca'
registerLocaleData(localeCa, 'ca');

// 3. Configura l'aplicació
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(), // O amb interceptors: provideHttpClient(withInterceptors([authInterceptor]))

    // 4. Estableix 'ca' com a locale per defecte i únic per a l'aplicació
    { provide: LOCALE_ID, useValue: 'ca' }
  ]
};
