import { LastInsertComponent } from './last-insert.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('NetConcertComponent', () => {
  let component: LastInsertComponent;
  let fixture: ComponentFixture<LastInsertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LastInsertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LastInsertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
