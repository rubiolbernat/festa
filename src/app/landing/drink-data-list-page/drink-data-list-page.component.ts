import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrinkingDataService } from '../../core/services/drinking-data/drinking-data.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { Subscription } from 'rxjs';
import { DrinkData } from '../../core/models/drink-data.model';
import { Router, RouterModule } from '@angular/router';
import { AlertService } from '../../core/services/alert/alert.service';

@Component({
  selector: 'app-drink-data-list-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './drink-data-list-page.component.html',
  styleUrls: ['./drink-data-list-page.component.css']
})
export class DrinkDataListPageComponent implements OnInit, OnDestroy {

  drinkDataList: DrinkData[] = [];
  private subscription: Subscription | undefined;
  userId: number = 0;

  constructor(
    private drinkingDataService: DrinkingDataService,
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadData(); // Carrega les dades al inicialitzar el component
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  editDrinkData(drinkData: DrinkData) {
    this.router.navigate(['/la_gran_aventura-edit', drinkData.id]);
  }

  deleteDrinkData(drinkData: DrinkData) {
    if (confirm('Estàs segur que vols eliminar aquest registre?')) {
      this.subscription = this.drinkingDataService.deleteDrinkData(drinkData.id!).subscribe(
        () => {
          this.alertService.showAlert('Registre eliminat correctament', 'success', 3000);
          this.loadData(); // Refresca la llista de dades
        },
        (error) => {
          console.error('Error al eliminar el registre:', error);
          this.alertService.showAlert('Error al eliminar el registre', 'danger', 3000);
        }
      );
    }
  }

  loadData() {
    const user = this.authService.getUser();
    if (user) {
      this.userId = user.id;
      this.subscription = this.drinkingDataService.getDataByUserId(this.userId).subscribe(
        (data) => {
          this.drinkDataList = data;
        },
        (error) => {
          console.error('Error al carregar les dades:', error);
          this.alertService.showAlert('Error al carregar les dades', 'danger', 3000);
        }
      );
    } else {
      console.warn('Usuari no autenticat.');
      this.alertService.showAlert('No estas autenticat', 'danger', 3000);
      this.router.navigate(['/login']);
    }
  }
}
