import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  authService = inject(AuthService);
  registerform: FormGroup;

  constructor() {
    this.registerform = new FormGroup({
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
    if (this.registerform.valid) {
      const userData = {
        name: this.registerform.value.name,
        email: this.registerform.value.email,
        password: this.registerform.value.password
      };

      try {
        const response = await this.authService.registerUser(userData);
        console.log('Registration successful:', response);

        if (response && response.success) {
          // Si la resposta té una propietat 'success' i és true, mostra un missatge d'èxit
          console.log('Registration successful:', response.message);
          // Redirigeix l'usuari o fes alguna altra acció
        } else {
          // Si la resposta no té 'success' o és false, mostra un missatge d'error
          console.error('Registration failed:', response ? response.message : 'Unknown error');
          // Mostra un missatge d'error a l'usuari
        }
      } catch (error) {
        console.error('Registration failed:', error);
        // Mostra un missatge d'error a l'usuari
      }
    } else {
      console.log('Form is invalid. Please check the fields.');
    }
  }
}
