import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PressKeywordComponent } from './press-keyword.component';

describe('PressKeywordComponent', () => {
  let component: PressKeywordComponent;
  let fixture: ComponentFixture<PressKeywordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PressKeywordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PressKeywordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
