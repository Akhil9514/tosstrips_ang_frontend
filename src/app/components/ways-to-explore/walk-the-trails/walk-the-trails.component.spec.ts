import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalkTheTrailsComponent } from './walk-the-trails.component';

describe('WalkTheTrailsComponent', () => {
  let component: WalkTheTrailsComponent;
  let fixture: ComponentFixture<WalkTheTrailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalkTheTrailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WalkTheTrailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
