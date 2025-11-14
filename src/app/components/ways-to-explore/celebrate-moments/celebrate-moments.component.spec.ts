import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CelebrateMomentsComponent } from './celebrate-moments.component';

describe('CelebrateMomentsComponent', () => {
  let component: CelebrateMomentsComponent;
  let fixture: ComponentFixture<CelebrateMomentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CelebrateMomentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CelebrateMomentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
