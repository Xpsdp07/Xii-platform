import { AfterViewInit, Component } from '@angular/core';
import lottie from 'lottie-web';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    lottie.loadAnimation({
      container: document.getElementById('lottie-animation')!,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/lottie/animation.json'
    });
  }
}
