import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  @Input() isOpen = false;

  constructor(private router: Router) {}

  // ✅ This fixes the missing logout() function
  logout() {
    localStorage.removeItem('twofaEmail');
    localStorage.removeItem('twofaCode');
    this.router.navigate(['/login']);
  }
}
