import { CommonModule } from '@angular/common';
import { Component, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-commentaries',
  imports: [CommonModule, FormsModule],
  templateUrl: './commentaries.component.html',
  styleUrl: './commentaries.component.css'
})
export class CommentariesComponent {

  public others = output<string>();

  comentaries = signal<string>('');

  onCommentariesChange() {
    let formattedComment: string;
    if (this.comentaries().length > 0) {
      formattedComment = this.comentaries()[0].toUpperCase() + this.comentaries().slice(1);
    }
    else {
      formattedComment = '';
    }
    this.others.emit(formattedComment);
  }

}
