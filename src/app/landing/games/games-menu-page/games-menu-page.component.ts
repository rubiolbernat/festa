import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Importa RouterModule
@Component({
  selector: 'app-games-menu-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './games-menu-page.component.html',
  styleUrl: './games-menu-page.component.css'
})
export class GamesMenuPageComponent {
  constructor(private router: Router) { }

  ngOnInit(): void {
  }
}
