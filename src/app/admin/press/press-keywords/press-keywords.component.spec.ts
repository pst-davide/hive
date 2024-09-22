import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PressKeywordsComponent } from './press-keywords.component';

describe('PressKeywordsComponent', () => {
  let component: PressKeywordsComponent;
  let fixture: ComponentFixture<PressKeywordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PressKeywordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PressKeywordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
