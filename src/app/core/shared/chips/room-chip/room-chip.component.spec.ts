import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomChipComponent } from './room-chip.component';

describe('RoomChipComponent', () => {
  let component: RoomChipComponent;
  let fixture: ComponentFixture<RoomChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomChipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
