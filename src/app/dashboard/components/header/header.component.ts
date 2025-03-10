import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  userName: string = "Nom d'Usuari"; // Reemplaça amb dades reals
  userImageUrl: string = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"; // Reemplaça amb la URL real de la imatge

  constructor() { }

  ngOnInit(): void {
  }

}
