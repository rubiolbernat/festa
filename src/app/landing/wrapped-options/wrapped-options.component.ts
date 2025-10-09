import { WrappedButtonComponent } from './../../shared/components/wrapped-button/wrapped-button.component';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WrappedService } from '../../core/services/wrapped/wrapped.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-wrapped-options',
  imports: [FormsModule],
  templateUrl: './wrapped-options.component.html',
  styleUrl: './wrapped-options.component.css'
})
export class WrappedOptionsComponent implements OnInit {

  wrappedService = inject(WrappedService);
  router = inject(Router);

  selectedOption: 'this-year' | 'all-time' | 'custom' = 'this-year';
  startDate!: string;
  endDate!: string;



  ngOnInit(): void {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    this.startDate = this.formatDate(firstDayOfYear);
    this.endDate = this.formatDate(today);
  }

  selectOption(option: 'this-year' | 'all-time' | 'custom'): void {
    this.selectedOption = option;
  }

  generateWrapped(): void {
    this.wrappedService.generateWrapped(this.selectedOption, this.startDate, this.endDate);
    //alert(`Generant Wrapped per a: ${this.selectedOption}`);
    this.router.navigate(['/wrapped']);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
