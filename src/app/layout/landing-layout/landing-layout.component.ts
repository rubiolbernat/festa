import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginOverlayComponent } from '../../landing/login/login-overlay.component';
import { HeaderComponent } from '../../landing/components/header/header.component';
import { FooterComponent } from '../../landing/components/footer/footer.component';

@Component({
  selector: 'app-landing-layout',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, LoginOverlayComponent],
  templateUrl: './landing-layout.component.html',
  styleUrl: './landing-layout.component.css'
})
export class LandingLayoutComponent {

}
