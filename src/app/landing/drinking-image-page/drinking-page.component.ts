import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DrinkingDataService } from '../../core/services/drinking-data/drinking-data.service';
import { Subscription } from 'rxjs';
import { DrinkData } from '../../core/models/drink-data.model';
import { AlertService } from '../../core/services/alert/alert.service';
import { RouterModule } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { DrinkEventsService } from '../../core/services/drink-events.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { DrinkEvent } from '../../core/models/v2_drink-events.model';

@Component({
  selector: 'app-drinking-page',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './drinking-page.component.html',
  styleUrls: ['./drinking-page.component.css']
})
export class DrinkingPageComponent implements OnInit, OnDestroy {

  eventsService = inject(DrinkEventsService);
  private authService = inject(AuthService);

  drinkData: DrinkData = {
    user_id: 0, // Considera obtenir-lo d'algun servei d'autenticació si cal
    date: '',
    day_of_week: 0,
    location: '',
    latitude: 0,
    longitude: 0,
    drink: '',
    quantity: 0.33, // Valor inicial per si de cas
    num_drinks: 1,
    others: '',
    price: 0 // Inicialitza el preu a 0
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
  enrolledEvents: DrinkEvent[] = []

  imageUrl: string | ArrayBuffer | null = null;
  imageFile: File | null = null; // Aquí es guardarà el fitxer de la foto o galeria
  uploadProgress: number | undefined;
  uploadSub: Subscription | undefined;

  constructor(
    private drinkingDataService: DrinkingDataService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.drinkData.date = this.formatDate(new Date());
    this.updateDayOfWeek();
    this.getCurrentLocation();
    this.loadData();

    if (this.selectedDrink.name !== 'Selecciona' && this.selectedDrink.name !== 'Manual') {
      this.drinkData.drink = this.selectedDrink.name;
      this.drinkData.quantity = this.selectedDrink.quantity;
    } else if (this.selectedDrink.name === 'Manual') {
      this.manualQuantity = true;
      this.drinkData.quantity = this.manualQuantityValue;
    } else {
      this.drinkData.quantity = 0;
    }
    this.drinkData.num_drinks = 1;
    this.updateTotalPrice();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.uploadSub?.unsubscribe();
  }

  onDrinkQuantityChange(event: any) {
    const selectedName = event.target.value;
    this.selectedDrink = this.drinks.find(d => d.name === selectedName) || this.drinks[0];
    console.log('Selected drink changed:', this.selectedDrink);

    this.manualQuantity = this.selectedDrink.name === 'Manual';

    if (!this.manualQuantity && this.selectedDrink.name !== 'Selecciona') {
      if (!this.drinkData.drink || this.drinks.some(d => d.name === this.drinkData.drink && d.name !== this.selectedDrink.name)) {
        this.drinkData.drink = this.selectedDrink.name;
      }
    }
    this.updateQuantity();
  }

  onNumDrinksChange(newValue: number | string) {
    const num = Number(newValue);
    if (Number.isInteger(num) && num > 0) {
      this.drinkData.num_drinks = num;
      console.log('Num drinks changed:', this.drinkData.num_drinks);
      this.updateQuantity();
    }
  }

  updateQuantity() {
    const numDrinks = Number(this.drinkData.num_drinks) || 1;

    if (this.manualQuantity) {
      const manualQty = Number(this.manualQuantityValue) || 0;
      this.drinkData.quantity = parseFloat((manualQty * numDrinks).toFixed(2));
      console.log(`Quantity updated (Manual): ${manualQty} L/unit * ${numDrinks} units = ${this.drinkData.quantity} L`);
    } else if (this.selectedDrink.name !== 'Selecciona') {
      const drinkQty = Number(this.selectedDrink.quantity) || 0;
      this.drinkData.quantity = parseFloat((drinkQty * numDrinks).toFixed(2));
      console.log(`Quantity updated (Selected: ${this.selectedDrink.name}): ${drinkQty} L/unit * ${numDrinks} units = ${this.drinkData.quantity} L`);
    } else {
      this.drinkData.quantity = 0;
      console.log(`Quantity updated (Selecciona): 0 L`);
    }
    this.updateTotalPrice();
  }

  onPriceChange(newValue: number | string) {
    console.log('Price input changed:', newValue);
    this.updateTotalPrice();
  }

  onDrinkInputChange(newValue: string) {
    this.drinkData.drink = newValue;
    console.log('Drink input changed:', newValue);
    this.filterDrinks();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      console.error('Geolocation not supported by this browser.');
      this.hasGpsData = false;
    }
  }

  filterLocations() {
    if (this.drinkData.location) {
      this.locationSuggestions = this.lastLocations.filter(location =>
        location.toLowerCase().includes(this.drinkData.location.toLowerCase())
      ).slice(0, 5);
    } else {
      this.locationSuggestions = [];
    }
  }

  filterDrinks() {
    if (this.drinkData.drink) {
      this.drinkSuggestions = [
        ...this.drinks.map(d => d.name).filter(name => name !== 'Selecciona' && name.toLowerCase().includes(this.drinkData.drink.toLowerCase())),
        ...this.lastDrinks.filter(drink => drink.toLowerCase().includes(this.drinkData.drink.toLowerCase()))
      ]
        .filter((value, index, self) => self.indexOf(value) === index)
        .slice(0, 5);
    } else {
      this.drinkSuggestions = [];
    }
  }

  loadData() {
    this.subscription.add(this.drinkingDataService.getLastLocations().subscribe(
      locations => { this.lastLocations = locations; console.log('Last locations loaded:', locations); },
      error => console.error('Error loading last locations:', error)
    ));
    this.subscription.add(this.drinkingDataService.getLastDrinks().subscribe(
      drinks => { this.lastDrinks = drinks; console.log('Last drinks loaded:', drinks); },
      error => console.error('Error loading last drinks:', error)
    ));
    const userId = this.authService.getUser()?.id;
    if (userId !== undefined) {
      this.subscription.add(
        this.eventsService.getEventsByUser(userId).subscribe({
          next: (events) => {
            this.enrolledEvents = events;
            console.log('Events loaded:', events)
          },
          error: (error) => console.error('Error loading events:', error),
        })
      );
    } else {
      console.error('User ID is undefined. Cannot fetch events.');
    }
  }

  getDayOfWeek(date: Date): number {
    let day = date.getDay();
    return day === 0 ? 7 : day;
  }

  updateDayOfWeek() {
    if (this.drinkData.date) {
      const date = new Date(this.drinkData.date + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        this.drinkData.day_of_week = this.getDayOfWeek(date);
        console.log('Day of week updated:', this.drinkData.day_of_week);
      } else {
        console.error('Invalid date format for day of week calculation:', this.drinkData.date);
        this.drinkData.day_of_week = 0;
      }
    }
  }

  onQuantityChange(newValue: any) {
    if (typeof newValue === 'string') {
      newValue = newValue.replace(',', '.');
    }
    const parsedValue = parseFloat(newValue);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      this.manualQuantityValue = parseFloat(parsedValue.toFixed(2));
      console.log('Manual quantity value changed:', this.manualQuantityValue);
      this.updateQuantity();
    }
  }

  onPriceTypeChange() {
    console.log('Price type changed. Is individual:', this.priceindividual);
    this.updateTotalPrice();
  }

  updateTotalPrice() {
    const price = Number(this.drinkData.price) || 0;
    const numDrinks = Number(this.drinkData.num_drinks) || 1;

    if (this.priceindividual) {
      this.totalPrice = parseFloat((price * numDrinks).toFixed(2));
    } else {
      this.totalPrice = parseFloat(price.toFixed(2));
    }
    console.log(`Total price updated. Type: ${this.priceindividual ? 'Individual' : 'Total'}. Input Price: ${price}, Num Drinks: ${numDrinks}. Calculated Total: ${this.totalPrice}`);
  }

  // --- Funcions d'Imatge ---

  // ******************************************************
  // *** FUNCIÓ openCamera CORREGIDA ***
  // ******************************************************
  openCamera() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // Accepta només imatges
    input.capture = 'environment'; // Intenta obrir la càmera directament

    input.onchange = (event: Event) => {
      const fileInput = event.target as HTMLInputElement;
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        console.log("Foto capturada:", file.name, file.type);

        // Comprova el tipus MIME per assegurar que és una imatge
        if (!file.type.startsWith('image/')) {
          this.alertService.showAlert('El fitxer capturat no és una imatge vàlida.', 'warning');
          this.imageFile = null; // Neteja si hi havia alguna cosa abans
          this.imageUrl = null;
          fileInput.value = ''; // Reseteja l'input
          return; // Atura l'execució aquí
        }

        // *** CORRECCIÓ CLAU: Guarda el fitxer i carrega la preview ***
        this.imageFile = file;       // Guarda el fitxer a la propietat del component
        this.loadImagePreview(file); // Carrega la previsualització

        // Pots mantenir o eliminar aquesta alerta addicional
        // this.alertService.showAlert('Foto preparada per pujar!', 'success');

        // Reseteja el valor de l'input per permetre fer una altra foto immediatament si cal
        fileInput.value = '';

      } else {
        console.log("No s'ha capturat cap fitxer.");
        // Opcional: alerta si l'usuari cancel·la
        // this.alertService.showAlert('Captura cancel·lada.', 'info');
      }
    };

    // Simula un clic a l'input ocult per obrir la càmera/selector
    input.click();
  }
  // ******************************************************
  // ******************************************************

  // Funció auxiliar per convertir Data URL a File (si fes falta en un altre lloc)
  dataURLtoFile(dataurl: string, filename: string): File | null {
    try {
      let arr = dataurl.split(','),
        mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) return null;

      let mime = mimeMatch[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (e) {
      console.error("Error converting Data URL to File:", e);
      return null;
    }
  }

  // S'activa quan es selecciona un fitxer des de la galeria
  onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;

    if (fileList && fileList[0]) {
      const file = fileList[0];
      console.log('File selected from gallery:', file.name, file.type);
      if (!file.type.startsWith('image/')) {
        this.alertService.showAlert('Si us plau, selecciona un fitxer d\'imatge.', 'warning');
        this.imageFile = null;
        this.imageUrl = null;
        element.value = '';
        return;
      }
      this.imageFile = file;
      this.loadImagePreview(file);
    }
    element.value = ''; // Reseteja sempre
  }

  // Obre el selector de fitxers del dispositiu (Galeria)
  openGallery() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: Event) => this.onFileSelected(event); // Reutilitza onFileSelected
    input.click();
  }

  // Carrega la imatge seleccionada per a previsualització
  loadImagePreview(file: File) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        this.imageUrl = e.target.result; // Mostra la preview
        console.log('Image preview loaded.');
      } else {
        console.error('Error reading file for preview.');
        this.imageUrl = null;
      }
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      this.imageUrl = null;
      this.alertService.showAlert('Error al llegir el fitxer d\'imatge.', 'danger');
    };
    reader.readAsDataURL(file); // Llegeix com a Data URL per la preview
  }

  // --- Funcions d'Enviament ---

  async onSubmit() {
    console.log('onSubmit triggered. Preparing data...');
    // Crida directament a submitData que ja conté la lògica i validacions
    await this.submitData();
  }

  async submitData() {
    // Validacions
    if (!this.drinkData.date) { this.alertService.showAlert('La data és obligatòria.', 'warning'); return; }
    if (!this.drinkData.location) { this.alertService.showAlert('El lloc és obligatori.', 'warning'); return; }
    if (!this.drinkData.drink) { this.alertService.showAlert('La beguda és obligatòria.', 'warning'); return; }
    if (this.drinkData.quantity <= 0) { this.alertService.showAlert('La quantitat total ha de ser superior a 0.', 'warning'); return; }
    if (this.drinkData.num_drinks <= 0) { this.alertService.showAlert('El nombre d\'unitats ha de ser 1 o més.', 'warning'); return; }
    if (this.drinkData.price < 0) { this.alertService.showAlert('El preu no pot ser negatiu.', 'warning'); return; }

    console.log('Data validation passed. Preparing FormData...');

    this.drinkData.location = this.capitalizeFirstLetter(this.drinkData.location);
    this.drinkData.drink = this.capitalizeFirstLetter(this.drinkData.drink);

    // Ara this.imageFile contindrà el fitxer (de càmera o galeria)
    let fileToUpload: File | null = this.imageFile;

    // Processa la imatge si existeix
    if (this.imageFile) {
      try {
        console.log('Modifying image before upload...');
        fileToUpload = await this.modifyImage(this.imageFile); // Usa this.imageFile
        if (fileToUpload) {
          console.log('Image modified successfully:', fileToUpload.name, fileToUpload.size);
        } else {
          console.warn('Image modification resulted in null, upload will proceed without image.');
          // fileToUpload ja és null en aquest cas
        }
      } catch (error) {
        console.error('Error modifying image:', error);
        this.alertService.showAlert('Error al processar la imatge. S\'enviarà sense.', 'warning');
        fileToUpload = null; // No envia si falla el processament
      }
    }

    // Crea FormData
    const formData = new FormData();
    formData.append("date", this.drinkData.date);
    formData.append("day_of_week", String(this.drinkData.day_of_week));
    formData.append("location", this.drinkData.location);
    formData.append("latitude", String(this.drinkData.latitude || 0));
    formData.append("longitude", String(this.drinkData.longitude || 0));
    formData.append("drink", this.drinkData.drink);
    formData.append("quantity", String(this.drinkData.quantity));
    formData.append("num_drinks", String(this.drinkData.num_drinks));
    formData.append("price", String(this.totalPrice)); // Preu total calculat
    formData.append("price_is_individual", String(this.priceindividual));
    formData.append("price_input", String(this.drinkData.price)); // Preu introduït
    formData.append("others", this.drinkData.others || '');

    // Afegeix la imatge si fileToUpload no és null
    if (fileToUpload) {
      formData.append("image", fileToUpload, fileToUpload.name);
      console.log('Appending image to FormData:', fileToUpload.name);
    } else {
      console.log('No image to append.');
    }

    console.log('FormData prepared. Starting upload...');
    this.upload(formData);
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  upload(formData: FormData) {
    this.uploadProgress = 0;
    this.uploadSub = this.drinkingDataService.addDrinkData(formData)
      .pipe(finalize(() => {
        console.log('Upload process finalized.');
        this.resetUploadState();
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
            this.resetForm();
            this.loadData();
          }
        },
        error: (error) => {
          console.error('Upload failed:', error);
          const errorMsg = error.error?.message || error.message || 'Error desconegut al servidor.';
          this.alertService.showAlert(`Error en afegir el consum: ${errorMsg}`, 'danger', 7000);
          // No resetejar el formulari en cas d'error
        }
      });
  }

  cancelUpload() {
    if (this.uploadSub) {
      console.log('Cancelling upload...');
      this.uploadSub.unsubscribe();
      this.resetUploadState();
      this.alertService.showAlert('Pujada cancel·lada.', 'info');
    }
  }

  resetUploadState() {
    console.log('Resetting upload state.');
    this.uploadProgress = undefined;
    this.uploadSub = undefined;
  }

  resetForm() {
    console.log('Resetting form...');
    const currentDate = this.formatDate(new Date());
    const currentLat = this.drinkData.latitude; // Guarda lat/lon actuals
    const currentLon = this.drinkData.longitude;

    this.drinkData = {
      user_id: 0,
      date: currentDate,
      day_of_week: this.getDayOfWeek(new Date(currentDate + 'T00:00:00')),
      location: '',
      latitude: currentLat, // Restaura lat/lon
      longitude: currentLon,
      drink: '',
      quantity: 0.33,
      num_drinks: 1,
      others: '',
      price: 0
    };

    this.selectedDrink = this.drinks.find(d => d.name === 'Cervesa') || this.drinks[0];
    this.manualQuantity = false;
    this.manualQuantityValue = 0.33;
    this.priceindividual = true;
    this.totalPrice = 0;

    this.imageUrl = null;
    this.imageFile = null; // Important netejar el fitxer guardat

    this.locationSuggestions = [];
    this.drinkSuggestions = [];

    this.resetUploadState();

    // Si no teníem GPS abans, intenta obtenir-lo de nou
    if (!this.hasGpsData) {
      this.getCurrentLocation();
    }

    this.updateQuantity(); // Recalcula quantitat i preu inicials

    console.log('Form reset complete.');
  }

  // Processa la imatge: redimensiona i comprimeix
  modifyImage(file: File): Promise<File | null> { // Modificat per permetre retorn null
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (!event.target?.result || typeof event.target.result !== 'string') {
          console.error('Error reading file for modification (no result).');
          return resolve(null); // Resol amb null si falla la lectura
        }

        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

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
            return resolve(null); // Resol amb null si falla el context
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const newFileName = file.name.replace(/\.[^/.]+$/, "") + '.jpg'; // Canvia extensió
              const newFile = new File([blob], newFileName, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(newFile); // Resol amb el nou fitxer
            } else {
              console.error('Error converting canvas to Blob.');
              resolve(null); // Resol amb null si falla la conversió a Blob
            }
          }, 'image/jpeg', 0.8); // Compressió JPEG al 80%
        };
        img.onerror = (error) => {
          console.error('Error loading image for modification:', error);
          resolve(null); // Resol amb null si falla la càrrega de l'<img>
        };
        img.src = event.target.result;
      };
      reader.onerror = (error) => {
        console.error('FileReader error during modification:', error);
        resolve(null); // Resol amb null si falla FileReader
      };
      reader.readAsDataURL(file);
    });
  }
}
