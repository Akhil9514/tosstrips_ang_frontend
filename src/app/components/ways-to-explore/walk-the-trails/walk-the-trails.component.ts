import { Component, AfterViewInit, Inject, PLATFORM_ID, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-walk-the-trails',
  standalone: true,
  imports: [SearchBarComponent, MatTabsModule],
  templateUrl: './walk-the-trails.component.html',
  styleUrl: './walk-the-trails.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WalkTheTrailsComponent implements AfterViewInit {

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