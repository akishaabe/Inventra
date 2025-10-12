import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  onMenuClick() {
    this.toggleSidebar.emit();
  }
}
