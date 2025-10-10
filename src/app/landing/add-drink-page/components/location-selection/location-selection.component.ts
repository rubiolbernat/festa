// Imports necessaris (assegura't que ChangeDetectorRef està importat)
import { Component, signal, inject, output, OnInit, OnDestroy, ViewChild, ElementRef, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DrinkingDataService } from '../../../../core/services/drinking-data/drinking-data.service';
import * as L from 'leaflet';
import { Modal } from 'bootstrap';

// Interfície (sense canvis)
export interface LocationSelectionOutput {
  selectedLocation: string;
  latitude: number;
  longitude: number;
}

declare module 'leaflet' {
  interface MapOptions {
    fullscreenControl?: boolean;
    fullscreenControlOptions?: any;
  }
}

@Component({
  selector: 'app-location-selection',
  standalone: true,
  imports: [
    CommonModule, FormsModule,  DecimalPipe
  ],
  templateUrl: './location-selection.component.html',
  styleUrls: [
    './location-selection.component.css'
  ],
})
export class LocationSelectionComponent implements OnInit, OnDestroy {

  // --- Injeccions ---
  private drinkingDataService = inject(DrinkingDataService);
  private elRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef); // <--- Injecta ChangeDetectorRef

  // --- Output ---
  public location = output<LocationSelectionOutput>();

  // --- Signals i Propietats ---
  locationSuggestions = signal<string[]>([]);
  lastLocations = signal<string[]>([]);
  selectedLocation = signal<string>('');
  hasGpsData = signal<boolean | null>(null);
  latitude = signal<number>(0);
  longitude = signal<number>(0);
  zoom = signal<number>(13);
  mapInstance: L.Map | null = null;
  mapMarker: L.Marker | null = null;
  mapModalElement: Modal | null = null;
  mapLat: number = this.latitude();
  mapLng: number = this.longitude();

  @ViewChild('mapModal') mapModalRef!: ElementRef<HTMLDivElement>;
  private mapContainer: HTMLElement | null = null;

  // Listener per a 'shown.bs.modal' (sense canvis interns)
  private modalShownListener = () => {
    //console.log('[shown.bs.modal] Event triggered. Iniciant inicialització/actualització del mapa.');
    if (!this.mapContainer) {
      this.mapContainer = this.elRef.nativeElement.querySelector('#mapInModal');
      console.log('[shown.bs.modal] Contenidor del mapa trobat:', this.mapContainer);
    }
    if (this.mapContainer) {
      console.log(`[shown.bs.modal] Dimensions del contenidor ABANS d'inicialitzar: W=${this.mapContainer.offsetWidth}, H=${this.mapContainer.offsetHeight}`);
      this.initializeOrUpdateMap();
      setTimeout(() => this.triggerMapResize(), 50);
      setTimeout(() => this.triggerMapResize(), 250);
      setTimeout(() => this.triggerMapResize(), 500);
    } else {
      console.error('[shown.bs.modal] ERROR: Contenidor del mapa #mapInModal NO TROBAT dins del listener!');
    }
  };

  constructor() { // (Sense canvis)
    console.log('LocationSelectionComponent Constructor: Iniciant...');
    afterNextRender(() => {
      console.log('LocationSelectionComponent afterNextRender: Iniciant inicialització del modal.');
      if (this.mapModalRef?.nativeElement) {
        const modalNativeElement = this.mapModalRef.nativeElement;
        this.mapModalElement = new Modal(modalNativeElement);
        modalNativeElement.addEventListener('shown.bs.modal', this.modalShownListener);
        console.log('LocationSelectionComponent afterNextRender: Modal de Bootstrap i listener "shown" inicialitzats.');
      } else {
        console.error("LocationSelectionComponent afterNextRender: Referència al modal #mapModal NO TROBADA!");
      }
      this.getCurrentLocation();
    });
  }

  ngOnInit() { // (Sense canvis)
    console.log('LocationSelectionComponent ngOnInit: Carregant ubicacions anteriors.');
    this.loadLastLocations();
  }

  ngOnDestroy(): void { // (Sense canvis)
    console.log('LocationSelectionComponent ngOnDestroy: Iniciant neteja...');
    if (this.mapInstance) { this.mapInstance.remove(); this.mapInstance = null; console.log('ngOnDestroy: Instància del mapa Leaflet eliminada.'); }
    if (this.mapModalRef?.nativeElement) { this.mapModalRef.nativeElement.removeEventListener('shown.bs.modal', this.modalShownListener); console.log('ngOnDestroy: Listener "shown.bs.modal" eliminat.'); }
    this.mapModalElement?.dispose(); console.log('ngOnDestroy: Instància del modal de Bootstrap eliminada.');
  }

  loadLastLocations() { // (Sense canvis)
    this.drinkingDataService.getLastLocations().subscribe({
      next: locations => {
        this.lastLocations.set(locations);
        //console.log('Ubicacions anteriors carregades:', locations);
      },
      error: error => { console.error('Error al carregar ubicacions anteriors:', error); this.lastLocations.set([]); }
    });
  }

  filterLocations() { // (Sense canvis)
    const term = this.selectedLocation()?.trim().toLowerCase() ?? '';
    if (term) { this.locationSuggestions.set(this.lastLocations().filter(loc => loc.toLowerCase().includes(term)).slice(0, 5)); }
    else { this.locationSuggestions.set([]); }
    this.sendData();
  }

  selectSuggestion(suggestion: string) { // (Sense canvis)
    this.selectedLocation.set(suggestion);
    this.locationSuggestions.set([]);
    this.sendData();
  }

  getCurrentLocation() { // (Sense canvis)
    console.log('getCurrentLocation: Intentant obtenir ubicació GPS...');
    this.hasGpsData.set(null);
    if (!navigator.geolocation) { /* ... */ return; }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('getCurrentLocation: Ubicació GPS obtinguda OK:', position.coords);
        this.latitude.set(position.coords.latitude); this.longitude.set(position.coords.longitude);
        this.hasGpsData.set(true);
        this.mapLat = this.latitude(); this.mapLng = this.longitude();
        if (this.mapInstance) { console.log('getCurrentLocation: Mapa obert, actualitzant vista amb coordenades GPS.'); this.updateMapAndView(this.mapLat, this.mapLng); }
        this.sendDataIfValid();
      },
      (error) => { /* ... */ },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  openMapModal() { // (Sense canvis)
    console.log('openMapModal: Obrint modal...');
    this.mapLat = this.latitude(); this.mapLng = this.longitude();
    console.log(`openMapModal: Coordenades per al mapa ajustades a [${this.mapLat}, ${this.mapLng}]. Mostrant modal...`);
    this.mapModalElement?.show();
  }

  closeMapModal() { // (Sense canvis)
    console.log('closeMapModal: Tancant modal.');
    this.mapModalElement?.hide();
  }

  initializeOrUpdateMap() {
    if (!this.mapContainer) {
      this.mapContainer = this.elRef.nativeElement.querySelector('#mapInModal');
      if (!this.mapContainer) {
        console.error("initializeOrUpdateMap: ERROR CRÍTIC: Contenidor null!");
        return;
      }
    }
    console.log(`initializeOrUpdateMap: Dimensions del contenidor: W=${this.mapContainer.offsetWidth}, H=${this.mapContainer.offsetHeight}`);

    // Si NO hi ha instància de mapa i L existeix
    if (!this.mapInstance && L) {
      console.log(`initializeOrUpdateMap: Creant mapa nou a [${this.mapLat}, ${this.mapLng}]...`);
      try {
        // *** CORRECCIÓ AQUÍ: Afegides les opcions 'center', 'zoom' i 'layers' ***
        this.mapInstance = L.map(this.mapContainer, {
          center: [this.mapLat, this.mapLng], // Centre inicial
          zoom: this.zoom(),                 // Zoom inicial
          layers: [                           // Capa de tiles (mapa base)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            })
          ]
          // Pots afegir altres opcions aquí si cal (zoomControl: false, etc.)
        });
        // *** FI CORRECCIÓ ***

        console.log("initializeOrUpdateMap: Instància de mapa CREADA:", this.mapInstance);

        this.mapMarker = L.marker([this.mapLat, this.mapLng], { draggable: true }).addTo(this.mapInstance);
        console.log("initializeOrUpdateMap: Marcador afegit.");

        // --- Listener CLICK modificat ---
        this.mapInstance.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          console.log(`--- MAPA CLICAT --- a: [${lat}, ${lng}]`);
          this.mapLat = lat;
          this.mapLng = lng;
          this.mapMarker?.setLatLng([lat, lng]);
          console.log('Forçant detecció de canvis després del clic...');
          this.cdr.detectChanges();
        });
        console.log("initializeOrUpdateMap: Listener 'click' afegit al mapa.");

        // --- Listener DRAGEND modificat ---
        this.mapMarker.on('dragend', () => {
          if (this.mapMarker) {
            const pos = this.mapMarker.getLatLng();
            console.log(`--- MARCADOR ARROSSEGAT --- a: [${pos.lat}, ${pos.lng}]`);
            this.mapLat = pos.lat;
            this.mapLng = pos.lng;
            console.log('Forçant detecció de canvis després d\'arrossegar...');
            this.cdr.detectChanges();
          }
        });
        console.log("initializeOrUpdateMap: Listener 'dragend' afegit al marcador.");

        // Cridem invalidateSize just després de crear
        this.triggerMapResize();

      } catch (error) {
        console.error("initializeOrUpdateMap: ERROR durant la inicialització:", error);
      }
    }
    // Si JA hi ha instància de mapa
    else if (this.mapInstance) {
      console.log(`initializeOrUpdateMap: Actualitzant vista a [${this.mapLat}, ${this.mapLng}].`);
      this.updateMapAndView(this.mapLat, this.mapLng);
    }
    // Si L no està disponible o hi ha un altre problema
    else {
      console.error("initializeOrUpdateMap: No s'ha pogut crear/actualitzar mapa (L no disponible o instància no creada).");
    }
    console.log("initializeOrUpdateMap: Finalitzada.");
  }
  updateMapAndView(lat: number, lng: number) { // (Sense canvis interns)
    if (this.mapInstance) {
      console.log(`updateMapAndView: Centrant mapa a [${lat}, ${lng}], zoom ${this.zoom()}`);
      this.mapInstance.setView([lat, lng], this.zoom());
      this.mapMarker?.setLatLng([lat, lng]);
      console.log(`updateMapAndView: Vista i marcador actualitzats.`);
      this.triggerMapResize();
    } else { console.warn("updateMapAndView: Intent d'actualitzar vista sense instància."); }
  }

  triggerMapResize() { // (Sense canvis interns, però la comprovació d'alçada és útil)
    if (this.mapInstance) {
      console.log(`triggerMapResize: Cridant invalidateSize()...`);
      if (this.mapContainer && this.mapContainer.offsetHeight > 0) {
        this.mapInstance.invalidateSize({ animate: false });
        console.log(`triggerMapResize: invalidateSize() cridat (Contenidor H=${this.mapContainer.offsetHeight}).`);
      } else { console.warn(`triggerMapResize: No s'ha cridat invalidateSize() per falta d'alçada (H=${this.mapContainer?.offsetHeight}).`); }
    } else { console.log("triggerMapResize: No hi ha instància."); }
  }

  confirmMapSelection() { // (Sense canvis)
    console.log(`confirmMapSelection: Confirmant selecció [${this.mapLat}, ${this.mapLng}]`);
    this.latitude.set(this.mapLat); this.longitude.set(this.mapLng);
    this.hasGpsData.set(true);
    if (!this.selectedLocation()?.trim()) { this.selectedLocation.set('Ubicació del mapa'); }
    this.closeMapModal(); this.sendData();
  }

  sendDataIfValid() { // (Sense canvis)
    if (this.selectedLocation()?.trim()) { this.sendData(); }
    else { console.log("sendDataIfValid: Nom del lloc buit, no s'envien dades."); }
  }

  sendData() { // (Sense canvis)
    const locationName = this.selectedLocation()?.trim() ?? '';
    const formattedLocation = locationName ? locationName.charAt(0).toUpperCase() + locationName.slice(1) : '';
    const outputData: LocationSelectionOutput = { selectedLocation: formattedLocation, latitude: this.latitude(), longitude: this.longitude() };
    if (outputData.latitude === 0 && outputData.longitude === 0 && this.hasGpsData() !== false) { console.warn("sendData: S'estan emetent coordenades (0,0)..."); }
    // console.log('sendData: Emetent dades (location.emit):', outputData);
    this.location.emit(outputData);
  }
}
