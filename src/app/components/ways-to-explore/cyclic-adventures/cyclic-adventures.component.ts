import { Component, AfterViewInit, Inject, PLATFORM_ID, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-cyclic-adventures',
  standalone: true,
  imports: [SearchBarComponent, MatTabsModule],
  templateUrl: './cyclic-adventures.component.html',
  styleUrl: './cyclic-adventures.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CyclicAdventuresComponent implements AfterViewInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Only initialize — no config here
      customElements.whenDefined('swiper-container').then(() => {
        const el = document.querySelector('swiper-container');
        if (el && !el.swiper) {
          el.initialize();
        }
      });
    }
  }
}