import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { pokemonDataset } from './pokemon-dataset';

export interface ProfileData {
  username: string;
  avatarUrl: string | null;
}

const POKEMON_DATASET = [
  {
    "id": 2,
    "nombre": "ivysaur",
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png"
  },
];

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

  // Lista de avatares (IDs de Pokémon) desde JSON
  allAvatars: { id: number, name: string, url: string }[] = [];
  availableAvatars: { id: number, name: string, url: string }[] = [];
  
  searchTerm = '';

  ngOnInit() {
    this.username = this.initialUsername;
    this.selectedAvatar = this.initialAvatarUrl;
    this.loadPokemonAvatars();
  }

  loadPokemonAvatars() {
    this.allAvatars = pokemonDataset.map((p: any) => ({
      id: p.id,
      name: p.nombre.charAt(0).toUpperCase() + p.nombre.slice(1),
      url: p.sprite
    }));
    this.availableAvatars = this.allAvatars;
  }

  filterAvatars() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.availableAvatars = this.allAvatars;
      return;
    }
    
    const idFilter = parseInt(term, 10);
    const isNumber = !isNaN(idFilter) && idFilter.toString() === term;

    this.availableAvatars = this.allAvatars.filter(p => {
      if (isNumber && p.id === idFilter) {
        return true;
      }
      return p.name.toLowerCase().includes(term);
    });
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
