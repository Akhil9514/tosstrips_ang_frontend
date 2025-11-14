import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlandJourneysComponent } from './overland-journeys.component';

describe('OverlandJourneysComponent', () => {
  let component: OverlandJourneysComponent;
  let fixture: ComponentFixture<OverlandJourneysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlandJourneysComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OverlandJourneysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
