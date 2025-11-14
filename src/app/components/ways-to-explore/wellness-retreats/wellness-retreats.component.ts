import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { SearchBarComponent } from '../../search-bar/search-bar.component';

@Component({
  selector: 'app-wellness-retreats',
  standalone: true,
  imports: [SearchBarComponent, MatTabsModule],
  templateUrl: './wellness-retreats.component.html',
  styleUrl: './wellness-retreats.component.css'
})
export class WellnessRetreatsComponent {

}
