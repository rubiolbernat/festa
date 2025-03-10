import { Component } from '@angular/core';
import { AlertService } from '../../core/services/alert/alert.service';

@Component({
  selector: 'app-contact-page',
  imports: [],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.css'
})
export class ContactPageComponent {
  constructor(private alertService: AlertService) {
    this.alertService.showAlert('Abans de redactar el mail recorda: "Sóc Catalana!"', 'fades', 3000);
  }

}
