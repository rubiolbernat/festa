import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WrappedService {
  selectedOption: 'this-year' | 'all-time' | 'custom' = 'this-year';
  startDate!: string;
  endDate!: string;

  constructor() { }

  generateWrapped(selectedOption: 'this-year' | 'all-time' | 'custom' = 'this-year', startDate: string, endDate: string) {
    this.selectedOption = selectedOption;
    this.startDate = startDate;
    this.endDate = endDate;

    this.fetchData();
  }

  fetchData() {

  }
}
