import { Component, inject } from '@angular/core';
import { GroupService } from '../../services/group.service';

@Component({
  selector: 'app-clock',
  standalone: true,
  template: `
    <div class="retro-box clock" [class.hurry]="group.timeLeft() <= 10">
      {{ group.timeLeft() }}
    </div>
  `,
  styleUrl: './clock.css'
})
export class ClockComponent {
  group = inject(GroupService);
}
