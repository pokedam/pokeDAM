import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-presentation',
  imports: [ RouterLink],
  templateUrl: './presentation.html',
  styleUrl: './presentation.css',
})
export class Presentation {

  private router = inject(Router);
  private route = inject(ActivatedRoute);


  onSettings() {
    this.router.navigate(['settings'], { relativeTo: this.route });
  }

}
