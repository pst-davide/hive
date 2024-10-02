import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsletterChannelComponent } from './newsletter-channel.component';

describe('NewsletterChannelComponent', () => {
  let component: NewsletterChannelComponent;
  let fixture: ComponentFixture<NewsletterChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsletterChannelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsletterChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
