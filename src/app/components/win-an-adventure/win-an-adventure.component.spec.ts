import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinAnAdventureComponent } from './win-an-adventure.component';

describe('WinAnAdventureComponent', () => {
  let component: WinAnAdventureComponent;
  let fixture: ComponentFixture<WinAnAdventureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinAnAdventureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WinAnAdventureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
