import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelEscolaComponent } from './painel-escola.component';

describe('PainelEscolaComponent', () => {
  let component: PainelEscolaComponent;
  let fixture: ComponentFixture<PainelEscolaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelEscolaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelEscolaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
