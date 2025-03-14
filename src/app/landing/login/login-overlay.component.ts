import { Component, ElementRef, HostListener, AfterViewInit, OnDestroy, input } from '@angular/core';
import { OverlayService } from '../../core/services/overlay/overlay.service';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotmypasswordComponent } from './forgotmypassword/forgotmypassword.component';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login-overlay',
  standalone: true,
  imports: [RegisterComponent, LoginComponent, ForgotmypasswordComponent, CommonModule],
  templateUrl: './login-overlay.component.html',
  styleUrls: ['./login-overlay.component.css']
})
export class LoginOverlayComponent implements AfterViewInit, OnDestroy {
  readonly overlayName = input.required<string>({ alias: "overlay" });
  isOpen = false;
  pages = [
    { name: 'LoginOverlay', isOpen: true }, // Login sempre true
    { name: 'RegisterOverlay', isOpen: false },
    { name: 'ForgotmypasswordOverlay', isOpen: false }
  ];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private overlayService: OverlayService,
    private elementRef: ElementRef
  ) { }

  ngAfterViewInit(): void {
    this.overlayService.overlaysState$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.isOpen = state[this.overlayName()] || false;

      if (this.isOpen) {
        this.setAllPagesClosed();
        this.openPage('LoginOverlay');

        setTimeout(() => {
          const input = this.elementRef.nativeElement.querySelector('.modal input') as HTMLElement;
          input?.focus();
        }, 100);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeOverlay() {
    this.setAllPagesClosed();
    this.overlayService.close(this.overlayName());
  }

  openPage(pageName: string) {
    this.setAllPagesClosed();
    const page = this.pages.find(p => p.name === pageName);
    if (page) {
      page.isOpen = true;
    }
  }

  isPageOpen(pageName: string): boolean {
    const page = this.pages.find(p => p.name === pageName);
    return page ? page.isOpen : false;
  }

  setAllPagesClosed() {
    this.pages.forEach(page => page.isOpen = false);
  }

  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeOverlay();
    }
  }

  openlogin() {
    this.openPage('LoginOverlay');
  }

  openforgot() {
    this.openPage('ForgotmypasswordOverlay');
  }
}
