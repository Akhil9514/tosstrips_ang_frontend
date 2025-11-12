import { Component } from '@angular/core';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-days-to-come',
  standalone: true,
  imports: [SearchBarComponent],
  templateUrl: './days-to-come.component.html',
  styleUrl: './days-to-come.component.css'
})
export class DaysToComeComponent {

}
