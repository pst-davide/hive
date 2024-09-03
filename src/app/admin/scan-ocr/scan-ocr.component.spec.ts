import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanOcrComponent } from './scan-ocr.component';

describe('ScanOcrComponent', () => {
  let component: ScanOcrComponent;
  let fixture: ComponentFixture<ScanOcrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanOcrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanOcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
