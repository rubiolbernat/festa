import { environment } from './../../../environments/environment';
import { AlertService } from './../../core/services/alert/alert.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DrinkData } from '../../core/models/v2_drink-data.model';
import { inject, signal } from '@angular/core';
import { Router } from '@angular/router';


// Form Children
import { DateSelectionComponent, DateSelectionOutput } from './components/date-selection/date-selection.component';
import { LocationSelectionComponent, LocationSelectionOutput } from './components/location-selection/location-selection.component';
import { MediaInputComponent } from './components/media-input/media-input.component';
import { DrinkQuantityPriceComponent, QuantityPriceDrinkOutput } from './components/quantity-price/quantity-price.component';
import { CommentariesComponent } from './components/commentaries/commentaries.component';

@Component({
  selector: 'app-add-drink-page',
  imports: [FormsModule, CommonModule, DateSelectionComponent, LocationSelectionComponent, MediaInputComponent, DrinkQuantityPriceComponent, CommentariesComponent],
  templateUrl: './add-drink-page.component.html',
  styleUrl: './add-drink-page.component.css'
})
export class AddDrinkPageComponent {

  private AlertService = inject(AlertService);

  drinkEntry = signal<DrinkData>({
    //id = 0;
    //timestamp?: Date;
    user_id: 0,
    date: new Date(),
    day_of_week: 0,
    location: '',
    latitude: 0, // Opcional
    longitude: 0, // Opcional
    drink: '',
    quantity: 0,
    others: '', // Opcional
    price: 0,
    num_drinks: 0,
    event_id: null, //Opcional
    storie: {
      user_id: 0, // ID de l'usuari que ha pujat la story
      drink_id: 0, // ID de la beguda associada a la story
      imageUrl: '',  // URL de la imatge de la story
      uploadedAt: new Date().toISOString(),
      expiresAt: new Date(new Date().getTime() + 60 * 60 * 1000 * environment.storyExpirationHours).toISOString(), // Expira en 15 dies
      votes: 0,
      isSaved: false
    }
  });

  selectedProcessedFile: File | null = null;
  parentPreviewUrl: string | null = null;

  onDateSelected(info: DateSelectionOutput) {
    this.drinkEntry.update(value => ({
      ...value,
      date: info.selectedDate || new Date(),
      day_of_week: info.dayOfWeek ? info.dayOfWeek : 0,
      event_id: info.eventId ? info.eventId : null
    }));
  }

  onLocationSelected(location: LocationSelectionOutput) {
    this.drinkEntry.update(value => ({
      ...value,
      location: location.selectedLocation || '',
      latitude: location.latitude || 0,
      longitude: location.longitude || 0
    }));
  }

  onCommentariesChange(comentari: string) {
    this.drinkEntry.update(value => ({
      ...value,
      others: comentari || ''
    }));
  }

  onQuantityPriceDrinkSelected(info: QuantityPriceDrinkOutput) {
    this.drinkEntry.update(value => ({
      ...value,
      quantity: info.quantity,
      price: info.price,
      num_drinks: info.units,
      drink: info.name
    }));
  }

  handleMediaOutput(file: File | null): void {
    console.log('Parent received:', file);

    // --- Gestió de la URL d'Objecte ---
    // 1. Si ja teníem una URL de preview, l'hem de revocar per alliberar memòria
    if (this.parentPreviewUrl) {
      URL.revokeObjectURL(this.parentPreviewUrl);
      console.log('Revoked previous object URL:', this.parentPreviewUrl);
      this.parentPreviewUrl = null; // Neteja la URL antiga
    }

    // 2. Assigna el nou fitxer rebut
    this.selectedProcessedFile = file;

    // 3. Si hem rebut un fitxer vàlid, crea una nova URL d'objecte per la preview
    if (this.selectedProcessedFile) {
      // URL.createObjectURL crea una URL temporal que apunta a les dades del File en memòria
      this.parentPreviewUrl = URL.createObjectURL(this.selectedProcessedFile);
      console.log('Created new object URL:', this.parentPreviewUrl);
    } else {
      // Si hem rebut null, ens assegurem que la preview també és null
      this.parentPreviewUrl = null;
    }
  }


  //Enviar formulari
  onSubmit() {
    this.AlertService.showAlert('Drink entry submitted successfully!', 'success');
    this.resetForm(); // Reiniciar el formulari després d'enviar
  }
  resetForm() {
  }
}
