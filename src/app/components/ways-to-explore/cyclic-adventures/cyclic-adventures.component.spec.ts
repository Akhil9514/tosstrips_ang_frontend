import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CyclicAdventuresComponent } from './cyclic-adventures.component';

describe('CyclicAdventuresComponent', () => {
  let component: CyclicAdventuresComponent;
  let fixture: ComponentFixture<CyclicAdventuresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CyclicAdventuresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CyclicAdventuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
