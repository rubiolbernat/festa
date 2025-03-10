import { Component, OnInit, AfterViewInit } from '@angular/core';
import { settings_db } from '../../../../core/models/settings_db';
import { SettingsDbService } from '../../../../core/services/settings_db/settings-db.service';
import { NgIf, NgFor } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

declare var bootstrap: any; // Declara la variable bootstrap

@Component({
  selector: 'app-carroussel',
  imports: [NgIf, NgFor],
  templateUrl: './carroussel.component.html',
  styleUrl: './carroussel.component.css'
})
export class CarrousselComponent implements OnInit, AfterViewInit {
  Carroussel: any[] = []; // He de cambiar settings_db[] por any[]

  constructor(private settingsDbService: SettingsDbService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.loadCarroussel();
  }

  ngAfterViewInit(): void {
    // Inicialitza el carroussel de Bootstrap després que la vista s'hagi inicialitzat
    const carouselElement = document.querySelector('#carouselExampleCaptions');
    if (carouselElement) {
      new bootstrap.Carousel(carouselElement, {
        interval: 2000, // Cambia la imatge cada 2s
        touch: true, // Enable touch swiping
        //pause: 'hover' // Pause on mouse hover
      });
    }
  }

  loadCarroussel(): void {
    this.settingsDbService.getHomePageCarroussel().subscribe({
      next: settings => {
        this.Carroussel = settings.map(setting => ({
          ...setting,
          description: this.sanitizer.bypassSecurityTrustHtml(setting?.description ?? '')
        }));
      },
      error: () => this.Carroussel = []
    });
  }
}
