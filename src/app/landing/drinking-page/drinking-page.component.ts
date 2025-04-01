import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DrinkingDataService } from '../../core/services/drinking-data/drinking-data.service';
import { Subscription } from 'rxjs';
import { DrinkData } from '../../core/models/drink-data.model';
import { AlertService } from '../../core/services/alert/alert.service';
import { RouterModule } from '@angular/router';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-drinking-page',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './drinking-page.component.html',
  styleUrls: ['./drinking-page.component.css']
})
export class DrinkingPageComponent implements OnInit, OnDestroy {

  drinkData: DrinkData = {
    user_id: 0, // S'assignarà al backend normalment
    date: this.formatDate(new Date()), // Valor inicial amb la data actual
    day_of_week: this.getDayOfWeek(new Date()), // Valor inicial
    location: '',
    latitude: 0,
    longitude: 0,
    drink: '',
    quantity: 0.33,
    num_drinks: 1,
    others: '',
    price: 0
  };

  drinks = [
    { name: 'Selecciona', quantity: 0, descr: 'Selecciona una opció' },
    { name: 'Manual', quantity: 0.33, descr: 'Introdueix manualment la quantitat' },
    { name: 'Cervesa', quantity: 0.33, descr: '33 cl' },
    { name: 'Cubata', quantity: 0.33, descr: '33 cl' },
    { name: 'Cubata Tub', quantity: 0.25, descr: '250 ml' },
    { name: 'Tubo', quantity: 0.40, descr: '40 cl' }, // Nota: Potser volies dir cervesa en Tubo?
    { name: 'Quinto', quantity: 0.20, descr: '20 cl' },
    { name: 'Xupito', quantity: 0.04, descr: '4 cl' },
    { name: 'Canya', quantity: 0.25, descr: '25 cl' },
    { name: 'Gerra', quantity: 1, descr: '1 l' },
    { name: 'Sangria', quantity: 1.5, descr: '1.5 l' },
    { name: 'Vi', quantity: 0.15, descr: '15 cl (una copa)' }
  ];

  selectedDrink = this.drinks[0];
  // Renombrat per claredat: indica si el preu introduït és per unitat o pel total
  isPricePerUnit: boolean = true;
  manualQuantity: boolean = false;
  manualQuantityValue: number = 0.33; // Quantitat per beguda quan és manual

  lastLocations: string[] = [];
  lastDrinks: string[] = [];
  locationSuggestions: string[] = [];
  drinkSuggestions: string[] = [];
  private dataSubscription: Subscription | undefined; // Subscripció per carregar dades
  hasGpsData: boolean = true; // Per saber si tenim coordenades

  imageUrl: string | ArrayBuffer | null = null; // Tipat més estricte
  imageFile: File | null = null;
  uploadProgress: number | undefined;
  private uploadSub: Subscription | undefined; // Subscripció per l'enviament

  constructor(
    private drinkingDataService: DrinkingDataService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.getCurrentLocation();
    // La data i dia ja s'inicialitzen a la declaració de drinkData
    this.loadData();
  }

  ngOnDestroy(): void {
    // Desubscripció per evitar memory leaks
    this.dataSubscription?.unsubscribe();
    this.uploadSub?.unsubscribe();
  }

  // Gestiona el canvi en el selector de beguda predefinida
  onDrinkSelectionChange(event: Event): void {
    const selectedName = (event.target as HTMLSelectElement).value;
    this.selectedDrink = this.drinks.find(d => d.name === selectedName) || this.drinks[0];

    this.manualQuantity = this.selectedDrink.name === 'Manual';

    // Si no és manual ni 'Selecciona', actualitza el nom de la beguda al model
    if (!this.manualQuantity && this.selectedDrink.name !== 'Selecciona') {
      this.drinkData.drink = this.selectedDrink.name;
    } else if (this.manualQuantity) {
       // Opcional: Buidar el camp drink si se selecciona manual? O deixar que l'usuari escrigui?
       // this.drinkData.drink = ''; // Descomenta si vols buidar-lo
    }

    this.updateQuantity(); // Recalcula la quantitat total
  }

  // Gestiona el canvi en el camp numèric de nombre de begudes
  onNumDrinksChange(newValue: number): void {
    // Assegura que sigui un enter positiu
    if (Number.isInteger(newValue) && newValue > 0) {
      this.drinkData.num_drinks = newValue;
      this.updateQuantity(); // Recalcula la quantitat total
    } else {
       // Opcional: resetejar a 1 si el valor no és vàlid?
       // this.drinkData.num_drinks = 1;
       // this.updateQuantity();
    }
  }

  // Actualitza la quantitat total (litres) basant-se en la selecció/entrada manual i el nombre de begudes
  updateQuantity(): void {
    if (this.manualQuantity) {
      // Si és manual, multiplica la quantitat manual per beguda pel nombre de begudes
      this.drinkData.quantity = parseFloat((this.manualQuantityValue * this.drinkData.num_drinks).toFixed(2));
    } else {
      // Si és predefinida, multiplica la quantitat de la beguda seleccionada pel nombre de begudes
      this.drinkData.quantity = parseFloat((this.selectedDrink.quantity * this.drinkData.num_drinks).toFixed(2));
    }
  }

  // Gestiona el canvi en el preu
  onPriceChange(newValue: number): void {
    // Podria afegir validació per assegurar que no sigui negatiu si cal
    if (typeof newValue === 'number') {
      this.drinkData.price = newValue;
    }
  }

  // Calcula el preu total a mostrar (no s'envia, és només per la UI)
  get totalPrice(): number {
    if (this.isPricePerUnit) {
        // Si el preu és per unitat, multiplica pel nombre de begudes
      return this.drinkData.num_drinks * this.drinkData.price;
    } else {
        // Si el preu ja és el total, el retorna directament
      return this.drinkData.price;
    }
  }

  // Quan l'usuari escriu directament al camp de text de la beguda
  onDrinkInputChange(newValue: string): void {
    this.drinkData.drink = newValue;
    // Opcional: Si escriu un nom que coincideix amb una beguda predefinida, actualitzar el selector?
    const foundDrink = this.drinks.find(drink => drink.name.toLowerCase() === newValue.toLowerCase());
    if (foundDrink && foundDrink.name !== 'Manual' && foundDrink.name !== 'Selecciona') {
      this.selectedDrink = foundDrink;
      this.manualQuantity = false;
      this.updateQuantity();
    } else {
        // Si no coincideix o és Manual/Selecciona, assegura que estem en mode manual si no hi havia ja
        // Potser no cal fer res aquí si l'usuari està escrivint lliurement.
    }
    this.filterDrinks(); // Actualitza suggeriments mentre escriu
  }

  // Formata un objecte Date a 'YYYY-MM-DD'
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Obté la posició GPS actual
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.drinkData.latitude = position.coords.latitude;
          this.drinkData.longitude = position.coords.longitude;
          this.hasGpsData = true;
          console.log('Ubicació obtinguda:', position.coords);
        },
        (error) => {
          console.error('Error al obtenir la ubicació:', error);
          this.hasGpsData = false;
          // Informar l'usuari que no s'ha pogut obtenir la ubicació
          this.alertService.showAlert('No s\'ha pogut obtenir la ubicació GPS.', 'warning', 4000);
        },
        {
          enableHighAccuracy: false, // false consumeix menys bateria i sol ser suficient
          timeout: 10000, // Augmentat el temps d'espera
          maximumAge: 60000 // Permet reutilitzar una ubicació recent (1 minut)
        }
      );
    } else {
      console.error('Geolocalització no suportada pel navegador.');
      this.hasGpsData = false;
      this.alertService.showAlert('La geolocalització no està disponible en aquest navegador.', 'warning', 4000);
    }
  }

  // Filtra les ubicacions anteriors per mostrar suggeriments
  filterLocations(): void {
    if (this.drinkData.location) {
      this.locationSuggestions = this.lastLocations.filter(location =>
        location.toLowerCase().includes(this.drinkData.location.toLowerCase())
      ).slice(0, 5); // Limita el nombre de suggeriments
    } else {
      this.locationSuggestions = [];
    }
  }

  // Filtra les begudes anteriors per mostrar suggeriments
  filterDrinks(): void {
    if (this.drinkData.drink) {
      this.drinkSuggestions = this.lastDrinks.filter(drink =>
        drink.toLowerCase().includes(this.drinkData.drink.toLowerCase())
      ).slice(0, 5); // Limita el nombre de suggeriments
    } else {
      this.drinkSuggestions = [];
    }
  }

  // Selecciona una ubicació suggerida
  selectLocation(location: string): void {
    this.drinkData.location = location;
    this.locationSuggestions = []; // Amaga els suggeriments
  }

  // Selecciona una beguda suggerida
  selectDrink(drink: string): void {
    this.drinkData.drink = drink;
    this.drinkSuggestions = []; // Amaga els suggeriments
    this.onDrinkInputChange(drink); // Crida per actualitzar el selector si coincideix
  }


  // Carrega les darreres ubicacions i begudes usades
  loadData(): void {
    this.dataSubscription = this.drinkingDataService.getLastLocations().subscribe({
      next: locations => {
        this.lastLocations = locations;
        console.log('Ubicacions anteriors carregades:', locations);
      },
      error: error => {
        console.error('Error al carregar ubicacions anteriors:', error);
        // Podria mostrar un missatge a l'usuari
      }
   });

    // Afegim la segona subscripció a la primera per gestionar-les juntes
    this.dataSubscription.add(this.drinkingDataService.getLastDrinks().subscribe({
      next: drinks => {
        this.lastDrinks = drinks;
        console.log('Begudes anteriors carregades:', drinks);
      },
      error: error => {
        console.error('Error al carregar begudes anteriors:', error);
      }
    }));
  }

  // Obté el dia de la setmana (Dilluns=1, Dimarts=2, ..., Diumenge=7)
  getDayOfWeek(date: Date): number {
    const day = date.getDay(); // Diumenge=0, Dilluns=1, ...
    return day === 0 ? 7 : day; // Converteix Diumenge de 0 a 7
  }

  // Actualitza el dia de la setmana quan canvia la data al formulari
  updateDayOfWeek(): void {
    // Assegurem que la data tingui un format que Date pugui entendre fàcilment
    // L'ISO format 'YYYY-MM-DD' és generalment segur.
    const dateParts = this.drinkData.date.split('-');
    // Nota: Mesos en Date() són 0-indexats (Gener=0), per això restem 1.
    const date = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
    if (!isNaN(date.getTime())) { // Comprova si la data és vàlida
       this.drinkData.day_of_week = this.getDayOfWeek(date);
    }
  }

  // Gestiona el canvi de quantitat quan és manual (permet comes i punts)
  onQuantityChange(newValue: string | number): void {
    let valueStr = String(newValue).replace(',', '.'); // Reemplaça coma per punt
    const parsedValue = parseFloat(valueStr);

    if (!isNaN(parsedValue) && parsedValue > 0) {
      this.manualQuantityValue = parseFloat(parsedValue.toFixed(2));
      this.updateQuantity(); // Recalcula la quantitat total
    }
  }

 // --- Gestió d'Imatges ---

  // Obre la càmera (funció bàsica de captura)
  openCamera(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }) // Prioritza càmera trasera
        .then(stream => {
          // Necessitem un element <video> i <canvas> (podrien estar ocults a l'HTML)
          const video = document.createElement('video');
          video.srcObject = stream;
          video.setAttribute('playsinline', ''); // Important per iOS
          video.play();

          const takePicture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              this.imageUrl = canvas.toDataURL('image/jpeg');
              this.imageFile = this.dataURLtoFile(this.imageUrl, `capture_${Date.now()}.jpeg`);

              // Aturar el stream de vídeo
              stream.getTracks().forEach(track => track.stop());
              video.removeEventListener('loadedmetadata', takePicture); // Neteja listener
            } else {
                 this.alertService.showAlert('No s\'ha pogut processar la imatge de la càmera.', 'danger', 5000);
                 stream.getTracks().forEach(track => track.stop()); // Atura igualment
            }
          };

          // Espera que el vídeo tingui metadades (dimensions) per fer la foto
          video.addEventListener('loadedmetadata', takePicture);

        })
        .catch(err => {
          console.error("Error en accedir a la càmera:", err);
          this.alertService.showAlert('No s\'ha pogut accedir a la càmera. Comprova els permisos.', 'danger', 5000);
        });
    } else {
      this.alertService.showAlert('La càmera no està disponible en aquest navegador.', 'warning', 5000);
    }
  }

  // Gestiona la selecció d'un fitxer des de l'input type="file"
  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0];
    if (file) {
      this.processSelectedFile(file);
    }
  }

  // Obre la galeria del dispositiu (simula un clic a un input file ocult)
  openGallery(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // Accepta només imatges

    input.onchange = (event: Event) => {
      const element = event.target as HTMLInputElement;
      const file = element.files?.[0];
      if (file) {
        this.processSelectedFile(file);
      }
    };

    input.click(); // Obre el selector de fitxers
  }

  // Processa el fitxer seleccionat (tant de càmera com de galeria)
  processSelectedFile(file: File): void {
      // Validació bàsica del tipus de fitxer (opcional però recomanada)
      if (!file.type.startsWith('image/')) {
        this.alertService.showAlert('El fitxer seleccionat no és una imatge.', 'warning');
        return;
      }
      this.imageFile = file;
      this.loadImagePreview(file);
  }

  // Carrega la previsualització de la imatge
  loadImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      // Assigna el resultat (DataURL) a imageUrl per mostrar-lo a la plantilla
      this.imageUrl = e.target?.result ?? null;
    };
    reader.onerror = (error) => {
        console.error("Error al llegir el fitxer:", error);
        this.alertService.showAlert('No s\'ha pogut carregar la previsualització de la imatge.', 'danger');
        this.imageUrl = null; // Neteja per si hi havia una imatge anterior
        this.imageFile = null;
    }
    reader.readAsDataURL(file); // Llegeix el fitxer com a DataURL
  }

  // Converteix una DataURL (base64) a un objecte File
  dataURLtoFile(dataurl: string, filename: string): File | null {
    try {
      const arr = dataurl.split(',');
      if (arr.length < 2) return null; // Comprovació bàsica

      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch || mimeMatch.length < 2) return null; // Comprovació bàsica
      const mime = mimeMatch[1];

      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (e) {
        console.error("Error al convertir DataURL a File:", e);
        return null;
    }
  }

  // --- Enviament del Formulari ---

  // Funció que s'executa quan s'envia el formulari
  async onSubmit(): Promise<void> {
    // *** IMPORTANT: Assegura't que al teu HTML només crides aquesta funció UNA VEGADA per enviament.
    // *** La forma recomanada és amb (ngSubmit) a l'etiqueta <form> i un botó <button type="submit"> dins.
    // *** Evita tenir (ngSubmit) al form I (click)="onSubmit()" al botó alhora.

    console.log('Iniciant enviament de dades...'); // Log per debugging

    // Validacions abans d'enviar
    if (this.drinkData.price < 0) {
        this.alertService.showAlert('El preu no pot ser negatiu.', 'warning', 5000);
        return;
    }
    if (this.drinkData.quantity <= 0) {
        this.alertService.showAlert('La quantitat ha de ser superior a zero.', 'warning', 5000);
        return;
    }
     if (!this.drinkData.drink) {
        this.alertService.showAlert('Si us plau, indica la beguda.', 'warning', 5000);
        return;
    }
     if (!this.drinkData.location && !this.hasGpsData) {
        this.alertService.showAlert('Si us plau, indica la ubicació o activa el GPS.', 'warning', 5000);
        return;
    }


    // Prepara les dades per enviar
    await this.prepareAndSendData();
  }

  // Prepara el FormData i inicia la càrrega
  async prepareAndSendData(): Promise<void> {

    // Capitalitza la primera lletra de location i drink (opcional, bona pràctica)
    this.drinkData.location = this.capitalizeFirstLetter(this.drinkData.location);
    this.drinkData.drink = this.capitalizeFirstLetter(this.drinkData.drink);

    // Crea l'objecte FormData per enviar les dades (necessari per fitxers)
    const formData = new FormData();

    // Afegeix tots els camps del model al FormData (convertint a string si cal)
    formData.append("date", this.drinkData.date);
    formData.append("day_of_week", String(this.drinkData.day_of_week));
    formData.append("location", this.drinkData.location);
    formData.append("latitude", String(this.drinkData.latitude));
    formData.append("longitude", String(this.drinkData.longitude));
    formData.append("drink", this.drinkData.drink);
    formData.append("quantity", String(this.drinkData.quantity));
    formData.append("num_drinks", String(this.drinkData.num_drinks));
    formData.append("others", String(this.drinkData.others));
    // Envia el preu per unitat si isPricePerUnit és true, o el preu total si és false
    formData.append("price", String(this.drinkData.price));
    formData.append("price_is_per_unit", String(this.isPricePerUnit)); // Envia com s'ha d'interpretar el preu

    // Comprova si hi ha un fitxer d'imatge per pujar
    if (this.imageFile) {
      try {
        // Processa la imatge (redimensiona/comprimeix) abans d'enviar-la
        const fileToUpload = await this.modifyImage(this.imageFile);
        // Afegeix la imatge processada al FormData
        formData.append("image", fileToUpload, fileToUpload.name);
        console.log('Imatge processada i afegida al FormData');
      } catch (error) {
          console.error("Error al processar la imatge:", error);
          this.alertService.showAlert('Hi ha hagut un error al processar la imatge. S\'enviaran només les dades.', 'warning', 6000);
          // Continua l'enviament sense la imatge
      }
    } else {
        console.log('No hi ha imatge per pujar.');
    }

    // Inicia la càrrega de les dades (amb o sense imatge)
    this.uploadData(formData);
  }

  // Funció auxiliar per capitalitzar la primera lletra
  capitalizeFirstLetter(text: string): string {
      if (!text) return '';
      return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Envia el FormData al servei
  uploadData(formData: FormData): void {
    this.uploadProgress = 0; // Reinicia el progrés

    // Cancel·la qualsevol enviament anterior que pogués estar en curs
    this.uploadSub?.unsubscribe();

    this.uploadSub = this.drinkingDataService.addDrinkData(formData)
      .pipe(
        // El finalize s'executa sempre, tant si hi ha èxit com error, un cop completat.
        finalize(() => {
            console.log('Procés d\'enviament finalitzat (èxit o error).');
            this.resetUploadState(); // Neteja l'estat de la càrrega
        })
      )
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            // Actualitza el progrés de la càrrega
            this.uploadProgress = Math.round(100 * (event.loaded / event.total));
            console.log(`Progrés: ${this.uploadProgress}%`);
          } else if (event instanceof HttpResponse) { // event.type === HttpEventType.Response
            // L'enviament s'ha completat amb èxit
            console.log('Resposta del backend:', event.body);
            this.alertService.showAlert('Dades enviades correctament!', 'success', 3000);
            this.resetForm(); // Neteja el formulari per a una nova entrada
            this.loadData(); // Recarrega les dades (ubicacions/begudes recents)
          }
        },
        error: (error) => {
          // S'ha produït un error durant l'enviament
          console.error('Error en enviar les dades:', error);
          let errorMessage = 'Error desconegut en enviar les dades.';
          if (error.error instanceof ErrorEvent) {
            // Error del costat client o de xarxa
            errorMessage = `Error de xarxa: ${error.error.message}`;
          } else if (error.status) {
            // El backend ha retornat un codi d'error
             errorMessage = `Error del servidor (${error.status}): ${error.message || error.statusText}`;
             // Podries afegir lògica específica per a certs codis (400, 401, 500, etc.)
             if (error.error && typeof error.error === 'string') {
                 errorMessage += ` - ${error.error}`; // Si el backend envia un missatge d'error simple
             } else if (error.error && error.error.message) {
                 errorMessage += ` - ${error.error.message}`; // Si el backend envia un objecte amb 'message'
             }
          }
          this.alertService.showAlert(errorMessage, 'danger', 7000); // Mostra l'error a l'usuari
          // No resetejem el formulari en cas d'error, perquè l'usuari pugui corregir i reintentar
        }
      });
  }

  // Cancel·la l'enviament en curs
  cancelUpload(): void {
    if (this.uploadSub) {
      this.uploadSub.unsubscribe();
      console.log('Enviament cancel·lat per l\'usuari.');
      this.resetUploadState();
      this.alertService.showAlert('Enviament cancel·lat.', 'info');
    }
  }

  // Neteja les variables relacionades amb l'estat de la càrrega
  resetUploadState(): void {
    this.uploadProgress = undefined;
    this.uploadSub = undefined; // Important per saber que no hi ha cap càrrega activa
  }

  // Reseteja tot el formulari als valors per defecte
  resetForm(): void {
    this.drinkData = {
      user_id: 0,
      date: this.formatDate(new Date()),
      day_of_week: this.getDayOfWeek(new Date()),
      location: '',
      latitude: this.drinkData.latitude, // Mantenim l'última lat/lon obtinguda? O resetejem?
      longitude: this.drinkData.longitude, // Depèn del que vulguis. Aquí les mantenim.
      drink: '',
      quantity: 0.33, // Valor per defecte
      num_drinks: 1, // Valor per defecte
      others: '',
      price: 0
    };
    this.imageUrl = null; // Neteja la previsualització
    this.imageFile = null; // Neteja el fitxer
    this.locationSuggestions = []; // Neteja suggeriments
    this.drinkSuggestions = [];   // Neteja suggeriments
    this.selectedDrink = this.drinks[0]; // Restableix el selector
    this.manualQuantity = false;
    this.manualQuantityValue = 0.33;
    this.isPricePerUnit = true; // Restableix el mode de preu
    this.uploadProgress = undefined; // Neteja el progrés si n'hi havia
     // Opcional: tornar a obtenir la localització actual?
    // this.getCurrentLocation();
  }

  // Modifica la imatge abans de pujar-la (redimensiona i comprimeix)
  modifyImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 1024; // Amplada màxima desitjada
          const MAX_HEIGHT = 1024; // Altura màxima desitjada
          let width = img.width;
          let height = img.height;

          // Calcula les noves dimensions mantenint la proporció
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          // Crea un canvas per redimensionar
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
              return reject(new Error('No s\'ha pogut obtenir el context 2D del canvas.'));
          }
          ctx.drawImage(img, 0, 0, width, height);

          // Converteix el canvas a Blob (per obtenir el File) amb compressió JPEG
          // La qualitat va de 0 (màxima compressió) a 1 (mínima compressió)
          canvas.toBlob((blob) => {
            if (blob) {
              // Crea un nou objecte File a partir del Blob
              const newFile = new File([blob], file.name, {
                type: 'image/jpeg', // Força el tipus a JPEG per la compressió
                lastModified: Date.now()
              });
              console.log(`Imatge redimensionada a ${width}x${height}, mida: ${Math.round(newFile.size / 1024)} KB`);
              resolve(newFile); // Retorna el nou fitxer processat
            } else {
              reject(new Error('Error en crear el Blob de la imatge comprimida.'));
            }
          }, 'image/jpeg', 0.8); // Qualitat de compressió (0.8 = 80%)
        };
        img.onerror = (error) => reject(new Error('No s\'ha pogut carregar la imatge per processar-la.'));
        // Assigna el resultat de la lectura (DataURL) a la font de la imatge
        img.src = event.target?.result as string;
      };
      reader.onerror = (error) => reject(error); // Gestiona errors de lectura del fitxer original
      reader.readAsDataURL(file); // Comença a llegir el fitxer original
    });
  }
}
