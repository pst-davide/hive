import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsletterChannelsComponent } from './newsletter-channels.component';

describe('NewsletterChannelsComponent', () => {
  let component: NewsletterChannelsComponent;
  let fixture: ComponentFixture<NewsletterChannelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsletterChannelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsletterChannelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
