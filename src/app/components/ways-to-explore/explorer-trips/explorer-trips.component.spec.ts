import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerTripsComponent } from './explorer-trips.component';

describe('ExplorerTripsComponent', () => {
  let component: ExplorerTripsComponent;
  let fixture: ComponentFixture<ExplorerTripsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerTripsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExplorerTripsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
