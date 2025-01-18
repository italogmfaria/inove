import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcessoPlataformaComponent } from './acesso-plataforma.component';

describe('AcessoPlataformaComponent', () => {
  let component: AcessoPlataformaComponent;
  let fixture: ComponentFixture<AcessoPlataformaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcessoPlataformaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcessoPlataformaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
