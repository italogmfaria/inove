import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SejaInstrutorComponent } from './seja-instrutor.component';

describe('SejaInstrutorComponent', () => {
  let component: SejaInstrutorComponent;
  let fixture: ComponentFixture<SejaInstrutorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SejaInstrutorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SejaInstrutorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
