import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as pokemon from '../../models/pokemon';
import { Pokemon } from '../../models/pokemon';

// export interface ProfileData {
//   username: string;
//   avatarUrl: string | null;
// }



@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile-dialog.html',
  styleUrl: './profile-dialog.css',
})
export class ProfileDialog implements OnInit {
  @Input() initialUsername = '';
  @Input() initialAvatar: number | null = null;

  username = '';
  selectedAvatar: number | null = null;
  currentDataset: Pokemon[] = [];
  searchTerm = '';

  url = pokemon.avatarUrl;

  ngOnInit() {
    this.username = this.initialUsername;
    this.selectedAvatar = this.initialAvatar;
    this.filterAvatars();
  }


  filterAvatars() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.currentDataset = pokemon.DB;
      return;
    }

    const idFilter = parseInt(term, 10);
    const isNumber = !isNaN(idFilter) && idFilter.toString() === term;

    this.currentDataset = pokemon.DB.filter(p => {
      if (isNumber && p.id === idFilter) {
        return true;
      }
      return p.name.toLowerCase().includes(term);
    });
  }


  onSave() {
    // TODO!()
    // if (!this.username.trim()) return;
    // this.save.emit({
    //   username: this.username.trim(),
    //   avatarUrl: this.selectedAvatar
    // });
  }

  onClose() {
    //this.close.emit();
  }
}
