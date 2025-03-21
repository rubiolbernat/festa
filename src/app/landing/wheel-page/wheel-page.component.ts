import {
  AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild
} from "@angular/core";
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';

const COLORS = [
  "#FF5733", "#33A8FF", "#FFC300", "#33FF57", "#C733FF", "#FF33C7", "#33FFC7",
  "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#800000",
  "#808000", "#008000", "#800080", "#008080", "#000080", "#FFA500", "#A52A2A",
  "#B22222", "#DC143C", "#FFD700", "#ADFF2F", "#32CD32", "#40E0D0", "#4682B4"
];
declare var bootstrap: any;

@Component({
  selector: 'app-wheel-page',
  imports: [CommonModule, FormsModule, MatGridListModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ClipboardModule],
  templateUrl: './wheel-page.component.html',
  styleUrl: './wheel-page.component.css'
})
export class WheelPageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("wheel") wheel?: ElementRef<HTMLCanvasElement>;
  @ViewChild("spin") spin?: ElementRef;

  private initialOptions: string[] = ['SI', 'NO'];
  private historyOptions: string[] = [...this.initialOptions];
  private optionsSubject = new BehaviorSubject<string[]>([...this.initialOptions]);
  option$: Observable<string[]> = this.optionsSubject.asObservable();

  newDeveloper: string = '';
  sectors: any[] = [];
  winnerName: string = '';
  winners: string[] = [];
  value: string = '';
  modeDelete = true;
  friction = 0.995;
  angVel = 0;
  ang = 0;
  lastSelection = -1;
  dia = 0;
  rad = 0;
  PI = Math.PI;
  TAU = 2 * this.PI;
  arc0 = 0;
  ctx: CanvasRenderingContext2D | null = null;
  private winnerSubscription?: Subscription;

  constructor() { }

  ngOnInit() {
    this.winnerSubscription = this.option$.subscribe(options => {
      //this.value = options.map((winner, i) => `${i + 1}. ${winner}`).join('\n');
    });
    this.updateSectors(this.optionsSubject.getValue());
  }

  ngAfterViewInit(): void {
    this.createWheel();
    setInterval(() => this.engine(), 16);
  }

  ngOnDestroy(): void {
    this.winnerSubscription?.unsubscribe();
  }

  @Input() set options(values: string[]) {
    this.updateSectors(values);
  }

  get currentIndex(): number {
    return Math.floor(this.sectors.length - (this.ang / this.TAU) * this.sectors.length) % this.sectors.length;
  }

  deleteOpt(option: string) {
    const updatedOptions = this.optionsSubject.getValue().filter(opt => opt !== option);
    this.optionsSubject.next(updatedOptions);
    this.historyOptions = [...updatedOptions];
    this.updateSectors(updatedOptions);
  }

  addNewDeveloper(option: string) {
    if (!option.trim()) return;
    const updatedOptions = [...this.optionsSubject.getValue(), option];
    this.optionsSubject.next(updatedOptions);
    this.historyOptions = [...updatedOptions];
    this.newDeveloper = '';
    this.updateSectors(updatedOptions);
  }

  trackByFn(index: number, item: any): any {
    return item;
  }

  createWheel() {
    if (!this.wheel) return;
    this.ctx = this.wheel.nativeElement.getContext("2d");
    if (!this.ctx) {
      console.error("No s'ha pogut obtenir el context 2D del canvas.");
      return;
    }

    this.dia = this.ctx.canvas.width;
    this.rad = this.dia / 2;
    this.arc0 = this.TAU / this.sectors.length;
    this.sectors.forEach((sector, i) => this.drawSector(sector, i));
    this.rotate(true);
  }

  spinner() {
    if (!this.angVel) this.angVel = this.rand(0.25, 0.35);
  }

  drawSector(sector: any, i: number) {
    if (!this.ctx) return;
    const ang = this.arc0 * i;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.fillStyle = sector.color;
    this.ctx.moveTo(this.rad, this.rad);
    this.ctx.arc(this.rad, this.rad, this.rad, ang, ang + this.arc0);
    this.ctx.lineTo(this.rad, this.rad);
    this.ctx.fill();

    this.ctx.translate(this.rad, this.rad);
    this.ctx.rotate(ang + this.arc0 / 2);
    this.ctx.textAlign = "right";
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "bold 30px sans-serif";
    this.ctx.fillText(sector.label, this.rad - 10, 10);
    this.ctx.restore();
  }

  rotate(first = false) {
    if (!this.ctx) return;
    const sector = this.sectors[this.currentIndex];
    this.ctx.canvas.style.transform = `rotate(${this.ang - this.PI / 2}rad)`;

    if (this.spin?.nativeElement) {
      this.spin.nativeElement.textContent = !this.angVel ? "GIRAR" : sector.label;
      this.spin.nativeElement.style.background = sector.color;
    }

    if (!first) {
      this.lastSelection = !this.angVel ? this.lastSelection : this.currentIndex;
      this.deleteOption();
    }
  }

  frame() {
    if (!this.angVel) return;
    this.angVel *= this.friction;
    if (this.angVel < 0.002) this.angVel = 0;
    this.ang = (this.ang + this.angVel) % this.TAU;
    this.rotate();
  }

  engine() {
    this.frame();
  }

  deleteOption() {
    if (!this.modeDelete || this.angVel) return;
    const winner = this.sectors[this.lastSelection].label;
    this.addNewWinner(winner);
    if (this.spin && this.spin.nativeElement) {
      this.spin.nativeElement.textContent = winner;
    }
    this.sectors.splice(this.lastSelection, 1);
    this.showWinnerModal(winner);
    setTimeout(() => this.createWheel(), 1200);
  }

  restartWinner() {
    this.winners = [];
    this.value = '';
  }

  addNewWinner(value: string) {
    this.winners.push(value);
    this.value = `Guanyadors \n${this.winners.map((w, i) => `${i + 1}. ${w}`).join('\n')}`;
  }

  rand = (min: number, max: number) => Math.random() * (max - min) + min;

  resetWheel() {
    this.angVel = 0;
    this.ang = 0;
    this.optionsSubject.next([...this.historyOptions]);
    this.updateSectors(this.historyOptions);
    this.createWheel();
    this.restartWinner();
  }

  private updateSectors(options: string[]) {
    this.sectors = options.map((opts, i) => ({
      color: COLORS[i % COLORS.length],
      label: opts
    }));
    this.createWheel();
  }

  showWinnerModal(winner: string) {
    this.winnerName = winner;
    const modal = new bootstrap.Modal(document.getElementById('winnerModal'));
    modal.show();
  }
}
