import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroEscolaComponent } from './cadastro-escola.component';

describe('CadastroEscolaComponent', () => {
  let component: CadastroEscolaComponent;
  let fixture: ComponentFixture<CadastroEscolaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroEscolaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroEscolaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
