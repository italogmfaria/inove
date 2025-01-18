import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroSecaoComponent } from './cadastro-secao.component';

describe('CadastroSecaoComponent', () => {
  let component: CadastroSecaoComponent;
  let fixture: ComponentFixture<CadastroSecaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroSecaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroSecaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
