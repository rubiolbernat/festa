import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamesMenuPageComponent } from './games-menu-page.component';

describe('GamesMenuPageComponent', () => {
  let component: GamesMenuPageComponent;
  let fixture: ComponentFixture<GamesMenuPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamesMenuPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamesMenuPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
