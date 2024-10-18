import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomAutocompleteComponent } from './room-autocomplete.component';

describe('RoomAutocompleteComponent', () => {
  let component: RoomAutocompleteComponent;
  let fixture: ComponentFixture<RoomAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomAutocompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
