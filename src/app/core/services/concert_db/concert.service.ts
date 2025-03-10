import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Concert } from '../../models/concert';

@Injectable({
  providedIn: 'root'
})
export class ConcertService {
  private apiUrl = environment.apiUrl + '/concerts.php';

  constructor(private http: HttpClient) { }

  getConcerts(): Observable<Concert[]> {
    return this.http.get<Concert[]>(this.apiUrl);
  }

  getConcertsPaginated(limit: number, offset: number): Observable<Concert[]> {
    return this.http.get<Concert[]>(`${this.apiUrl}?limit=${limit}&offset=${offset}`);
  }

  getNextConcert(): Observable<Concert> {
    return this.http.get<Concert>(`${this.apiUrl}?next=1`);
  }

  addConcert(concert: Concert): Observable<any> {
    return this.http.post(this.apiUrl, concert);
  }

  updateConcert(concert: Concert): Observable<any> {
    return this.http.put(this.apiUrl, concert);
  }

  deleteConcert(concert_id: number): Observable<any> {
    return this.http.request('delete', this.apiUrl, { body: { concert_id } });
  }
}
