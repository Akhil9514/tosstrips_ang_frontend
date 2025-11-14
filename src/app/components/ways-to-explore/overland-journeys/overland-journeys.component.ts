import { Component } from '@angular/core';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-overland-journeys',
  standalone: true,
  imports: [SearchBarComponent, MatTabsModule],
  templateUrl: './overland-journeys.component.html',
  styleUrl: './overland-journeys.component.css'
})
export class OverlandJourneysComponent {

}
