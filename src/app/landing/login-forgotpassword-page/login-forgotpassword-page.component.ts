import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-login-forgotpassword-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-forgotpassword-page.component.html',
  styleUrl: './login-forgotpassword-page.component.css'
})
export class LoginForgotpasswordPageComponent {
  steps: number = 0;
  emailForm: FormGroup;
  codeForm: FormGroup;
  passwordForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.codeForm = this.fb.group({
      code: ['', [Validators.required]]
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      repeatpassword: ['', [Validators.required]]
    }, { validators: this.PasswordMatchValidator });
  }

  onNextStep() {
    this.steps++;
  }

  sendRecoveryEmail() {
    if (this.emailForm.valid) {
      // Aquí aniria la lògica per enviar el correu
      this.onNextStep();
    }
  }

  verifyCode() {
    if (this.codeForm.valid) {
      // Aquí aniria la verificació del codi
      this.onNextStep();
    }
  }

  resetPassword() {
    if (this.passwordForm.valid) {
      // Aquí es canviaria la contrasenya
      this.onNextStep();
    }
  }

  closeModal() {
    this.steps = 0;
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
}
