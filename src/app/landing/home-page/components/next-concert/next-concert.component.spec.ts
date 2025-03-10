import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetConcertComponent } from './next-concert.component';

describe('NetConcertComponent', () => {
  let component: NetConcertComponent;
  let fixture: ComponentFixture<NetConcertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetConcertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetConcertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
