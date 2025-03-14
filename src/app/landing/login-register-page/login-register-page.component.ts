import { Component, inject, output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-login-register-page',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login-register-page.component.html',
  styleUrl: './login-register-page.component.css'
})
export class LoginRegisterPageComponent {
  public afterregister = output<void>();
  authService = inject(AuthService);
  router = inject(Router);
  registerForm: FormGroup;
  errorMessage: string | null = null;

  constructor() {
    this.registerForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      repeatpassword: new FormControl('', [Validators.required])
    },
      {
        validators: this.PasswordMatchValidator
      });
  }

  PasswordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const repeatpassword = control.get('repeatpassword');

    if (!password || !repeatpassword) return null;

    if (!repeatpassword.value) {
      repeatpassword.setErrors(null);
      return null;
    }

    const mismatch = password.value !== repeatpassword.value;
    if (mismatch) {
      repeatpassword.setErrors({ mismatch: true });
    } else {
      repeatpassword.setErrors(null);
    }

    return mismatch ? { mismatch: true } : null;
  }

  async onSubmit() {
    this.errorMessage = null;
    if (this.registerForm.valid) {
      const userData = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };

      try {
        const response = await this.authService.registerUser(userData);
        console.log('Registration successful:', response);

        if (response && response.success) {
          // Si la resposta té una propietat 'success' i és true, mostra un missatge d'èxit
          console.log('Registration successful:', response.message);
          this.router.navigate(['/login']);
          // Redirigeix l'usuari o fes alguna altra acció
        } else {
          // Si la resposta no té 'success' o és false, mostra un missatge d'error
          console.error('Registration failed:', response ? response.message : 'Unknown error');
          // Mostra un missatge d'error a l'usuari
          this.errorMessage = 'Registration failed:', response ? response.message : 'Unknown error';
        }
      } catch (error) {
        console.error('Registration failed:', error);
        // Mostra un missatge d'error a l'usuari
        this.errorMessage = 'Registration failed:', error;
        this.router.navigate(['/login']);
      }
    } else {
      console.log('Form is invalid. Please check the fields.');
      this.errorMessage = 'Form is invalid. Please check the fields.';
    }
  }
}
