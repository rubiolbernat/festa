import { Component, inject, output, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router'; // Importa el Router

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  public Forgotmypassword = output<void>();
  public afterlogin = output<void>();
  authService = inject(AuthService);
  loginform: FormGroup;
  router = inject(Router); // Injecta el Router
  errorMessage: string | null = null; // <-- AFEGEIX AIXÒ

  constructor() {
    this.loginform = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]), // Encara necessari per al login inicial
      rememberMe: new FormControl(false)
    });
  }

  ngOnInit(): void {
    // Comprova si hi ha un email guardat
    const email = localStorage.getItem('email');
    if (email) {
      this.loginform.patchValue({
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
      const response = await this.authService.loginUser(this.loginform.value);

      if (response && response.accessToken && response.refreshToken && response.user) {
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user)); // Guarda la info de l'usuari

        if (this.loginform.get('rememberMe')?.value) {
          localStorage.setItem('email', this.loginform.get('email')?.value || '');
        } else {
          localStorage.removeItem('email');
        }

        // Redirigeix a la pàgina principal o a on sigui necessari
        //this.router.navigate(['/']); // Canvia '/' per la teva ruta
        this.afterlogin.emit(); // Notifica que s'ha fet login
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

  buttonforgotpassword() {
    this.Forgotmypassword.emit();
  }
}
