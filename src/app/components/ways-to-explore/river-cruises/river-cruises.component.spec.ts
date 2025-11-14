import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiverCruisesComponent } from './river-cruises.component';

describe('RiverCruisesComponent', () => {
  let component: RiverCruisesComponent;
  let fixture: ComponentFixture<RiverCruisesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiverCruisesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiverCruisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
