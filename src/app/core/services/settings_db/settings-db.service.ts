import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { settings_db } from '../../models/settings_db';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SettingsDbService {
  private apiUrl = environment.apiUrl + '/settings.php';
  private assetsUrl = environment.assetsUrl;

  constructor(private http: HttpClient) { }

  getHomePageCarroussel(): Observable<settings_db[]> {
    return this.http.get<settings_db[]>(this.apiUrl + '?home_page_carroussel=1')
      .pipe(
        map((settings: settings_db[]) => {
          // Per a cada element de l'array, concatena la URL base amb el camp de la imatge
          return settings.map(setting => {
            return {
              ...setting, // Copia totes les propietats de l'objecte original
              value: this.assetsUrl + setting.value // Assigna el nou valor a la propietat 'value'
            };
          });
        })
      );
  }
}
