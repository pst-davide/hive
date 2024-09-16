import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PressCategoriesComponent } from './press-categories.component';

describe('PressCategoriesComponent', () => {
  let component: PressCategoriesComponent;
  let fixture: ComponentFixture<PressCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PressCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PressCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
