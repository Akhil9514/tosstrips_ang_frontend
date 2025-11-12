import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaysToComeComponent } from './days-to-come.component';

describe('DaysToComeComponent', () => {
  let component: DaysToComeComponent;
  let fixture: ComponentFixture<DaysToComeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaysToComeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DaysToComeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
