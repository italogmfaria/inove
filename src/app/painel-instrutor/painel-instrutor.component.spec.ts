import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelInstrutorComponent } from './painel-instrutor.component';

describe('PainelInstrutorComponent', () => {
  let component: PainelInstrutorComponent;
  let fixture: ComponentFixture<PainelInstrutorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelInstrutorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelInstrutorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
