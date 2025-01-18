import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroInstrutorComponent } from './cadastro-instrutor.component';

describe('CadastroInstrutorComponent', () => {
  let component: CadastroInstrutorComponent;
  let fixture: ComponentFixture<CadastroInstrutorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroInstrutorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroInstrutorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
