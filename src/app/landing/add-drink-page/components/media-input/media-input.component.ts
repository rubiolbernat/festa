import { Component, inject, ViewChild, ElementRef, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../core/services/alert/alert.service'; // Ajusta ruta

// Constants per a la configuració de la imatge
const MAX_WIDTH = 1280; // Amplada màxima desitjada
const MAX_HEIGHT = 1280; // Alçada màxima desitjada
const MIME_TYPE = "image/jpeg"; // Tipus de sortida (compressió JPEG)
const QUALITY = 0.8; // Qualitat JPEG (0.0 a 1.0)
const MAX_ORIGINAL_SIZE_MB = 15; // Mida màxima original permesa abans d'intentar comprimir
const MAX_PROCESSED_SIZE_MB = 10; // Mida màxima permesa DESPRÉS de la compressió

@Component({
  selector: 'app-media-input',
  imports: [CommonModule],
  templateUrl: './media-input.component.html',
  styleUrls: ['./media-input.component.css'] // O .scss
})
export class MediaInputComponent {

  // --- Serveis Injectats ---
  private alertService = inject(AlertService);

  // --- Output Modern (Signal-based) ---
  // Emet el fitxer processat (File) o null si s'esborra o hi ha error
  media = output<File | null>();

  // --- Referències a Elements ---
  @ViewChild('galleryInput') private galleryInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cameraInput') private cameraInput!: ElementRef<HTMLInputElement>;

  // --- Estat Intern del Component ---
  imageUrl: string | ArrayBuffer | null = null;
  isProcessing: boolean = false;
  private currentFile: File | null = null; // Fitxer processat final

  // --- Mètodes Públics (per la plantilla HTML) ---

  openCamera(): void {
    if (this.isProcessing) return;
    this.cameraInput.nativeElement.click();
  }

  openGallery(): void {
    if (this.isProcessing) return;
    this.galleryInput.nativeElement.click();
  }

  /**
   * Gestiona l'event 'change' dels inputs de fitxer.
   * Inicia el flux de validació i processament.
   */
  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0];

    if (file) {
      this.handleImageFile(file);
      // Reseteja l'input per permetre seleccionar el mateix fitxer un altre cop
      element.value = '';
    }
  }

  /**
   * Neteja la selecció actual i reseteja l'estat.
   * Emet 'null' a través de l'output 'media'.
   */
  clearSelection(): void {
    this.imageUrl = null;
    this.currentFile = null;
    this.isProcessing = false;
    this.media.emit(null); // Emet null usant la nova sintaxi
    console.log('Image selection/processing cleared.');
    // No cal resetejar els inputs aquí si ja es fa a onFileSelected
  }

   /**
   * Aquest mètode ara només serveix per cancel·lar la SELECCIÓ/PROCESSAMENT actual.
   * La cancel·lació de la PUJADA real al servidor l'hauria de gestionar el component pare.
   */
   cancelCurrentAction(): void {
    console.log("Cancelling selection/processing...");
    // Aquí podríem afegir lògica per aturar el processament si fos molt llarg,
    // però normalment la compressió/redimensionament és ràpida.
    // La principal acció és netejar l'estat.
    this.clearSelection();
    this.alertService.showAlert('Selecció cancel·lada.', 'info');
  }

  // --- Mètodes Privats (Lògica interna) ---

  /**
   * Orquestra la validació, processament i actualització de l'estat per un fitxer donat.
   */
  private async handleImageFile(file: File): Promise<void> {
    console.log("Original file received:", { name: file.name, type: file.type, size: file.size });

    if (!this.isValidImageType(file)) {
      this.alertService.showAlert('El fitxer seleccionat no és una imatge vàlida (JPEG, PNG, GIF, WEBP).', 'warning');
      return; // No continuïs si no és una imatge
    }

    if (this.isFileSizeExceeded(file, MAX_ORIGINAL_SIZE_MB)) {
      this.alertService.showAlert(`La imatge original supera els ${MAX_ORIGINAL_SIZE_MB}MB. S'intentarà comprimir.`, 'warning');
    }

    this.setProcessingState(true);

    try {
      const processedFile = await this.processImage(file);

      if (!processedFile) {
        // L'error ja s'hauria loggejat dins de processImage
        this.alertService.showAlert('No s\'ha pogut processar la imatge.', 'danger');
        this.clearSelection();
        return;
      }

      console.log("Processed file details:", { name: processedFile.name, type: processedFile.type, size: processedFile.size });

      if (this.isFileSizeExceeded(processedFile, MAX_PROCESSED_SIZE_MB)) {
        this.alertService.showAlert(`La imatge, fins i tot processada, supera el límit final de ${MAX_PROCESSED_SIZE_MB}MB.`, 'danger');
        this.clearSelection(); // Neteja si encara és massa gran
      } else {
        // Èxit! Actualitza l'estat i emet el fitxer
        this.currentFile = processedFile;
        this.loadImagePreview(processedFile); // Carrega preview DESPRÉS de processar
        this.media.emit(this.currentFile); // Emet el fitxer processat!
      }

    } catch (error) {
      console.error("Unexpected error during image handling:", error);
      this.alertService.showAlert('Hi ha hagut un error inesperat processant la imatge.', 'danger');
      this.clearSelection();
    } finally {
      this.setProcessingState(false); // Assegura't que l'estat de processament s'acaba
    }
  }

  /**
   * Canvia l'estat de processament i neteja les dades anteriors si comença.
   */
  private setProcessingState(isProcessing: boolean): void {
     this.isProcessing = isProcessing;
     if (isProcessing) {
        this.imageUrl = null; // Neteja preview mentre es processa
        this.currentFile = null;
        this.media.emit(null); // Notifica que no hi ha fitxer (temporalment)
     }
  }

  /**
   * Comprova si el tipus MIME del fitxer és d'una imatge permesa.
   */
  private isValidImageType(file: File): boolean {
    return file.type.startsWith('image/') &&
           ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
  }

  /**
   * Comprova si la mida del fitxer excedeix un límit donat en MB.
   */
  private isFileSizeExceeded(file: File, maxSizeMB: number): boolean {
    return file.size > maxSizeMB * 1024 * 1024;
  }

  /**
   * Carrega la previsualització d'un fitxer com a Data URL.
   */
  private loadImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.imageUrl = e.target?.result ?? null; // Assigna Data URL a imageUrl
    };
    reader.onerror = (error) => {
      console.error('FileReader error for preview:', error);
      this.imageUrl = null; // No mostris preview si falla la lectura
      this.alertService.showAlert('Error al generar la previsualització.', 'warning');
    };
    reader.readAsDataURL(file);
  }

  /**
   * Processa la imatge: redimensiona i comprimeix usant Canvas.
   * Retorna una Promise que resol amb el nou File (JPEG) o null en cas d'error.
   */
  private processImage(file: File): Promise<File | null> {
    return new Promise((resolve) => {
      const blobURL = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(blobURL); // Important alliberar memòria

        let { width, height } = img;
        const aspectRatio = width / height;

        // Calcula noves dimensions
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (aspectRatio > 1) { // Paisatge o quadrat
             if (width > MAX_WIDTH) {
                width = MAX_WIDTH;
                height = width / aspectRatio;
             }
          } else { // Retrat
             if (height > MAX_HEIGHT) {
                height = MAX_HEIGHT;
                width = height * aspectRatio;
             }
          }
          // Arrodonir per evitar problemes de píxels parcials
          width = Math.round(width);
          height = Math.round(height);
        }

        console.log(`Original dimensions: ${img.width}x${img.height}. Resized dimensions: ${width}x${height}`);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          console.error('Could not get 2D canvas context.');
          return resolve(null);
        }

        // Dibuixa al canvas (això redimensiona)
        ctx.drawImage(img, 0, 0, width, height);

        // Converteix a Blob (això comprimeix amb JPEG)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error('Canvas toBlob resulted in null.');
              return resolve(null);
            }
            // Crea el nou fitxer amb el tipus i nom desitjats
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + '.jpg'; // Canvia extensió a .jpg
            const newFile = new File([blob], newFileName, {
              type: MIME_TYPE,
              lastModified: Date.now(),
            });
            resolve(newFile); // Èxit! Retorna el nou fitxer
          },
          MIME_TYPE, // Format de sortida
          QUALITY      // Qualitat (0 a 1)
        );
      };

      img.onerror = (error) => {
        console.error('Error loading image into Image object:', error);
        URL.revokeObjectURL(blobURL); // Allibera memòria també en cas d'error
        resolve(null);
      };

      img.src = blobURL; // Inicia la càrrega de la imatge
    });
  }
}
