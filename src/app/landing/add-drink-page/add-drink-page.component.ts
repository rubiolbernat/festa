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
import { DrinkSelectionComponent } from './components/drink-selection/drink-selection.component';
import { LocationSelectionComponent } from './components/location-selection/location-selection.component';
import { MediaInputComponent } from './components/media-input/media-input.component';
import { QuantityPriceComponent } from './components/quantity-price/quantity-price.component';
import { GpsInputComponent } from './components/gps-input/gps-input.component';

@Component({
  selector: 'app-add-drink-page',
  imports: [FormsModule, CommonModule, DateSelectionComponent, DrinkSelectionComponent, LocationSelectionComponent, MediaInputComponent, QuantityPriceComponent, GpsInputComponent],
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

  onDateSelected(info: DateSelectionOutput) {
    this.drinkEntry.update(value => ({
      ...value,
      date: info.selectedDate || new Date(),
      day_of_week: info.dayOfWeek ? info.dayOfWeek : 0,
      event_id: info.eventId ? info.eventId : null
    }));
  }

  onLocationSelected(location: string) {
    this.drinkEntry.update(value => ({
      ...value,
      location: location
    }));
  }


  //Enviar formulari
  onSubmit() {
    this.AlertService.showAlert('Drink entry submitted successfully!', 'success');
    this.resetForm(); // Reiniciar el formulari després d'enviar
  }
  resetForm() {
  }
}
