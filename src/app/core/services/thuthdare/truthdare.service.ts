import { TruthDareModel } from './../../models/TruthDareModel.model';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TruthdareService {
  private apiUrl = environment.apiUrl + '/TruthDare_api.php';

  constructor(private http: HttpClient) { }

  // GET Requests

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}?action=getCategories`);
  }

  getTruth(categories: string[], dificultat: number): Observable<TruthDareModel[]> {
    let params = new HttpParams()
      .set('action', 'getTruth')
      .set('categories', categories.join(','))
      .set('dificultat', dificultat.toString());

    return this.http.get<TruthDareModel[]>(this.apiUrl, { params: params });
  }

  getDare(categories: string[], dificultat: number): Observable<TruthDareModel[]> {
    let params = new HttpParams()
      .set('action', 'getDare')
      .set('categories', categories.join(','))
      .set('dificultat', dificultat.toString());

    return this.http.get<TruthDareModel[]>(this.apiUrl, { params: params });
  }

  // POST Requests

  addQuestion(text: string, category: string, tipus: number, dificultat: number): Observable<any> {
    const data = { text: text, category: category, tipus: tipus, dificultat: dificultat };
    return this.http.post(`${this.apiUrl}?action=addQuestion`, data);
  }

  // DELETE Requests
}
