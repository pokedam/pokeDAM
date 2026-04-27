import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-content-header',
    templateUrl: './content-header.html',
    styleUrls: ['./content-header.css']
})
export class ContentHeader {
    @Input() title: string = '';
}
