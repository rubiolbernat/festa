import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginForgotpasswordPageComponent } from './login-forgotpassword-page.component';

describe('LoginForgotpasswordPageComponent', () => {
  let component: LoginForgotpasswordPageComponent;
  let fixture: ComponentFixture<LoginForgotpasswordPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginForgotpasswordPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginForgotpasswordPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
