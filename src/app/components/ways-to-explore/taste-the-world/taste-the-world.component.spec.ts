import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasteTheWorldComponent } from './taste-the-world.component';

describe('TasteTheWorldComponent', () => {
  let component: TasteTheWorldComponent;
  let fixture: ComponentFixture<TasteTheWorldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasteTheWorldComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TasteTheWorldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
