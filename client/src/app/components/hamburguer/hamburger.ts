import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hamburger',
  templateUrl: './hamburger.html',
  styleUrls: ['./hamburger.css']
})
export class Hamburger {
  @Input() isOpen: boolean = false;
}
