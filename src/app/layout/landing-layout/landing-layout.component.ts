import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../landing/components/header/header.component';
import { FooterComponent } from '../../landing/components/footer/footer.component';

@Component({
  selector: 'app-landing-layout',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './landing-layout.component.html',
  styleUrl: './landing-layout.component.css'
})
export class LandingLayoutComponent {

}
