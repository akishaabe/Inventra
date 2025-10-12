import { Component, EventEmitter, Output } from '@angular/core';
<<<<<<< HEAD
import { CommonModule } from '@angular/common';
=======
import { RouterLink } from '@angular/router';
>>>>>>> 7f9d4f7e5fcd206e74f15f7b1f478fc0f599b1ee

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  imports: [RouterLink],
  styleUrls: ['./navbar.css']
})
export class Navbar {
  @Output() toggleSidebar = new EventEmitter<void>();

  onMenuClick() {
    this.toggleSidebar.emit();
  }
}
