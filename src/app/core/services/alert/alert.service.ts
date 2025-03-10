import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface Alert {
  type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'fades'; // Tipus d'alerta
  message: string;
  duration?: number; // Afegim la duració opcional
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new BehaviorSubject<Alert | null>(null);
  alert$ = this.alertSubject.asObservable();

  showAlert(message: string, type: 'primary' | 'secondary' | 'success' | 'danger' | 'fades'| 'warning' | 'info' = 'info', duration?: number) {
    this.alertSubject.next({ message, type, duration });
  }

  clearAlert() {
    this.alertSubject.next(null);
  }
}
