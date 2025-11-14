import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SailingToursComponent } from './sailing-tours.component';

describe('SailingToursComponent', () => {
  let component: SailingToursComponent;
  let fixture: ComponentFixture<SailingToursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SailingToursComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SailingToursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
