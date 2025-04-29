import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentariesComponent } from './commentaries.component';

describe('CommentariesComponent', () => {
  let component: CommentariesComponent;
  let fixture: ComponentFixture<CommentariesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentariesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
