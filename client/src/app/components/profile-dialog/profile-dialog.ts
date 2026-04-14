import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ProfileData {
  username: string;
  avatarUrl: string | null;
}

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile-dialog.html',
  styleUrl: './profile-dialog.css',
})
export class ProfileDialog implements OnInit {
  @Input() initialUsername = '';
  @Input() initialAvatarUrl: string | null = null;
  
  @Output() save = new EventEmitter<ProfileData>();
  @Output() close = new EventEmitter<void>();

  username = '';
  selectedAvatar: string | null = null;

  // Lista de avatares predefinidos (IDs de Pokémon)
  availableAvatars = [
    { id: 25, name: 'Pikachu', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
    { id: 1, name: 'Bulbasaur', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
    { id: 4, name: 'Charmander', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
    { id: 7, name: 'Squirtle', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
    { id: 133, name: 'Eevee', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png' },
    { id: 94, name: 'Gengar', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png' },
    { id: 143, name: 'Snorlax', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png' },
    { id: 151, name: 'Mew', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png' },
    { id: 150, name: 'Mewtwo', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png' },
    { id: 149, name: 'Dragonite', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png' },
    { id: 104, name: 'Cubone', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/104.png' },
    { id: 130, name: 'Gyarados', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png' }
  ];

  ngOnInit() {
    this.username = this.initialUsername;
    this.selectedAvatar = this.initialAvatarUrl;
  }

  selectAvatar(url: string) {
    this.selectedAvatar = url;
  }

  onSave() {
    if (!this.username.trim()) return;
    this.save.emit({
      username: this.username.trim(),
      avatarUrl: this.selectedAvatar
    });
  }

  onClose() {
    this.close.emit();
  }
}
