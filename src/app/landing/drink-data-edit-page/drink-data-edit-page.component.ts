import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrinkingDataService } from '../../core/services/drinking-data/drinking-data.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DrinkData } from '../../core/models/drink-data.model';
import { FormsModule } from '@angular/forms';
import { Subscription, switchMap } from 'rxjs';
import { AlertService } from '../../core/services/alert/alert.service';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-drink-data-edit-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './drink-data-edit-page.component.html',
  styleUrls: ['./drink-data-edit-page.component.css']
})
export class DrinkDataEditPageComponent implements OnInit, OnDestroy {

  drinkData: DrinkData = {
    user_id: 0,
    date: '',
    day_of_week: 0,
    location: '',
    latitude: 0,
    longitude: 0,
    drink: '',
    quantity: 0,
    others: '',
    price: 0,
    id: 0
  };

  private subscription: Subscription | undefined;
  dataId: number = 0;

  constructor(
    private drinkingDataService: DrinkingDataService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.dataId = +params['id'];
      this.loadDrinkData();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadDrinkData(): void {
    this.subscription = this.drinkingDataService.getDrinkDataById(this.dataId).subscribe(
      (data) => {
        this.drinkData = data;
      },
      (error) => {
        console.error('Error al carregar les dades:', error);
        this.alertService.showAlert('Error al carregar les dades', 'danger', 3000);
        this.router.navigate(['/la_gran_aventura-list']);
      }
    );
  }

  updateDrinkData() {
    this.subscription = this.drinkingDataService.updateDrinkData(this.drinkData).subscribe(
      () => {
        this.alertService.showAlert('Dades actualitzades correctament', 'success', 3000);
        this.router.navigate(['/la_gran_aventura-list']);
      },
      (error) => {
        console.error('Error al actualizar les dades:', error);
        this.alertService.showAlert('Error al actualizar les dades', 'danger', 3000);
      }
    );
  }

  deleteDrinkData() {
    if (confirm('Estàs segur que vols eliminar aquest registre?')) {
      if (this.drinkData.id !== undefined) {
        this.subscription = this.drinkingDataService.deleteDrinkData(this.drinkData.id).subscribe(
          () => {
            this.alertService.showAlert('Registre eliminat correctament', 'success', 3000);
            this.router.navigate(['/la_gran_aventura-list']);
          },
          (error) => {
            console.error('Error al eliminar el registre:', error);
            this.alertService.showAlert('Error al eliminar el registre', 'danger', 3000);
          }
        );
      }
    }
  }

  cancelEdit() {
    this.router.navigate(['/la_gran_aventura-list']);
  }
}
