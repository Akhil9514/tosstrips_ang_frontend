import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WildlifeSafarisComponent } from './wildlife-safaris.component';

describe('WildlifeSafarisComponent', () => {
  let component: WildlifeSafarisComponent;
  let fixture: ComponentFixture<WildlifeSafarisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WildlifeSafarisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WildlifeSafarisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
