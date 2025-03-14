import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLinkActive, RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnInit {
  authService = inject(AuthService);
  loginForm: FormGroup;
  router = inject(Router); // Injecta el Router
  errorMessage: string | null = null; // <-- AFEGEIX AIXÒ

  constructor() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]), // Encara necessari per al login inicial
      rememberMe: new FormControl(false)
    });
  }

  ngOnInit(): void {
    // Comprova si hi ha un email guardat
    const email = localStorage.getItem('email');
    if (email) {
      this.loginForm.patchValue({
        email: email,
        rememberMe: true
      });
    }
    // Intenta obtenir un nou token amb el refresh token
    if (this.authService.getRefreshToken()) {
      this.refreshToken();
    }
  }

  async onSubmit() {
    this.errorMessage = null; // Reinicia el missatge d'error
    try {
      const response = await this.authService.loginUser(this.loginForm.value);

      if (response && response.accessToken && response.refreshToken && response.user) {
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user)); // Guarda la info de l'usuari

        if (this.loginForm.get('rememberMe')?.value) {
          localStorage.setItem('email', this.loginForm.get('email')?.value || '');
        } else {
          localStorage.removeItem('email');
        }

        // Redirigeix a la pàgina principal o a on sigui necessari
        this.router.navigate(['/home']); // Canvia '/' per la teva ruta
      } else {
        // Maneja l'error de login (mostra un missatge a l'usuari)
        console.error("Login failed:", response);
        this.errorMessage = "Credencials invàlides. Si us plau, prova de nou.";
      }
    } catch (error) {
      console.error("Error during login:", error);

      if ((error as any).status === 401) {
        this.errorMessage = "Credencials incorrectes. Si us plau, verifica el teu usuari i contrasenya.";
      } else {
        this.errorMessage = "Error de connexió. Si us plau, prova més tard.";
      }
    }
  }

  async refreshToken() {
    try {
      const response = await this.authService.refreshToken();
      if (response && response.accessToken && response.refreshToken && response.user) {
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user)); // Guarda la info de l'usuari
        console.log('Token refreshed successfully');
      } else {
        console.error('Failed to refresh token:', response);
        // Maneja l'error de refresh token (per exemple, forçant al usuari a fer login de nou)
        // Redirigeix a la pàgina de login si el refresh falla
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Maneja l'error de refresh token (per exemple, forçant al usuari a fer login de nou)
      // Redirigeix a la pàgina de login si hi ha un error
      this.router.navigate(['/login']);
    }
  }
}
