import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfterYourBookingComponent } from './after-your-booking.component';

describe('AfterYourBookingComponent', () => {
  let component: AfterYourBookingComponent;
  let fixture: ComponentFixture<AfterYourBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfterYourBookingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AfterYourBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
