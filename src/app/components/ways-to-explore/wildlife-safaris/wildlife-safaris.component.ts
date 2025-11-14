import { Component } from '@angular/core';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-wildlife-safaris',
  standalone: true,
  imports: [SearchBarComponent, MatTabsModule],
  templateUrl: './wildlife-safaris.component.html',
  styleUrl: './wildlife-safaris.component.css'
})
export class WildlifeSafarisComponent {

}
