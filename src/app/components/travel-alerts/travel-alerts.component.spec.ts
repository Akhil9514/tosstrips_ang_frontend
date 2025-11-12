import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelAlertsComponent } from './travel-alerts.component';

describe('TravelAlertsComponent', () => {
  let component: TravelAlertsComponent;
  let fixture: ComponentFixture<TravelAlertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelAlertsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TravelAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
