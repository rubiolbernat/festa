import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfiniteInsertsComponent } from './infinite-inserts.component';

describe('NetConcertComponent', () => {
  let component: InfiniteInsertsComponent;
  let fixture: ComponentFixture<InfiniteInsertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfiniteInsertsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfiniteInsertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
