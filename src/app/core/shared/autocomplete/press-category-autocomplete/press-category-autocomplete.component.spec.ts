import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PressCategoryAutocompleteComponent } from './press-category-autocomplete.component';

describe('PressCategoryAutocompleteComponent', () => {
  let component: PressCategoryAutocompleteComponent;
  let fixture: ComponentFixture<PressCategoryAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PressCategoryAutocompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PressCategoryAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
