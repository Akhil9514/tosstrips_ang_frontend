import { Component } from '@angular/core';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-feel-the-culture',
  standalone: true,
  imports: [SearchBarComponent, MatTabsModule],
  templateUrl: './feel-the-culture.component.html',
  styleUrl: './feel-the-culture.component.css'
})
export class FeelTheCultureComponent {

}
