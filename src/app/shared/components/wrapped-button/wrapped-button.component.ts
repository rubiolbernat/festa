import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wrapped-button',
  imports:[CommonModule],
  templateUrl: './wrapped-button.component.html',
  styleUrls: ['./wrapped-button.component.css']
})
export class WrappedButtonComponent {
  showOnlyEndOfYear = input<boolean>();
  visible: boolean = true;

  constructor(private router: Router) { }

  ngOnInit() {
    if (this.showOnlyEndOfYear()) {
      this.visible = this.isEndOfYear();
    }
  }

  goToWrapped() {
    this.router.navigate(['/wrapped']);
  }

  private isEndOfYear(): boolean {
    const today = new Date();
    const year = today.getFullYear();

    const start = new Date(year, 10, 20); // 20 Nov
    const end = new Date(year + 1, 0, 10); // 10 Gen
    return today >= start || today <= end;
  }
}
