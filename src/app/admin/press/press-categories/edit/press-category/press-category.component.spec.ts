import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PressCategoryComponent } from './press-category.component';

describe('PressCategoryComponent', () => {
  let component: PressCategoryComponent;
  let fixture: ComponentFixture<PressCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PressCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PressCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
