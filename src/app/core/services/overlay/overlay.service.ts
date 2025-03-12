import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {
  private overlaysState = new BehaviorSubject<{ [key: string]: boolean }>({});
  overlaysState$ = this.overlaysState.asObservable();

  // Obrir un overlay
  open(name: string) {
    let currentState = this.overlaysState.getValue();
    let newState = { ...currentState };
    newState[name] = true;
    this.overlaysState.next(newState);
    console.log(`Obert overlay: ${name}`);
    console.log('Nou estat: ', newState);
  }

  // Tancar un overlay
  close(name: string) {
    let currentState = this.overlaysState.getValue();
    let newState = { ...currentState };
    newState[name] = false;
    this.overlaysState.next(newState);
    //console.log(`Tancat overlay: ${name}`);
    //console.log('Nou estat: ', newState);
  }

  // Comprovar si un overlay està obert
  isOpen(name: string): boolean {
    return this.overlaysState.getValue()[name] || false;
  }

  // Tancar tots els overlays
  closeAll() {
    const currentState = this.overlaysState.getValue();
    const newState = Object.keys(currentState).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as { [key: string]: boolean });

    this.overlaysState.next(newState);
    console.log('Tancats tots els overlays');
    console.log('Nou estat: ', newState);
  }
}
