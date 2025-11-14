import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WellnessRetreatsComponent } from './wellness-retreats.component';

describe('WellnessRetreatsComponent', () => {
  let component: WellnessRetreatsComponent;
  let fixture: ComponentFixture<WellnessRetreatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WellnessRetreatsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WellnessRetreatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
