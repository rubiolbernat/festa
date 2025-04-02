import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DrinkingDataService } from '../../core/services/drinking-data/drinking-data.service';
import { Subscription } from 'rxjs';
import { DrinkData } from '../../core/models/drink-data.model';
import { AlertService } from '../../core/services/alert/alert.service';
import { RouterModule } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
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
    { name: 'Manual', quantity: 0.33, descr: 'Introdueix manualment la quantitat' }, // Quantitat base per manual
    { name: 'Cervesa', quantity: 0.33, descr: '33 cl' },
    { name: 'Cubata', quantity: 0.33, descr: '33 cl' },
    { name: 'Cubata Tub', quantity: 0.25, descr: '250 ml' },
    { name: 'Tubo', quantity: 0.40, descr: '40 cl' }, // Potser cervesa?
    { name: 'Quinto', quantity: 0.20, descr: '20 cl' },
    { name: 'Xupito', quantity: 0.04, descr: '4 cl' },
    { name: 'Canya', quantity: 0.25, descr: '25 cl' },
    { name: 'Gerra', quantity: 1, descr: '1 l' },
    { name: 'Sangria', quantity: 1.5, descr: '1.5 l' }, // Pot ser per persona o total, context important
    { name: 'Vi', quantity: 0.15, descr: '15 cl (una copa)' }
  ];

  // Inicialitza selectedDrink amb 'Selecciona' o el primer vàlid
  selectedDrink = this.drinks.find(d => d.name === 'Cervesa') || this.drinks[0]; // Per exemple, cervesa per defecte
  priceindividual: boolean = true; // Per defecte, el preu és per unitat
  manualQuantity: boolean = false;
  manualQuantityValue: number = 0.33; // Valor inicial per l'input manual
  totalPrice: number = 0; // Preu total calculat

  lastLocations: string[] = [];
  lastDrinks: string[] = [];
  locationSuggestions: string[] = [];
  drinkSuggestions: string[] = [];
  private subscription: Subscription = new Subscription(); // Inicialitza per evitar errors
  hasGpsData: boolean = false; // Comença com a false fins que es confirmi

  imageUrl: string | ArrayBuffer | null = null; // Tipus més específic per a Data URL
  imageFile: File | null = null;
  uploadProgress: number | undefined;
  uploadSub: Subscription | undefined;

  constructor(
    private drinkingDataService: DrinkingDataService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.drinkData.date = this.formatDate(new Date()); // Estableix data actual
    this.updateDayOfWeek();
    this.getCurrentLocation(); // Intenta obtenir GPS
    this.loadData(); // Carrega historial

    // Estableix valors inicials basats en la selecció per defecte (ex: Cervesa)
    if (this.selectedDrink.name !== 'Selecciona' && this.selectedDrink.name !== 'Manual') {
        this.drinkData.drink = this.selectedDrink.name;
        this.drinkData.quantity = this.selectedDrink.quantity; // Quantitat inicial per 1 unitat
    } else if (this.selectedDrink.name === 'Manual') {
        this.manualQuantity = true;
        this.drinkData.quantity = this.manualQuantityValue; // Quantitat inicial manual
    } else {
        this.drinkData.quantity = 0; // Si és 'Selecciona'
    }
    this.drinkData.num_drinks = 1; // Sempre comença amb 1 unitat
    this.updateTotalPrice(); // Calcula preu inicial (probablement 0)
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); // Usa l'objecte inicialitzat
    this.uploadSub?.unsubscribe(); // El ? és segur aquí
  }

  onDrinkQuantityChange(event: any) {
    const selectedName = event.target.value;
    this.selectedDrink = this.drinks.find(d => d.name === selectedName) || this.drinks[0];
    console.log('Selected drink changed:', this.selectedDrink);

    this.manualQuantity = this.selectedDrink.name === 'Manual';

    if (!this.manualQuantity && this.selectedDrink.name !== 'Selecciona') {
      // Si no és manual ni 'Selecciona', actualitza el nom de la beguda si estava buit o era diferent
      if (!this.drinkData.drink || this.drinks.some(d => d.name === this.drinkData.drink && d.name !== this.selectedDrink.name)) {
           this.drinkData.drink = this.selectedDrink.name;
      }
    } else if (this.manualQuantity) {
      // Si es canvia a manual, potser mantenir el nom si ja hi havia un? O netejar-lo? Depèn del que vulguis
      // this.drinkData.drink = ''; // Opció: Netejar nom si es passa a manual
    }

    // Sempre actualitza quantitat i preu després de canviar selecció
    this.updateQuantity();
  }

  onNumDrinksChange(newValue: number | string) {
    const num = Number(newValue); // Converteix a número
    if (Number.isInteger(num) && num > 0) {
      this.drinkData.num_drinks = num;
       console.log('Num drinks changed:', this.drinkData.num_drinks);
      this.updateQuantity(); // Recalcula quantitat i preu
    } else {
      // Opcional: resetejar a 1 si el valor no és vàlid?
      // this.drinkData.num_drinks = 1;
      // this.updateQuantity();
    }
  }

  // Actualitza la quantitat total (en litres) i després el preu total
  updateQuantity() {
    const numDrinks = Number(this.drinkData.num_drinks) || 1; // Mínim 1

    if (this.manualQuantity) {
        const manualQty = Number(this.manualQuantityValue) || 0;
        this.drinkData.quantity = parseFloat((manualQty * numDrinks).toFixed(2));
        console.log(`Quantity updated (Manual): ${manualQty} L/unit * ${numDrinks} units = ${this.drinkData.quantity} L`);
    } else if (this.selectedDrink.name !== 'Selecciona') {
        const drinkQty = Number(this.selectedDrink.quantity) || 0;
        this.drinkData.quantity = parseFloat((drinkQty * numDrinks).toFixed(2));
         console.log(`Quantity updated (Selected: ${this.selectedDrink.name}): ${drinkQty} L/unit * ${numDrinks} units = ${this.drinkData.quantity} L`);
    } else {
        this.drinkData.quantity = 0; // Si és 'Selecciona'
        console.log(`Quantity updated (Selecciona): 0 L`);
    }

    // Sempre recalcula el preu total després d'actualitzar la quantitat
    this.updateTotalPrice();
  }

  // S'activa quan canvia el contingut de l'input de preu
  onPriceChange(newValue: number | string) {
     console.log('Price input changed:', newValue);
    // ngModel ja ha actualitzat this.drinkData.price
    // Només necessitem recalcular el total
    this.updateTotalPrice();
  }

  // Quan canvia el text de l'input de beguda (per suggeriments o manual)
  onDrinkInputChange(newValue: string) {
    this.drinkData.drink = newValue; // Actualitza el model directament
    console.log('Drink input changed:', newValue);
    const foundDrink = this.drinks.find(drink => drink.name.toLowerCase() === newValue.toLowerCase());

    // Si el text coincideix amb una beguda predefinida, actualitza la selecció
    // Això podria ser confús si l'usuari vol escriure "Cervesa Especial" i no només "Cervesa"
    // Potser només vols actualitzar si l'input estava buit abans? O no fer res aquí?
    // if (foundDrink && foundDrink.name !== this.selectedDrink.name) {
    //   this.selectedDrink = foundDrink;
    //   this.manualQuantity = this.selectedDrink.name === 'Manual';
    //   console.log('Matched predefined drink:', this.selectedDrink.name);
    //   this.updateQuantity(); // Recalcula si la selecció canvia
    // }

    // Filtra suggeriments mentre s'escriu
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
          // Opcional: Mostrar alerta a l'usuari
          // this.alertService.showAlert('No s\'ha pogut obtenir la ubicació GPS.', 'warning');
        },
        {
          enableHighAccuracy: false, // Pot ser true per més precisió, però consumeix més
          timeout: 8000, // Augmenta una mica el timeout
          maximumAge: 60000 // Permet usar una posició en cache de fins a 1 minut
        }
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
      ).slice(0, 5); // Limita a 5 suggeriments
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
        // Elimina duplicats i limita
        .filter((value, index, self) => self.indexOf(value) === index)
        .slice(0, 5);
    } else {
        this.drinkSuggestions = [];
    }
  }


  loadData() {
    // Combina subscripcions per gestionar-les juntes
    this.subscription.add(this.drinkingDataService.getLastLocations().subscribe(
      locations => {
        this.lastLocations = locations;
        console.log('Last locations loaded:', locations);
      },
      error => console.error('Error loading last locations:', error)
    ));

    this.subscription.add(this.drinkingDataService.getLastDrinks().subscribe(
      drinks => {
        this.lastDrinks = drinks;
        console.log('Last drinks loaded:', drinks);
      },
      error => console.error('Error loading last drinks:', error)
    ));
  }

  getDayOfWeek(date: Date): number {
    let day = date.getDay(); // 0 = Diumenge, 1 = Dilluns, ..., 6 = Dissabte
    return day === 0 ? 7 : day; // Converteix Diumenge a 7
  }

  updateDayOfWeek() {
    if (this.drinkData.date) {
      // Afegeix 'T00:00:00' per evitar problemes de zona horària al crear Date
      const date = new Date(this.drinkData.date + 'T00:00:00');
      if (!isNaN(date.getTime())) { // Comprova si la data és vàlida
          this.drinkData.day_of_week = this.getDayOfWeek(date);
          console.log('Day of week updated:', this.drinkData.day_of_week);
      } else {
          console.error('Invalid date format for day of week calculation:', this.drinkData.date);
          this.drinkData.day_of_week = 0; // O un valor per defecte
      }
    }
  }

  // S'activa quan canvia l'input de quantitat manual
  onQuantityChange(newValue: any) {
    // Permet comes com a separador decimal
    if (typeof newValue === 'string') {
      newValue = newValue.replace(',', '.');
    }

    const parsedValue = parseFloat(newValue);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      this.manualQuantityValue = parseFloat(parsedValue.toFixed(2)); // Guarda amb 2 decimals
      console.log('Manual quantity value changed:', this.manualQuantityValue);
      this.updateQuantity(); // Recalcula la quantitat total i el preu
    } else {
        // Opcional: gestionar valor invàlid (p.ex., posar 0 o mantenir l'anterior)
        // this.manualQuantityValue = 0;
        // this.updateQuantity();
    }
  }

  // S'activa quan canvia el radio button del tipus de preu
  onPriceTypeChange() {
    // El valor de this.priceindividual ja s'ha actualitzat per [(ngModel)]
    console.log('Price type changed. Is individual:', this.priceindividual);
    this.updateTotalPrice(); // Només cal recalcular el preu total
  }

  // Calcula el preu total basant-se en el preu introduït i el tipus
  updateTotalPrice() {
    // Assegura't que els valors són numèrics abans de calcular
    const price = Number(this.drinkData.price) || 0;
    const numDrinks = Number(this.drinkData.num_drinks) || 1; // Assumeix 1 si no és vàlid o és 0

    if (this.priceindividual) {
      // Si el preu és per unitat: Preu per unitat * Nombre d'unitats
      this.totalPrice = parseFloat((price * numDrinks).toFixed(2));
    } else {
      // Si el preu introduït ja és el total
      this.totalPrice = parseFloat(price.toFixed(2)); // Només assegura el format
    }
    console.log(`Total price updated. Type: ${this.priceindividual ? 'Individual' : 'Total'}. Input Price: ${price}, Num Drinks: ${numDrinks}. Calculated Total: ${this.totalPrice}`);
  }

  // --- Funcions d'Imatge ---
  openCamera() {
    // Comprova si estem en un entorn segur (HTTPS o localhost)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.alertService.showAlert('La funcionalitat de càmera només està disponible en contexts segurs (HTTPS) o localhost.', 'warning', 7000);
        console.error('getUserMedia not supported or context insecure.');
        return;
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }) // Prioritza càmera trasera
        .then(stream => {
          // Gestionar stream (p. ex., mostrar en un element <video> i capturar frame)
          // Aquesta part requereix més lògica per mostrar preview i capturar
          console.log("Camera stream obtained:", stream);
          this.alertService.showAlert('Accés a càmera concedit. Implementació de captura pendent.', 'info');
          // Aquí hauries de crear un element video, mostrar el stream,
          // afegir un botó per capturar, dibuixar en canvas i obtenir el File.
          // Simplificació: per ara només log i alerta.
          // Hauries de tancar el stream quan ja no es necessiti: stream.getTracks().forEach(track => track.stop());
        })
        .catch(err => {
          console.error("Error accessing camera:", err);
          let message = 'No s\'ha pogut accedir a la càmera.';
          if (err.name === 'NotAllowedError') {
            message = 'Permís per accedir a la càmera denegat.';
          } else if (err.name === 'NotFoundError') {
            message = 'No s\'ha trobat cap càmera compatible.';
          }
          this.alertService.showAlert(message, 'danger', 5000);
        });
    }


  // Funció auxiliar per convertir Data URL a File (necessària si uses canvas per captura/modificació)
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

  // S'activa quan es selecciona un fitxer des de la galeria (a través de l'input ocult)
  onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;

    if (fileList && fileList[0]) {
      const file = fileList[0];
       console.log('File selected from gallery:', file.name, file.type);
      // Comprova tipus MIME bàsic
      if (!file.type.startsWith('image/')) {
           this.alertService.showAlert('Si us plau, selecciona un fitxer d\'imatge.', 'warning');
           this.imageFile = null;
           this.imageUrl = null;
           return;
      }
      this.imageFile = file;
      this.loadImagePreview(file); // Carrega previsualització
    }
    // Reseteja el valor de l'input per permetre seleccionar el mateix fitxer de nou
    element.value = '';
  }

  // Obre el selector de fitxers del dispositiu
  openGallery() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // Accepta qualsevol tipus d'imatge
    input.onchange = (event: Event) => this.onFileSelected(event); // Reutilitza onFileSelected
    input.click();
  }


  // Carrega la imatge seleccionada per a previsualització
  loadImagePreview(file: File) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      // Comprova si el resultat existeix i és string (Data URL)
      if (e.target?.result && typeof e.target.result === 'string') {
           this.imageUrl = e.target.result;
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
    reader.readAsDataURL(file); // Llegeix com a Data URL
  }

  // --- Funcions d'Enviament ---

  // Funció principal cridada pel botó 'Afegir' (via modal) o directament
  async onSubmit() {
    console.log('onSubmit triggered. Preparing data...');
    await this.submitData();
  }

  async submitData() {
    // Validacions bàsiques abans d'enviar
    if (!this.drinkData.date) {
        this.alertService.showAlert('La data és obligatòria.', 'warning'); return;
    }
    if (!this.drinkData.location) {
        this.alertService.showAlert('El lloc és obligatori.', 'warning'); return;
    }
     if (!this.drinkData.drink) {
        this.alertService.showAlert('La beguda és obligatòria.', 'warning'); return;
    }
    if (this.drinkData.quantity <= 0) {
        this.alertService.showAlert('La quantitat total ha de ser superior a 0.', 'warning'); return;
    }
     if (this.drinkData.num_drinks <= 0) {
        this.alertService.showAlert('El nombre d\'unitats ha de ser 1 o més.', 'warning'); return;
    }
    if (this.drinkData.price < 0) {
        this.alertService.showAlert('El preu no pot ser negatiu.', 'warning'); return;
    }
     // Si el preu és 0, podria ser una alerta opcional?
     // if (this.totalPrice === 0) {
     //    this.alertService.showAlert('El preu total calculat és 0. Segur que vols continuar?', 'info');
     // }


    console.log('Data validation passed. Preparing FormData...');

    // Formata noms propis (primera lletra majúscula)
    this.drinkData.location = this.capitalizeFirstLetter(this.drinkData.location);
    this.drinkData.drink = this.capitalizeFirstLetter(this.drinkData.drink);

    let fileToUpload = this.imageFile;

    // Processa la imatge abans de pujar si n'hi ha una
    if (this.imageFile) {
      try {
        console.log('Modifying image before upload...');
        fileToUpload = await this.modifyImage(this.imageFile);
        console.log('Image modified successfully:', fileToUpload.name, fileToUpload.size);
      } catch (error) {
        console.error('Error modifying image:', error);
        this.alertService.showAlert('Error al processar la imatge. S\'enviarà sense.', 'warning');
        fileToUpload = null; // No envia la imatge si falla el processament
      }
    }

    // Crea FormData
    const formData = new FormData();
    formData.append("date", this.drinkData.date);
    formData.append("day_of_week", String(this.drinkData.day_of_week));
    formData.append("location", this.drinkData.location);
    formData.append("latitude", String(this.drinkData.latitude || 0)); // Envia 0 si no hi ha GPS
    formData.append("longitude", String(this.drinkData.longitude || 0));
    formData.append("drink", this.drinkData.drink);
    formData.append("quantity", String(this.drinkData.quantity)); // Quantitat total en L
    formData.append("num_drinks", String(this.drinkData.num_drinks)); // Nombre d'unitats
    formData.append("price", String(this.totalPrice)); // Envia el PREU TOTAL CALCULAT
    formData.append("price_is_individual", String(this.priceindividual)); // Envia si el preu era individual o total
    formData.append("price_input", String(this.drinkData.price)); // Envia el preu que va introduir l'usuari
    formData.append("others", this.drinkData.others || ''); // Envia string buit si és null/undefined

    // Afegeix la imatge (processada o original si no hi ha processament)
    if (fileToUpload) {
      formData.append("image", fileToUpload, fileToUpload.name);
       console.log('Appending image to FormData');
    } else {
       console.log('No image to append.');
    }

    console.log('FormData prepared. Starting upload...');
    this.upload(formData);
  }

  // Funció per capitalitzar la primera lletra
  capitalizeFirstLetter(text: string): string {
      if (!text) return '';
      return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Gestiona la pujada amb el servei
  upload(formData: FormData) {
    this.uploadProgress = 0; // Comença la barra de progrés

    this.uploadSub = this.drinkingDataService.addDrinkData(formData)
      .pipe(
        // Finalize s'executa tant si hi ha èxit com error, útil per netejar
        finalize(() => {
          console.log('Upload process finalized (success or error).');
          this.resetUploadState(); // Neteja l'estat de la pujada
        })
      )
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
            this.loadData(); // Recarrega dades (historial)
          }
        },
        error: (error) => {
          console.error('Upload failed:', error);
          // Intenta obtenir un missatge d'error més específic del backend si és possible
          const errorMsg = error.error?.message || error.message || 'Error desconegut al servidor.';
          this.alertService.showAlert(`Error en afegir el consum: ${errorMsg}`, 'danger', 7000);
          // No resetejar el formulari en cas d'error, perquè l'usuari pugui corregir
        }
      });
  }

  // Cancela la subscripció de pujada actual
  cancelUpload() {
    if (this.uploadSub) {
      console.log('Cancelling upload...');
      this.uploadSub.unsubscribe();
      this.resetUploadState();
      this.alertService.showAlert('Pujada cancel·lada.', 'info');
    }
  }

  // Neteja només l'estat relacionat amb la pujada
  resetUploadState() {
    console.log('Resetting upload state.');
    this.uploadProgress = undefined;
    this.uploadSub = undefined; // Allibera la subscripció anterior
  }

  // Reseteja tot el formulari a l'estat inicial
  resetForm() {
    console.log('Resetting form...');
    // Guarda la data actual abans de resetejar
    const currentDate = this.formatDate(new Date());

    this.drinkData = {
        user_id: 0, // Mantenir o obtenir de nou si cal
        date: currentDate, // Restableix a la data actual
        day_of_week: this.getDayOfWeek(new Date(currentDate + 'T00:00:00')), // Recalcula dia
        location: '',
        latitude: this.drinkData.latitude, // Mantenir la última posició GPS obtinguda?
        longitude: this.drinkData.longitude, // O cridar getCurrentLocation() de nou?
        drink: '',
        quantity: 0.33, // Restablir valor inicial per quantitat
        num_drinks: 1,
        others: '',
        price: 0
    };

    // Restableix estats auxiliars
    this.selectedDrink = this.drinks.find(d => d.name === 'Cervesa') || this.drinks[0]; // Torna a la selecció per defecte
    this.manualQuantity = false;
    this.manualQuantityValue = 0.33;
    this.priceindividual = true; // Torna a preu individual per defecte
    this.totalPrice = 0; // Reseteja preu total

    // Neteja imatge
    this.imageUrl = null;
    this.imageFile = null;

    // Neteja suggeriments
    this.locationSuggestions = [];
    this.drinkSuggestions = [];

    // Neteja estat de pujada per si de cas
    this.resetUploadState();

    // Intenta obtenir GPS de nou si no n'hi havia
    if (!this.hasGpsData) {
      this.getCurrentLocation();
    }

    // Actualitza els càlculs inicials
    this.updateQuantity(); // Això cridarà updateTotalPrice

    console.log('Form reset complete.');
    // Opcional: Scroll to top
    // window.scrollTo(0, 0);
  }


  // Processa la imatge: redimensiona i comprimeix
  modifyImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (!event.target?.result || typeof event.target.result !== 'string') {
            return reject(new Error('Error reading file for modification.'));
        }

        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 1024; // Ajusta segons necessitats
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

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
            return reject(new Error('Could not get canvas context.'));
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Converteix a Blob amb compressió JPEG (qualitat 0.8 = 80%)
          canvas.toBlob((blob) => {
            if (blob) {
              // Crea un nou File a partir del Blob
              const newFileName = file.name.replace(/\.\w+$/, '.jpg'); // Canvia extensió a jpg
              const newFile = new File([blob], newFileName, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(newFile);
            } else {
              reject(new Error('Error converting canvas to Blob.'));
            }
          }, 'image/jpeg', 0.8); // Tipus MIME i qualitat (0.0 - 1.0)
        };
        img.onerror = (error) => reject(new Error('Error loading image for modification.'));
        img.src = event.target.result; // Assigna el Data URL llegit a l'objecte Image
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file); // Comença la lectura del fitxer
    });
  }
}
