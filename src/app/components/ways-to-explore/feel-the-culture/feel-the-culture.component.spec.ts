import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeelTheCultureComponent } from './feel-the-culture.component';

describe('FeelTheCultureComponent', () => {
  let component: FeelTheCultureComponent;
  let fixture: ComponentFixture<FeelTheCultureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeelTheCultureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeelTheCultureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
