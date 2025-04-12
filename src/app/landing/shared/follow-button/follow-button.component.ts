import { Component, Input } from '@angular/core';
import { UserFollowService } from '../../../core/services/user-follow.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-follow-button',
  templateUrl: './follow-button.component.html',
  styleUrls: ['./follow-button.component.scss'],
  imports: [CommonModule],
})
export class FollowButtonComponent {
  @Input() currentUserId!: number; // ID de l'usuari loguejat
  @Input() targetUserId!: number;  // ID de l'usuari que vols seguir
  @Input() isFollowing!: boolean;  // Estat inicial (true o false)

  loading = false;

  constructor(private followService: UserFollowService) {}

  toggleFollow() {
    this.loading = true;

    const action = this.isFollowing
      ? this.followService.unfollowUser(this.currentUserId, this.targetUserId)
      : this.followService.followUser(this.currentUserId, this.targetUserId);

    action.subscribe({
      next: () => {
        this.isFollowing = !this.isFollowing;
        this.loading = false;
      },
      error: () => {
        // Aquí pots afegir un Toastr o alerta
        console.error('Error canviant seguiment');
        this.loading = false;
      }
    });
  }
}
