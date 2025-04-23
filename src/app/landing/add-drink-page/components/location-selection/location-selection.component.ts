import { CommonModule } from '@angular/common';
import { Component, signal, inject, output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DrinkingDataService } from '../../../../core/services/drinking-data/drinking-data.service';

@Component({
  selector: 'app-location-selection',
  imports: [CommonModule,
    FormsModule],
  templateUrl: './location-selection.component.html',
  styleUrl: './location-selection.component.css'
})
export class LocationSelectionComponent implements OnInit {

  private drinkingDataService = inject(DrinkingDataService);

  public location = output<string>();

  locationSuggestions = signal<string[]>([]);
  lastLocations = signal<string[]>([]);
  selectedLocation = signal<string>('');

  ngOnInit() {
    this.loadData();
  }

  filterLocations() {
    if (this.selectedLocation() && this.selectedLocation().trim() !== '') {
      const searchTerm = this.selectedLocation().toLowerCase();
      this.locationSuggestions.set(this.lastLocations().filter(location =>
        location.toLowerCase().includes(searchTerm)
      ).slice(0, 5)); // Limita a 5 suggeriments
    } else {
      this.locationSuggestions.set([]); // Si no hi ha text, no mostrar suggeriments
    }
    this.sendData(); // Emit el valor actualitzat de la ubicació seleccionada
  }

  loadData() {
    this.drinkingDataService.getLastLocations().subscribe(
      locations => {
        this.lastLocations.set(locations);
        console.log('Ubicacions obtingudes:', locations);
      },
      error => {
        console.error('Error al carregar ubicacions anteriors:', error);
      }
    );
  }

  sendData() {
    this.location.emit(this.selectedLocation());
  }
}
