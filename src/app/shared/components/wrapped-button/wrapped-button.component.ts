import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-wrapped-button',
  imports: [CommonModule, RouterModule],
  templateUrl: './wrapped-button.component.html',
  styleUrls: ['./wrapped-button.component.css']
})
export class WrappedButtonComponent {
  showOnlyEndOfYear = input<boolean>();
  visible: boolean = true;

  constructor(private router: Router) { }

  ngOnInit() {
    const flag = this.showOnlyEndOfYear();

    // Casos:
    // - undefined -> sempre visible
    // - true -> només final d'any
    // - false -> no es mostra a final d'any
    if (flag === true) {
      this.visible = this.isEndOfYear();
    } else if (flag === false) {
      this.visible = !this.isEndOfYear();
    } else {
      this.visible = true;
    }
  }

  goToWrapped() {
    this.router.navigate(['/wrapped-options']);
  }

  private isEndOfYear(): boolean {
    const today = new Date();
    const year = today.getFullYear();

    const start = new Date(year, 10, 20); // 20 novembre (mes 10, perquè comença en 0)
    const endOfYear = new Date(year, 11, 31); // 31 desembre
    const startOfYear = new Date(year, 0, 1); // 1 gener
    const end = new Date(year, 0, 10); // 10 gener

    // Si som del 20 de novembre al 31 de desembre
    if (today >= start && today <= endOfYear) {
      return true;
    }

    // Si som del 1 al 10 de gener
    if (today >= startOfYear && today <= end) {
      return true;
    }

    // En qualsevol altre cas, no mostrar
    return false;
  }
}
