import { Component } from '@angular/core';
import { AlertService } from '../../../core/services/alert/alert.service';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
  imports: [NgIf, AsyncPipe],
  standalone: true
})
export class AlertComponent {
  alert$;
  isHiding = false;
  private timeoutId?: any;

  constructor(private alertService: AlertService) {
    this.alert$ = this.alertService.alert$;

    this.alert$.subscribe(alert => {
      if (alert) {
        this.isHiding = false; // Mostra l'alerta
        const duration = alert.duration ?? 5000; // Usa el valor passat o 5s per defecte
        this.setAutoClose(duration);
      }
    });
  }

  setAutoClose(duration: number) {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.closeAlert();
    }, duration);
  }

  closeAlert() {
    this.isHiding = true;
    this.alertService.clearAlert();
    this.isHiding = false;
  }

  ngOnDestroy() {
    clearTimeout(this.timeoutId);
  }
}
