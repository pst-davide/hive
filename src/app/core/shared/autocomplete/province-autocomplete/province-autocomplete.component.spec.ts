import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvinceAutocompleteComponent } from './province-autocomplete.component';

describe('ProvinceAutocompleteComponent', () => {
  let component: ProvinceAutocompleteComponent;
  let fixture: ComponentFixture<ProvinceAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvinceAutocompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProvinceAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
