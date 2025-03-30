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
    user_id: 0,
    date: '',
    day_of_week: 0,
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
    { name: 'Tubo', quantity: 0.40, descr: '40 cl' },
    { name: 'Quinto', quantity: 0.20, descr: '20 cl' },
    { name: 'Xupito', quantity: 0.04, descr: '4 cl' },
    { name: 'Canya', quantity: 0.25, descr: '25 cl' },
    { name: 'Gerra', quantity: 1, descr: '1 l' },
    { name: 'Sangria', quantity: 1.5, descr: '1.5 l' },
    { name: 'Vi', quantity: 0.15, descr: '15 cl (una copa)' }
  ];

  selectedDrink = this.drinks[0];
  priceindividual: boolean = true;
  manualQuantity: boolean = false;
  manualQuantityValue: number = 0.33;

  lastLocations: string[] = [];
  lastDrinks: string[] = [];
  locationSuggestions: string[] = [];
  drinkSuggestions: string[] = [];
  private subscription: Subscription | undefined;
  hasGpsData: boolean = true;

  imageUrl: any;
  imageFile: File | null = null;
  uploadProgress: number | undefined;
  uploadSub: Subscription | undefined;

  constructor(
    private drinkingDataService: DrinkingDataService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.getCurrentLocation();
    this.drinkData.date = this.formatDate(new Date());
    this.updateDayOfWeek();
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.uploadSub) {
      this.uploadSub.unsubscribe();
    }
  }

  onDrinkQuantityChange(event: any) {
    this.selectedDrink = this.drinks.find(d => d.name === event.target.value) || this.drinks[0];

    if (this.selectedDrink.name !== 'Manual' && this.selectedDrink.name !== 'Selecciona') {
      if (this.drinkData.drink.length == 0) {
        this.drinkData.drink = this.selectedDrink.name;
      }
    }

    this.manualQuantity = this.selectedDrink.name === 'Manual';
    this.updateQuantity();
  }

  onNumDrinksChange(newValue: number) {
    if (Number.isInteger(newValue) && newValue > 0) {
      this.drinkData.num_drinks = newValue;
      this.updateQuantity();
    }
  }

  updateQuantity() {
    if (this.manualQuantity) {
      this.drinkData.quantity = parseFloat((this.manualQuantityValue * this.drinkData.num_drinks).toFixed(2));
    } else {
      this.drinkData.quantity = parseFloat((this.selectedDrink.quantity * this.drinkData.num_drinks).toFixed(2));
    }
  }

  onPriceChange(newValue: number) {
    if (typeof newValue === 'number') {
      this.drinkData.price = newValue;
    }
  }

  get totalPrice(): number {
    if (this.priceindividual) {
      return this.drinkData.price;
    } else {
      return this.drinkData.num_drinks * this.drinkData.price;
    }
  }

  onDrinkInputChange(newValue: string) {
    const foundDrink = this.drinks.find(drink => drink.name === newValue);
    if (foundDrink) {
      this.selectedDrink = foundDrink;
      this.drinkData.drink = this.selectedDrink.name;
    } else {
      console.log("No s'ha trobat la beguda:", newValue);
    }
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
        },
        (error) => {
          console.error('Error al obtenir la ubicació:', error);
          this.hasGpsData = false;
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.error('Geolocalització no suportada pel navegador.');
      this.hasGpsData = false;
    }
  }

  filterLocations() {
    this.locationSuggestions = this.lastLocations.filter(location =>
      location.toLowerCase().startsWith(this.drinkData.location.toLowerCase())
    );
  }

  filterDrinks() {
    this.drinkSuggestions = this.lastDrinks.filter(drink =>
      drink.toLowerCase().startsWith(this.drinkData.drink.toLowerCase())
    );
  }

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
  }

  getDayOfWeek(date: Date): number {
    let day = date.getDay();
    if (day === 0) {
      day = 7;
    }
    return day;
  }

  updateDayOfWeek() {
    const date = new Date(this.drinkData.date);
    this.drinkData.day_of_week = this.getDayOfWeek(date);
  }

  onQuantityChange(newValue: any) {
    if (typeof newValue === 'string') {
      newValue = newValue.replace(',', '.');
    }

    const parsedValue = parseFloat(newValue);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      this.manualQuantityValue = parseFloat(parsedValue.toFixed(2));
      this.updateQuantity();
    }
  }

  openCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context?.drawImage(video, 0, 0, canvas.width, canvas.height);

            this.imageUrl = canvas.toDataURL('image/jpeg');
            this.imageFile = this.dataURLtoFile(this.imageUrl, 'cameraImage.jpeg');

          });
        })
        .catch(err => {
          console.error("Error accessing camera:", err);
          this.alertService.showAlert('No s\'ha pogut accedir a la càmera', 'danger', 5000);
        });
    } else {
      this.alertService.showAlert('La càmera no està disponible en aquest navegador', 'warning', 5000);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      this.loadImage(file);
    }
  }

  openGallery() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (event: any) => {
      const file = (event.target as HTMLInputElement).files?.[0];

      if (file) {
        this.imageFile = file;
        this.loadImage(file);
      }
    };

    input.click();
  }

  dataURLtoFile(dataurl: any, filename: any) {
    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  // Nova funció per carregar i processar la imatge
  loadImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async onSubmit() {
    await this.submitData();
  }

  async submitData() {
    if (this.drinkData.price < 0 || !this.drinkData.quantity) {
      this.alertService.showAlert('Si us plau, emplena la quantitat i el preu', 'warning', 5000);
      return;
    }

    this.drinkData.location = String(this.drinkData.location).charAt(0).toUpperCase() + String(this.drinkData.location).slice(1);
    this.drinkData.drink = String(this.drinkData.drink).charAt(0).toUpperCase() + String(this.drinkData.drink).slice(1);

    let fileToUpload = this.imageFile;

    if (this.imageFile) {
      fileToUpload = await this.modifyImage(this.imageFile);
    }
    const formData = new FormData();
    formData.append("date", this.drinkData.date);
    formData.append("day_of_week", String(this.drinkData.day_of_week));
    formData.append("location", this.drinkData.location);
    formData.append("latitude", String(this.drinkData.latitude));
    formData.append("longitude", String(this.drinkData.longitude));
    formData.append("drink", this.drinkData.drink);
    formData.append("quantity", String(this.drinkData.quantity));
    formData.append("others", String(this.drinkData.others));
    formData.append("price", String(this.drinkData.price));
    formData.append("num_drinks", String(this.drinkData.num_drinks));

    if (fileToUpload) {
      formData.append("image", fileToUpload, fileToUpload.name);
    }

    this.upload(formData);
  }
  upload(formData: FormData) {
    this.uploadSub = this.drinkingDataService.addDrinkData(formData)
      .pipe(
        finalize(() => this.reset())
      )
      .subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * (event.loaded / (event.total || 1)));
        } else if (event.type === HttpEventType.Response) {
          console.log('Resposta del backend:', event.body);
          this.alertService.showAlert('Dades enviades correctament', 'success', 3000);
          this.resetForm();
          this.loadData();
        }
      },
        error => {
          console.error('Error al enviar les dades:', error);
          this.alertService.showAlert('Error al enviar les dades', 'danger', 5000);
        }
      );
  }

  cancelUpload() {
    this.uploadSub?.unsubscribe();
    this.reset();
  }

  reset() {
    this.uploadProgress = undefined;
    this.uploadSub = undefined;
  }

  resetForm() {
    this.drinkData = {
      user_id: 0,
      date: '',
      day_of_week: 0,
      location: '',
      latitude: 0,
      longitude: 0,
      drink: '',
      quantity: 0.33,
      others: '',
      price: 0,
      num_drinks: 1
    };
    this.imageUrl = null;
    this.imageFile = null;
    this.locationSuggestions = [];
    this.drinkSuggestions = [];
  }
  modifyImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          // Redimensionar mantenint la proporció
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

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Comprimir la imatge (qualitat 0.7 = 70%)
          canvas.toBlob((blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(newFile);
            } else {
              reject(new Error('Error en comprimir la imatge'));
            }
          }, 'image/jpeg', 0.7);
        };
        img.src = event.target.result;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}
