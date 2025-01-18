import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewCursoComponent } from './preview-curso.component';

describe('PreviewCursoComponent', () => {
  let component: PreviewCursoComponent;
  let fixture: ComponentFixture<PreviewCursoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewCursoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewCursoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
