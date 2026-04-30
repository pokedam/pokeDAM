import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-modal.html',
  styleUrl: './error-modal.css'
})
export class ErrorModal {
  errorService = inject(ErrorService);

  close() {
    this.errorService.clear();
  }
}
