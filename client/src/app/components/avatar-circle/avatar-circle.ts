import { Component, Input } from '@angular/core';
import { pokemonSpriteUrl } from 'shared_types';

@Component({
    selector: 'app-avatar-circle',
    templateUrl: './avatar-circle.html',
    styleUrls: ['./avatar-circle.css']
})
export class AvatarCircle {
    @Input() avatar: number | string = '?';


    get avatarUrl(): string | null {
        return typeof this.avatar === 'number' ? pokemonSpriteUrl(this.avatar) : null;
    }

    get initial(): string | null {
        return typeof this.avatar === 'string' ? this.avatar.charAt(0).toUpperCase() : null;
    }
}