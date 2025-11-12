import { Component } from '@angular/core';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-win-an-adventure',
  standalone: true,
  imports: [SearchBarComponent],
  templateUrl: './win-an-adventure.component.html',
  styleUrl: './win-an-adventure.component.css'
})
export class WinAnAdventureComponent {

}
