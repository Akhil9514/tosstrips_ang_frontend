import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryComponentComponent } from './country-component.component';

describe('CountryComponentComponent', () => {
  let component: CountryComponentComponent;
  let fixture: ComponentFixture<CountryComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CountryComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
