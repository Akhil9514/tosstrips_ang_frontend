import { Component } from '@angular/core';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { MatTabsModule } from '@angular/material/tabs';


@Component({
  selector: 'app-sailing-tours',
  standalone: true,
  imports: [SearchBarComponent, MatTabsModule],
  templateUrl: './sailing-tours.component.html',
  styleUrl: './sailing-tours.component.css'
})
export class SailingToursComponent {

}
