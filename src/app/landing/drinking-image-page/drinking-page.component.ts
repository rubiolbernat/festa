import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DrinkingDataService } from '../../core/services/drinking-data/drinking-data.service';
import { Subscription } from 'rxjs';
import { DrinkData } from '../../core/models/drink-data.model'; // Assegura't que aquesta interfície té event_id? : number | null;
import { AlertService } from '../../core/services/alert/alert.service';
import { RouterModule } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { DrinkEventsService } from '../../core/services/drink-events.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { DrinkEvent } from '../../core/models/v2_drink-events.model';
import { EventIconPipe } from '../../core/pipes/event-icon.pipe';

@Component({
  selector: 'app-drinking-page',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, EventIconPipe],
  templateUrl: './drinking-page.component.html',
  styleUrls: ['./drinking-page.component.css']
})
export class DrinkingPageComponent implements OnInit, OnDestroy {

  eventsService = inject(DrinkEventsService);
  private authService = inject(AuthService);
  private drinkingDataService = inject(DrinkingDataService);
  private alertService = inject(AlertService);

  drinkData: DrinkData = {
    user_id: 0, // S'actualitzarà a ngOnInit si hi ha usuari autenticat
    date: '',
    day_of_week: 0,
    location: '',
    latitude: 0, // Inicialitza a null o 0 segons prefereixis
    longitude: 0,
    drink: '',
    quantity: 0.33,
    num_drinks: 1,
    others: '',
    price: 0,
    event_id: null // Correcte
  };

  drinks = [
    { name: 'Selecciona', quantity: 0, descr: 'Selecciona una opció' },
    { name: 'Manual', quantity: 0.33, descr: 'Introdueix manualment la quantitat' },
    { name: 'Cervesa', quantity: 0.33, descr: '33 cl' },
    { name: 'Cubata', quantity: 0.33, descr: '33 cl' },
    { name: 'Cubata Tub', quantity: 0.25, descr: '250 ml' },
    { name: 'Tubo', quantity: 0.40, descr: '40 cl' },
    { name: 'Quinto', quantity: 0.20, descr: '20 cl' },
    { name: 'Xupito', quantity: 0.04, descr: '4 cl' },
    { name: 'Canya', quantity: 0.25, descr: '25 cl' },
    { name: 'Gerra', quantity: 1, descr: '1 l' },
    { name: 'Sangria', quantity: 1.5, descr: '1.5 l' },
    { name: 'Vi', quantity: 0.15, descr: '15 cl (una copa)' }
  ];

  selectedDrink = this.drinks.find(d => d.name === 'Cervesa') || this.drinks[0];
  selectedEventId: number | null = null; // Per al [(ngModel)] del select
  priceindividual: boolean = true;
  manualQuantity: boolean = false;
  manualQuantityValue: number = 0.33;
  totalPrice: number = 0;

  lastLocations: string[] = [];
  lastDrinks: string[] = [];
  locationSuggestions: string[] = [];
  drinkSuggestions: string[] = [];
  private subscription: Subscription = new Subscription();
  hasGpsData: boolean = false;
  enrolledEvents: DrinkEvent[] = [];

  imageUrl: string | ArrayBuffer | null = null;
  imageFile: File | null = null;
  uploadProgress: number | undefined;
  uploadSub: Subscription | undefined;

  // Injectem els serveis directament al constructor (és una pràctica comuna també)
  // constructor() {} // No cal constructor si fem servir inject() fora

  ngOnInit(): void {
    // Assigna l'ID de l'usuari si està autenticat
    this.drinkData.user_id = this.authService.getUser()?.id ?? 0;

    this.drinkData.date = this.formatDate(new Date());
    // No cal cridar onDateChange aquí directament, loadData ho farà
    this.getCurrentLocation();
    this.loadData(); // Carrega dades (incloent events) i cridarà onDateChange quan acabin els events

    // Configuració inicial de beguda
    this.selectInitialDrink();
    this.updateTotalPrice(); // Calcula preu inicial
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.uploadSub?.unsubscribe();
  }

  // Lògica per canvi de data i selecció d'esdeveniment
  onDateChange(): void {
    // Mantenim el log inicial
    console.log(`%c--- onDateChange START --- (Date String: ${this.drinkData.date})`, 'color: blue; font-weight: bold;');

    // Validació bàsica de la string de data (hauria de ser YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (this.drinkData.date && dateRegex.test(this.drinkData.date)) {

      // Calcula el dia de la setmana (per això sí necessitem parsejar)
      try {
        const tempDateForDayOfWeek = new Date(this.drinkData.date + 'T00:00:00Z'); // Parseja per calcular dia
        if (!isNaN(tempDateForDayOfWeek.getTime())) {
          this.drinkData.day_of_week = this.getDayOfWeek(tempDateForDayOfWeek);
          console.log(`Day of week calculated: ${this.drinkData.day_of_week}`);
        } else {
          console.warn(`Could not parse date "${this.drinkData.date}" for day of week calculation.`);
          this.drinkData.day_of_week = 0; // Valor per defecte
        }
      } catch (e) {
        console.error("Error parsing date for day of week:", e);
        this.drinkData.day_of_week = 0;
      }


      // Comprova els esdeveniments
      console.log(`Checking enrolledEvents (Length: ${this.enrolledEvents?.length || 0}):`, JSON.stringify(this.enrolledEvents));
      if (this.enrolledEvents && this.enrolledEvents.length > 0) {
        console.log('%cCalling findAndSetEventForDate with STRING...', 'color: green;');
        // *** PASSEM LA STRING DIRECTAMENT ***
        this.findAndSetEventForDate(this.drinkData.date);
      } else {
        console.warn('No enrolledEvents found or list is empty. Setting event to null.');
        this.selectedEventId = null;
        this.updateDrinkDataEventId();
      }
    } else if (this.drinkData.date) {
      // La data té valor però no el format esperat
      console.error(`Invalid date format provided: "${this.drinkData.date}". Expected YYYY-MM-DD.`);
      this.drinkData.day_of_week = 0;
      this.selectedEventId = null;
      this.updateDrinkDataEventId();
    }
    else {
      // La data és buida o null
      console.log('Date input is empty. Resetting day_of_week and event.');
      this.drinkData.day_of_week = 0;
      this.selectedEventId = null;
      this.updateDrinkDataEventId();
    }
    console.log(`%c--- onDateChange END --- (Selected Event ID: ${this.selectedEventId})`, 'color: blue; font-weight: bold;');
  }
  // Busca i selecciona l'esdeveniment corresponent a la data
  // *** ARA ACCEPTA LA DATA SELECCIONADA COM A STRING ***
  findAndSetEventForDate(selectedDateString: string): void {
    console.log(`%c--- findAndSetEventForDate START --- (Selected Date STRING: ${selectedDateString})`, 'color: purple; font-weight: bold;');
    let foundEventId: number | null = null;

    // Validació extra de la data seleccionada rebuda
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(selectedDateString)) {
      console.error(`   Invalid selectedDateString received: ${selectedDateString}. Aborting search.`);
      this.selectedEventId = null; // Assegura que no quedi res seleccionat
      this.updateDrinkDataEventId();
      console.log(`%c--- findAndSetEventForDate END --- (INVALID INPUT)`, 'color: red; font-weight: bold;');
      return;
    }


    for (const event of this.enrolledEvents) {
      console.log(`-- Processing Event ID: ${event?.event_id}, Nom: ${event?.nom}, Start: ${event?.data_inici}, End: ${event?.data_fi}`);

      // Validacions de l'event
      if (!event || !event.data_inici || !event.data_fi || event.event_id === undefined || event.event_id === null) {
        console.warn(`   Skipping invalid event object or missing dates/id.`);
        continue;
      }

      // Extreu les parts YYYY-MM-DD de l'event
      const startDateString = event.data_inici.substring(0, 10);
      const endDateString = event.data_fi.substring(0, 10);

      // Validació del format de les dates de l'event
      if (!dateRegex.test(startDateString) || !dateRegex.test(endDateString)) {
        console.warn(`   Skipping event ID ${event.event_id} due to unexpected date format in event data: Start='${startDateString}', End='${endDateString}'`);
        continue;
      }

      try {
        // <<< --- COMPARACIÓ DIRECTA DE STRINGS --- >>>
        const isMatch = selectedDateString >= startDateString && selectedDateString <= endDateString;
        console.log(`   String Comparison: "${selectedDateString}" >= "${startDateString}" && "${selectedDateString}" <= "${endDateString}"  --> MATCH: ${isMatch}`);
        // <<< --- FI DE LA COMPARACIÓ --- >>>

        if (isMatch) {
          foundEventId = event.event_id;
          console.log(`   +++ MATCH FOUND! Event ID: ${foundEventId} +++`);
          break; // Hem trobat el primer, sortim
        }
      } catch (e) {
        // Catch per errors inesperats durant substring o comparació (poc probable)
        console.error(`   Error comparing strings for event ID ${event.event_id}:`, e);
      }
    } // Fi del bucle for

    console.log(`-- Loop finished. Final foundEventId to be set: ${foundEventId}`);
    this.selectedEventId = foundEventId;
    this.updateDrinkDataEventId(); // Sincronitza amb drinkData

    console.log(`%c--- findAndSetEventForDate END --- (this.selectedEventId is now: ${this.selectedEventId})`, 'color: purple; font-weight: bold;');
  }
  // Actualitza la propietat event_id a l'objecte principal de dades
  updateDrinkDataEventId(): void {
    this.drinkData.event_id = this.selectedEventId;
    console.log('drinkData.event_id updated to:', this.drinkData.event_id);
  }

  // Carrega dades inicials (localitzacions, begudes, esdeveniments)
  loadData() {
    this.subscription = this.drinkingDataService.getLastLocations().subscribe(
      locations => {
        this.lastLocations = locations;
        console.log('Ubicacions obtingudes:', locations);
      },
      error => {
        console.error('Error al carregar ubicacions anteriors:', error);
      }
    );

    this.subscription.add(this.drinkingDataService.getLastDrinks().subscribe(
      drinks => {
        this.lastDrinks = drinks;
        console.log('Begudes obtingudes:', drinks);
      },
      error => {
        console.error('Error al carregar begudes anteriors:', error);
      }
    ));
    const userId = this.authService.getUser()?.id;
    if (userId !== undefined) {
      this.subscription.add(
        this.eventsService.getEventsByUser(userId).subscribe({
          next: (events) => {
            this.enrolledEvents = events || []; // Assegura array
            console.log('Events loaded inside loadData:', JSON.stringify(this.enrolledEvents)); // Log dels events carregats
            // <<<--- CRIDA DESPRÉS D'ASSIGNAR ---<<<
            console.log('Calling onDateChange from loadData SUCCESS');
            this.onDateChange();
          },
          error: (error) => {
            console.error('Error loading events:', error);
            this.enrolledEvents = [];
            // <<<--- CRIDA TAMBÉ EN CAS D'ERROR (per calcular dia setmana) ---<<<
            console.log('Calling onDateChange from loadData ERROR');
            this.onDateChange();
          },
        })
      );
    } else {
      console.warn('User ID is undefined. Cannot fetch events.');
      this.enrolledEvents = [];
      // <<<--- CRIDA SI NO HI HA USUARI (per calcular dia setmana) ---<<<
      console.log('Calling onDateChange from loadData NO USER');
      this.onDateChange();
    }
  }

  // Selecciona la beguda inicial i configura la quantitat
  selectInitialDrink(): void {
    this.selectedDrink = this.drinks.find(d => d.name === 'Cervesa') || this.drinks[0];
    this.manualQuantity = this.selectedDrink.name === 'Manual';

    if (!this.manualQuantity && this.selectedDrink.name !== 'Selecciona') {
      this.drinkData.drink = this.selectedDrink.name;
      this.drinkData.quantity = this.selectedDrink.quantity * (this.drinkData.num_drinks || 1);
    } else if (this.manualQuantity) {
      this.drinkData.quantity = this.manualQuantityValue * (this.drinkData.num_drinks || 1);
    } else {
      this.drinkData.quantity = 0;
    }
    // Assegura que la quantitat tingui 2 decimals
    this.drinkData.quantity = parseFloat(this.drinkData.quantity.toFixed(2));
  }


  // --- Gestió de Quantitats i Begudes ---

  onDrinkQuantityChange(event: any) {
    const selectedName = event.target.value;
    this.selectedDrink = this.drinks.find(d => d.name === selectedName) || this.drinks[0];
    console.log('Selected drink changed:', this.selectedDrink);

    this.manualQuantity = this.selectedDrink.name === 'Manual';

    // Si no és manual ni 'Selecciona', actualitza el nom de la beguda si estava buit o era diferent
    if (!this.manualQuantity && this.selectedDrink.name !== 'Selecciona') {
      if (!this.drinkData.drink || !this.drinks.some(d => d.name === this.drinkData.drink)) {
        this.drinkData.drink = this.selectedDrink.name;
      }
    }
    this.updateQuantity();
  }

  onNumDrinksChange(newValue: number | string) {
    const num = Number(newValue);
    // Permet només enters positius
    if (Number.isInteger(num) && num > 0) {
      this.drinkData.num_drinks = num;
      console.log('Num drinks changed:', this.drinkData.num_drinks);
      this.updateQuantity();
    } else if (typeof newValue === 'string' && newValue.trim() === '') {
      // Permet esborrar l'input temporalment
      this.drinkData.num_drinks = 1; // O posar un valor per defecte
    } else {
      // Si el valor no és vàlid, podries resetejar-lo o mostrar un avís
      // Per ara, simplement no actualitzem si no és vàlid
      console.warn('Invalid value for num_drinks:', newValue);
    }
  }

  // Actualitza la quantitat total basada en la selecció/manual i el número d'unitats
  updateQuantity() {
    const numDrinks = Number(this.drinkData.num_drinks) || 1; // Si num_drinks és invàlid, assumeix 1

    if (this.manualQuantity) {
      const manualQty = Number(this.manualQuantityValue) || 0;
      this.drinkData.quantity = manualQty * numDrinks;
      console.log(`Quantity updated (Manual): ${manualQty} L/unit * ${numDrinks} units = ${this.drinkData.quantity} L`);
    } else if (this.selectedDrink && this.selectedDrink.name !== 'Selecciona') {
      const drinkQty = Number(this.selectedDrink.quantity) || 0;
      this.drinkData.quantity = drinkQty * numDrinks;
      console.log(`Quantity updated (Selected: ${this.selectedDrink.name}): ${drinkQty} L/unit * ${numDrinks} units = ${this.drinkData.quantity} L`);
    } else {
      this.drinkData.quantity = 0;
      console.log(`Quantity updated (Selecciona): 0 L`);
    }
    // Aplica sempre el format de 2 decimals
    this.drinkData.quantity = parseFloat(this.drinkData.quantity.toFixed(2));
    this.updateTotalPrice(); // El preu total depèn de la quantitat si és individual
  }

  // S'activa quan canvia el valor de quantitat manual
  onQuantityChange(newValue: any) {
    let valueStr = String(newValue).replace(',', '.'); // Permet comes o punts
    const parsedValue = parseFloat(valueStr);

    if (!isNaN(parsedValue) && parsedValue > 0) {
      this.manualQuantityValue = parseFloat(parsedValue.toFixed(2)); // Guarda amb 2 decimals
      console.log('Manual quantity value changed:', this.manualQuantityValue);
      this.updateQuantity(); // Recalcula la quantitat total
    } else if (valueStr.trim() === '') {
      this.manualQuantityValue = 0; // O un valor per defecte
      this.updateQuantity();
    } else {
      console.warn('Invalid manual quantity value:', newValue);
    }
  }

  // --- Gestió de Preus ---

  onPriceChange(newValue: number | string) {
    console.log('Price input changed:', newValue);
    // Assegurem que this.drinkData.price es manté numèric
    let priceStr = String(newValue).replace(',', '.');
    const parsedPrice = parseFloat(priceStr);
    if (!isNaN(parsedPrice) && parsedPrice >= 0) {
      this.drinkData.price = parseFloat(parsedPrice.toFixed(2));
    } else if (priceStr.trim() === '') {
      this.drinkData.price = 0;
    } else {
      console.warn('Invalid price input:', newValue);
      // Podries revertir al valor anterior o mantenir 0
      this.drinkData.price = 0;
    }
    this.updateTotalPrice();
  }

  onPriceTypeChange() {
    console.log('Price type changed. Is individual:', this.priceindividual);
    this.updateTotalPrice();
  }

  updateTotalPrice() {
    const price = Number(this.drinkData.price) || 0;
    const numDrinks = Number(this.drinkData.num_drinks) || 1;

    if (this.priceindividual) {
      this.totalPrice = price * numDrinks;
    } else {
      this.totalPrice = price; // El preu introduït ja és el total
    }
    this.totalPrice = parseFloat(this.totalPrice.toFixed(2)); // Assegura 2 decimals
    console.log(`Total price updated. Type: ${this.priceindividual ? 'Individual' : 'Total'}. Input Price: ${price}, Num Drinks: ${numDrinks}. Calculated Total: ${this.totalPrice}`);
  }

  // --- Gestió d'Inputs de Text (Lloc, Beguda) i Suggeriments ---

  onDrinkInputChange(newValue: string) {
    this.drinkData.drink = newValue;
    console.log('Drink input changed:', newValue);
    this.filterDrinks();
  }

  onLocationInputChange(newValue: string) {
    this.drinkData.location = newValue;
    console.log('Location input changed:', newValue);
    this.filterLocations();
  }

  filterLocations() {
    if (this.drinkData.location && this.drinkData.location.trim() !== '') {
      const searchTerm = this.drinkData.location.toLowerCase();
      this.locationSuggestions = this.lastLocations.filter(location =>
        location.toLowerCase().includes(searchTerm)
      ).slice(0, 5); // Limita a 5 suggeriments
    } else {
      this.locationSuggestions = [];
    }
  }

  filterDrinks() {
    if (this.drinkData.drink && this.drinkData.drink.trim() !== '') {
      const searchTerm = this.drinkData.drink.toLowerCase();
      const predefinedMatches = this.drinks
        .map(d => d.name)
        .filter(name => name !== 'Selecciona' && name !== 'Manual' && name.toLowerCase().includes(searchTerm));
      const lastDrinkMatches = this.lastDrinks
        .filter(drink => drink.toLowerCase().includes(searchTerm));

      // Combina i elimina duplicats
      this.drinkSuggestions = [...new Set([...predefinedMatches, ...lastDrinkMatches])]
        .slice(0, 5); // Limita a 5 suggeriments
    } else {
      this.drinkSuggestions = [];
    }
  }

  selectSuggestion(type: 'location' | 'drink', value: string) {
    if (type === 'location') {
      this.drinkData.location = value;
      this.locationSuggestions = []; // Oculta suggeriments
    } else if (type === 'drink') {
      this.drinkData.drink = value;
      this.drinkSuggestions = []; // Oculta suggeriments
      // Opcional: Si la beguda seleccionada és una predefinida, actualitza quantitat
      const matchedDrink = this.drinks.find(d => d.name === value);
      if (matchedDrink && matchedDrink.name !== 'Manual' && matchedDrink.name !== 'Selecciona') {
        this.selectedDrink = matchedDrink;
        this.manualQuantity = false;
        this.updateQuantity();
      } else {
        // Si és una beguda 'lastDrink' no predefinida, no canviem la quantitat seleccionada
      }
    }
  }


  // --- Utilitats de Data i GPS ---

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getDayOfWeek(date: Date): number {
    let day = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    return day === 0 ? 7 : day; // Converteix a 1 (Monday) to 7 (Sunday)
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.drinkData.latitude = position.coords.latitude;
          this.drinkData.longitude = position.coords.longitude;
          this.hasGpsData = true;
          console.log('GPS Location obtained:', this.drinkData.latitude, this.drinkData.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          this.hasGpsData = false;
          this.drinkData.latitude = 0; // Posa a null si falla
          this.drinkData.longitude = 0;
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 } // Augmentat timeout
      );
    } else {
      console.warn('Geolocation not supported by this browser.');
      this.hasGpsData = false;
      this.drinkData.latitude = 0;
      this.drinkData.longitude = 0;
    }
  }

  // --- Gestió d'Imatges ---

  openCamera() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';

    input.onchange = (event: Event) => {
      this.handleImageFile(event);
      input.value = ''; // Reseteja per poder fer una altra foto
    };
    input.click();
  }

  openGallery() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: Event) => {
      this.handleImageFile(event);
      input.value = ''; // Reseteja per poder seleccionar un altre cop
    };
    input.click();
  }

  // Funció comuna per gestionar el fitxer seleccionat (càmera o galeria)
  private handleImageFile(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      console.log("Image file captured/selected:", file.name, file.type, file.size);

      if (!file.type.startsWith('image/')) {
        this.alertService.showAlert('El fitxer seleccionat no és una imatge vàlida.', 'warning');
        this.clearImageSelection();
        return;
      }

      // Comprovar mida màxima (opcional, ex: 10MB)
      const maxSizeMB = 10;
      if (file.size > maxSizeMB * 1024 * 1024) {
        this.alertService.showAlert(`La imatge és massa gran (màx ${maxSizeMB}MB).`, 'warning');
        this.clearImageSelection();
        return;
      }

      this.imageFile = file;
      this.loadImagePreview(file);
    } else {
      console.log("No file captured/selected or operation cancelled.");
    }
  }

  loadImagePreview(file: File) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        this.imageUrl = e.target.result;
        console.log('Image preview loaded.');
      } else {
        console.error('Error reading file for preview.');
        this.imageUrl = null;
        this.imageFile = null; // Neteja el fitxer si la preview falla
      }
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      this.clearImageSelection();
      this.alertService.showAlert('Error al llegir el fitxer d\'imatge.', 'danger');
    };
    reader.readAsDataURL(file);
  }

  // Neteja la selecció d'imatge
  clearImageSelection() {
    this.imageUrl = null;
    this.imageFile = null;
    console.log('Image selection cleared.');
    // Si tens un input de fitxer visible, també el podries resetejar aquí
  }

  // Processa la imatge (redimensiona/comprimeix) abans de pujar-la
  async modifyImage(file: File): Promise<File | null> {
    return new Promise((resolve) => { // No necessita reject, resol amb null en cas d'error
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (!event.target?.result || typeof event.target.result !== 'string') {
          console.error('Error reading file for modification (no result).');
          return resolve(null);
        }

        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let { width, height } = img;

          // Calcula noves dimensions mantenint aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * MAX_WIDTH / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * MAX_HEIGHT / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            console.error('Could not get canvas context.');
            return resolve(null);
          }

          // Dibuixa la imatge redimensionada al canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Converteix el canvas a Blob (més eficient que DataURL per a File)
          canvas.toBlob((blob) => {
            if (blob) {
              // Crea un nou nom de fitxer (opcional, pots mantenir l'original)
              //const newFileName = file.name.replace(/\.[^/.]+$/, "") + '_resized.jpg';
              const newFileName = file.name; // Mantenim el nom original
              const newFile = new File([blob], newFileName, {
                type: 'image/jpeg', // Força JPEG per la compressió
                lastModified: Date.now()
              });
              console.log(`Image resized and compressed: ${newFile.name}, Size: ${Math.round(newFile.size / 1024)} KB`);
              resolve(newFile);
            } else {
              console.error('Error converting canvas to Blob.');
              resolve(null);
            }
          }, 'image/jpeg', 0.85); // Qualitat JPEG (0.85 és un bon equilibri)
        };
        img.onerror = (error) => {
          console.error('Error loading image for modification:', error);
          resolve(null);
        };
        img.src = event.target.result; // Assigna el DataURL llegit a l'<img>
      };
      reader.onerror = (error) => {
        console.error('FileReader error during modification:', error);
        resolve(null);
      };
      reader.readAsDataURL(file); // Comença a llegir el fitxer original
    });
  }

  // --- Enviament del Formulari ---

  async onSubmit() {
    console.log('onSubmit triggered. Preparing data...');
    // Validacions bàsiques abans de processar
    if (!this.drinkData.date) { this.alertService.showAlert('La data és obligatòria.', 'warning'); return; }
    if (!this.drinkData.location || this.drinkData.location.trim() === '') { this.alertService.showAlert('El lloc és obligatori.', 'warning'); return; }
    if (!this.drinkData.drink || this.drinkData.drink.trim() === '') { this.alertService.showAlert('La beguda és obligatòria.', 'warning'); return; }
    if (this.drinkData.quantity <= 0) { this.alertService.showAlert('La quantitat total ha de ser superior a 0.', 'warning'); return; }
    if (this.drinkData.num_drinks <= 0) { this.alertService.showAlert('El nombre d\'unitats ha de ser 1 o més.', 'warning'); return; }
    if (this.drinkData.price < 0) { this.alertService.showAlert('El preu no pot ser negatiu.', 'warning'); return; }
    // Comprova que l'usuari estigui assignat (hauria d'estar des de ngOnInit)
    if (!this.drinkData.user_id || this.drinkData.user_id === 0) {
      this.alertService.showAlert('Error: No s\'ha pogut identificar l\'usuari.', 'danger');
      return;
    }


    console.log('Data validation passed. Processing image and building FormData...');

    let fileToUpload: File | null = null;

    // Processa la imatge si n'hi ha una seleccionada
    if (this.imageFile) {
      try {
        this.alertService.showAlert('Processant imatge...', 'info', 2000); // Feedback visual
        console.log('Modifying image before upload...');
        fileToUpload = await this.modifyImage(this.imageFile);
        if (!fileToUpload) {
          console.warn('Image modification failed, upload will proceed without image.');
          this.alertService.showAlert('No s\'ha pogut processar la imatge. S\'enviarà sense.', 'warning');
        } else {
          console.log('Image modified successfully.');
        }
      } catch (error) {
        console.error('Error during image modification process:', error);
        this.alertService.showAlert('Error inesperat al processar la imatge.', 'danger');
        fileToUpload = null; // No envia si hi ha un error greu
      }
    }

    // Crea FormData per enviar les dades
    const formData = new FormData();

    // Afegeix camps de text i numèrics
    formData.append("user_id", String(this.drinkData.user_id));
    formData.append("date", this.drinkData.date);
    formData.append("day_of_week", String(this.drinkData.day_of_week));
    formData.append("location", this.capitalizeFirstLetter(this.drinkData.location.trim())); // Neteja i capitalitza
    formData.append("drink", this.capitalizeFirstLetter(this.drinkData.drink.trim()));     // Neteja i capitalitza
    formData.append("quantity", String(this.drinkData.quantity));
    formData.append("num_drinks", String(this.drinkData.num_drinks));
    formData.append("price", String(this.totalPrice)); // Envia el preu TOTAL calculat
    formData.append("price_is_individual", String(this.priceindividual)); // Indica com s'ha calculat el preu
    formData.append("price_input", String(this.drinkData.price)); // Envia el preu que l'usuari va introduir
    formData.append("others", this.drinkData.others?.trim() || ''); // Afegeix 'others' si existeix

    // Afegeix coordenades si existeixen
    if (this.drinkData.latitude !== null && this.drinkData.longitude !== null) {
      formData.append("latitude", String(this.drinkData.latitude));
      formData.append("longitude", String(this.drinkData.longitude));
    }

    // Afegeix l'ID de l'esdeveniment si està seleccionat
    if (this.selectedEventId !== null) {
      formData.append("event_id", String(this.selectedEventId));
      console.log(`Appending event_id: ${this.selectedEventId}`);
    } else {
      console.log('No event_id selected to append.');
      // Si el backend necessita el camp encara que sigui null, descomenta:
      // formData.append("event_id", ''); // O envia null explícitament si el backend ho accepta
    }

    // Afegeix la imatge processada (si existeix)
    if (fileToUpload) {
      formData.append("image", fileToUpload, fileToUpload.name); // El tercer argument és el nom del fitxer
      console.log('Appending processed image to FormData:', fileToUpload.name);
    } else {
      console.log('No image file to append.');
    }

    // Mostra el contingut de FormData (per debugging)
    // console.log('--- FormData Content ---');
    // formData.forEach((value, key) => { console.log(`${key}: ${value}`); });
    // console.log('-----------------------');


    console.log('FormData prepared. Starting upload...');
    this.upload(formData);
  }

  // Funció per capitalitzar la primera lletra
  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Gestiona la pujada del FormData al servidor
  upload(formData: FormData) {
    this.uploadProgress = 0; // Inicia el progrés
    this.uploadSub = this.drinkingDataService.addDrinkData(formData)
      .pipe(finalize(() => {
        console.log('Upload process finalized (success or error).');
        this.resetUploadState(); // Neteja l'estat de la pujada
      }))
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            if (event.total) {
              this.uploadProgress = Math.round(100 * (event.loaded / event.total));
              console.log(`Upload Progress: ${this.uploadProgress}%`);
            }
          } else if (event.type === HttpEventType.Response) {
            console.log('Upload successful. Server response:', event.body);
            this.alertService.showAlert('Consum afegit correctament!', 'success', 3000);
            this.resetForm(); // Neteja el formulari
            this.loadData(); // Recarrega dades (opcional, potser només llistes)
          }
        },
        error: (error) => {
          console.error('Upload failed:', error);
          // Intenta obtenir un missatge d'error més útil del backend
          const errorMsg = error.error?.message || error.error?.error || error.message || 'Error desconegut al servidor.';
          this.alertService.showAlert(`Error en afegir el consum: ${errorMsg}`, 'danger', 7000);
          // No resetejar el formulari en cas d'error permet a l'usuari corregir
        }
      });
  }

  // Cancela una pujada en curs
  cancelUpload() {
    if (this.uploadSub) {
      console.log('Cancelling upload...');
      this.uploadSub.unsubscribe(); // Atura la subscripció
      this.resetUploadState();      // Neteja l'estat
      this.alertService.showAlert('Pujada cancel·lada.', 'info');
    }
  }

  // Reseteja les variables relacionades amb la pujada
  resetUploadState() {
    console.log('Resetting upload state.');
    this.uploadProgress = undefined;
    this.uploadSub = undefined; // Important per evitar cancel·lar subscripcions inexistents
  }

  // Reseteja completament el formulari a l'estat inicial
  resetForm() {
    console.log('Resetting form...');
    const currentDate = this.formatDate(new Date());
    const currentLat = this.drinkData.latitude; // Guarda coordenades si existeixen
    const currentLon = this.drinkData.longitude;
    const currentUserId = this.drinkData.user_id; // Guarda ID usuari

    // Restableix l'objecte drinkData
    this.drinkData = {
      user_id: currentUserId, // Manté l'usuari
      date: currentDate,
      day_of_week: 0, // Es recalcularà a onDateChange
      location: '',
      latitude: currentLat,
      longitude: currentLon,
      drink: '',
      quantity: 0.33, // Restableix valor inicial
      num_drinks: 1,
      others: '',
      price: 0,
      event_id: null // Important reiniciar l'event_id
    };

    // Restableix altres propietats de l'estat del component
    this.selectedEventId = null; // Desselecciona l'event al select
    this.priceindividual = true;
    this.manualQuantity = false;
    this.manualQuantityValue = 0.33;
    this.totalPrice = 0;
    this.clearImageSelection(); // Neteja imatge i preview
    this.locationSuggestions = [];
    this.drinkSuggestions = [];
    this.resetUploadState(); // Assegura que no quedi cap estat de pujada

    // Restableix la beguda seleccionada i la quantitat inicial
    this.selectInitialDrink();

    // Si no teníem GPS abans i ara tampoc, intenta obtenir-lo de nou
    if (!this.hasGpsData && currentLat === null) {
      this.getCurrentLocation();
    }

    // Finalment, crida onDateChange per calcular el dia i seleccionar l'event si escau per la data actual
    this.onDateChange();

    // Actualitza el preu total basat en els valors resetejats
    this.updateTotalPrice();

    console.log('Form reset complete.');
  }
}
