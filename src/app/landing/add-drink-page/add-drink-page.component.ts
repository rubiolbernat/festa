import { environment } from './../../../environments/environment';
import { AlertService } from './../../core/services/alert/alert.service';
// Imports afegits/necessaris
import { Component, inject, signal, OnDestroy } from '@angular/core'; // Afegit OnDestroy per la subscripció
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DrinkData } from '../../core/models/v2_drink-data.model';
import { Router } from '@angular/router';
import { HttpEventType, HttpEvent } from '@angular/common/http'; // Import necessari
import { Subscription } from 'rxjs'; // Import necessari
import { finalize } from 'rxjs/operators'; // Import necessari
import { DrinkingDataService } from '../../core/services/drinking-data/drinking-data.service';


// Form Children
import { DateSelectionComponent, DateSelectionOutput } from './components/date-selection/date-selection.component';
import { LocationSelectionComponent, LocationSelectionOutput } from './components/location-selection/location-selection.component';
import { MediaInputComponent } from './components/media-input/media-input.component';
import { DrinkQuantityPriceComponent, QuantityPriceDrinkOutput } from './components/quantity-price/quantity-price.component';
import { CommentariesComponent } from './components/commentaries/commentaries.component';

@Component({
  selector: 'app-add-drink-page',
  // standalone: true, // Considera fer-lo standalone si és un component nou
  imports: [FormsModule, CommonModule, DateSelectionComponent, LocationSelectionComponent, MediaInputComponent, DrinkQuantityPriceComponent, CommentariesComponent],
  templateUrl: './add-drink-page.component.html',
  styleUrls: ['./add-drink-page.component.css'] // Corregit a styleUrls
})
export class AddDrinkPageComponent implements OnDestroy { // Implementa OnDestroy

  private alertService = inject(AlertService);
  // --- Injecta el servei necessari ---
  private drinkDataService = inject(DrinkingDataService); // *** Assegura't que aquest servei existeix i està proveït ***
  private router = inject(Router); // Descomenta si el necessites

  drinkEntry = signal<DrinkData>({
    // ... (la teva definició inicial del signal) ...
    user_id: 0, // Assegura't que aquest ID s'estableix correctament abans de cridar onSubmit
    date: new Date(),
    day_of_week: 0,
    location: '',
    latitude: 0,
    longitude: 0,
    drink: '',
    quantity: 0,
    others: '',
    price: 0,
    num_drinks: 0,
    event_id: null,
    storie: {
      user_id: 0,
      drink_id: 0,
      imageUrl: '',
      uploadedAt: new Date().toISOString(),
      expiresAt: new Date(new Date().getTime() + 60 * 60 * 1000 * environment.storyExpirationHours).toISOString(),
      votes: 0,
      isSaved: false
    }
  });

  selectedProcessedFile: File | null = null; // Variable original per al fitxer
  parentPreviewUrl: string | null = null; // Variable original per a la preview

  // --- Declaracions necessàries per a upload ---
  uploadProgress: number | null = null;
  private uploadSub: Subscription | null = null;
  isSubmitting = false; // Per evitar doble click

  // --- Implementació de la funció auxiliar que faltava ---
  private capitalizeFirstLetter(string: string): string {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  // --- Gestors d'events dels fills (el teu codi original) ---
  onDateSelected(info: DateSelectionOutput) {
    this.drinkEntry.update(value => ({
      ...value,
      date: info.selectedDate || new Date(),
      day_of_week: info.dayOfWeek ?? (info.selectedDate || new Date()).getDay(), // Calcula el dia si no ve
      event_id: info.eventId !== undefined ? info.eventId : null
    }));
  }

  onLocationSelected(location: LocationSelectionOutput) {
    this.drinkEntry.update(value => ({
      ...value,
      location: location.selectedLocation || '',
      latitude: location.latitude ?? 0, // Utilitza ?? per valors null/undefined
      longitude: location.longitude ?? 0
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
      price: info.price, // Preu introduït
      num_drinks: info.units,
      drink: info.name
    }));
  }

  // Aquesta funció sembla redundant amb onCommentariesChange, pots eliminar una
  // handleNotes(note: string) {
  //   this.drinkEntry.update(value => ({
  //     ...value,
  //     others: note
  //   }))
  // }

  handleMediaOutput(file: File | null): void {
    // --- Gestió de la URL d'Objecte (el teu codi original) ---
    if (this.parentPreviewUrl) {
      URL.revokeObjectURL(this.parentPreviewUrl);
      console.log('Revoked previous object URL:', this.parentPreviewUrl);
      this.parentPreviewUrl = null;
    }
    this.selectedProcessedFile = file; // Assigna a la variable de la classe
    if (this.selectedProcessedFile) {
      this.parentPreviewUrl = URL.createObjectURL(this.selectedProcessedFile);
      console.log('Created new object URL:', this.parentPreviewUrl);
    } else {
      this.parentPreviewUrl = null;
    }
  }

  // --- Funció onSubmit CORREGIDA ---
  // --- Funció onSubmit CORREGIDA (per enviar com a "image") ---
  async onSubmit() {
    if (this.isSubmitting) return; // Evita enviaments múltiples

    console.log('onSubmit triggered. Preparing data...');
    this.isSubmitting = true; // Marca com enviant

    const currentData = this.drinkEntry(); // Obtenir les dades actuals del signal

    // --- Validacions bàsiques usant currentData ---
    if (!currentData.date) { this.alertService.showAlert('La data és obligatòria.', 'warning'); this.isSubmitting = false; return; }
    const dayOfWeek = currentData.date.getDay(); // 0 = Diumenge, ..., 6 = Dissabte
    if (!currentData.location || currentData.location.trim() === '') { this.alertService.showAlert('El lloc és obligatori.', 'warning'); this.isSubmitting = false; return; }
    if (!currentData.drink || currentData.drink.trim() === '') { this.alertService.showAlert('La beguda és obligatòria.', 'warning'); this.isSubmitting = false; return; }
    if (currentData.quantity <= 0) { this.alertService.showAlert('La quantitat ha de ser superior a 0.', 'warning'); this.isSubmitting = false; return; }
    if (currentData.num_drinks <= 0) { this.alertService.showAlert('El nombre d\'unitats ha de ser 1 o més.', 'warning'); this.isSubmitting = false; return; }
    if (currentData.price < 0) { this.alertService.showAlert('El preu no pot ser negatiu.', 'warning'); this.isSubmitting = false; return; }
    /*if (!currentData.user_id || currentData.user_id === 0) {
      this.alertService.showAlert('Error: No s\'ha pogut identificar l\'usuari.', 'danger');
      this.isSubmitting = false;
      return;
    }*/

    console.log('Data validation passed. Building FormData...');

    const fileToUpload: File | null = this.selectedProcessedFile; // Utilitza el fitxer guardat
    const formData = new FormData();

    // --- Afegeix camps usant currentData ---
    formData.append("user_id", String(currentData.user_id));
    formData.append("date", currentData.date.toISOString().split('T')[0]);
    formData.append("day_of_week", String(dayOfWeek));
    formData.append("location", this.capitalizeFirstLetter(currentData.location.trim()));
    formData.append("drink", this.capitalizeFirstLetter(currentData.drink.trim()));
    formData.append("quantity", String(currentData.quantity));
    formData.append("num_drinks", String(currentData.num_drinks));
    formData.append("price", String(currentData.price));
    formData.append("others", currentData.others?.trim() || '');

    if (currentData.latitude !== 0 || currentData.longitude !== 0) {
      formData.append("latitude", String(currentData.latitude));
      formData.append("longitude", String(currentData.longitude));
    }

    if (currentData.event_id !== null && currentData.event_id !== undefined) {
      formData.append("event_id", String(currentData.event_id));
      console.log(`Appending event_id: ${currentData.event_id}`);
    } else {
      console.log('No event_id selected to append.');
      // formData.append("event_id", ''); // Descomenta si cal enviar un valor buit
    }

    // Afegeix la imatge si existeix
    if (fileToUpload) {
      // ***** CANVI CLAU AQUÍ *****
      // Canvia la clau de "storie_image" a "image" per coincidir amb el PHP ($_FILES["image"])
      formData.append("image", fileToUpload, fileToUpload.name); // <-- CLAU CANVIADA A "image"
      console.log('Appending processed image as "image" to FormData:', fileToUpload.name); // Log actualitzat
    } else {
      console.log('No image file to append.');
    }

    console.log('FormData prepared. Starting upload...');
    this.upload(formData); // Crida la funció upload (aquesta no necessita canvis)
  }

  // --- Funció upload (NO necessita canvis) ---
  upload(formData: FormData) {
    this.uploadProgress = 0; // Inicia el progrés

    this.uploadSub?.unsubscribe();

    this.uploadSub = this.drinkDataService.addDrinkData(formData)
      .pipe(finalize(() => {
        console.log('Upload process finalized (success or error).');
        this.isSubmitting = false;
      }))
      .subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            if (event.total) {
              this.uploadProgress = Math.round(100 * (event.loaded / event.total));
              console.log(`Upload Progress: ${this.uploadProgress}%`);
            }
          } else if (event.type === HttpEventType.Response) {
            console.log('Upload successful. Server response:', event.body);
            // Comprova si la resposta del backend ara diu image_uploaded: true
            if (event.body?.image_uploaded === true) {
              console.log("Backend confirma que la imatge s'ha rebut correctament!");
            } else {
              console.warn("Backend indica que la imatge NO s'ha rebut o processat.");
            }
            this.alertService.showAlert('Consum afegit correctament!', 'success', 3000);
            this.resetForm();
          }
        },
        error: (error) => {
          console.error('Upload failed:', error);
          this.uploadProgress = null;
          const errorMsg = error.error?.message || error.error?.error || error.message || 'Error desconegut al servidor.';
          this.alertService.showAlert(`Error en afegir el consum: ${errorMsg}`, 'danger', 7000);
        }
      });
  }

  // --- La teva funció resetForm original (està buida, implementa-la si cal) ---
  resetForm() {
    console.log("Resetting form");
  }

  // --- Gestió de la desubscripció ---
  ngOnDestroy(): void {
    this.uploadSub?.unsubscribe();
    // Neteja la URL d'objecte si encara existeix
    if (this.parentPreviewUrl) {
      URL.revokeObjectURL(this.parentPreviewUrl);
    }
  }
}
