// drinking-page.component.ts
import { Component } from '@angular/core';
import { DrinkService } from '../../core/services/drinking-data/drinking-data.service';
import { DrinkData } from './../../core/models/drink-data.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-drinking-page',
  templateUrl: './drinking-page.component.html',
  styleUrls: ['./drinking-page.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class DrinkingPageComponent {
  drinkForm: FormGroup;

  constructor(private fb: FormBuilder, private drinkingService: DrinkService) {
    this.drinkForm = this.fb.group({
      user_id: ['', Validators.required],
      date: ['', Validators.required],
      day_of_week: ['', Validators.required],
      location: ['', Validators.required],
      latitude: [''],
      longitude: [''],
      drink: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(0.01)]],
      others: [''],
      price: ['', [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit() {
    if (this.drinkForm.valid) {
      this.drinkingService.addDrinkData(this.drinkForm.value).subscribe();
      this.drinkForm.reset();
    }
  }
}
