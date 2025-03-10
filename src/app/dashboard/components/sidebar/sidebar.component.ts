import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule]
})
export class SidebarComponent implements OnInit {

  userName: string = "Nom d'Usuari"; // Reemplaça amb dades reals
  userImageUrl: string = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"; // Reemplaça amb la URL real de la imatge
  isCollapsed: boolean = false; // Per controlar si el sidebar està amagat

  constructor() { }

  ngOnInit(): void {
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

}
