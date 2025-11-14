import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetMovingComponent } from './get-moving.component';

describe('GetMovingComponent', () => {
  let component: GetMovingComponent;
  let fixture: ComponentFixture<GetMovingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetMovingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GetMovingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
