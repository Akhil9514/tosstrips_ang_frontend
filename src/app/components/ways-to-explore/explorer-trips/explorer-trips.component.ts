import { Component } from '@angular/core';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-explorer-trips',
  standalone: true,
  imports: [MatTabsModule,SearchBarComponent],
  templateUrl: './explorer-trips.component.html',
  styleUrl: './explorer-trips.component.css'
})
export class ExplorerTripsComponent {

}
