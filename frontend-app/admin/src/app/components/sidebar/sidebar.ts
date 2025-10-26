import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
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
    localStorage.clear();
    document.cookie = 'inventra_user=; Max-Age=0; Path=/; SameSite=Lax';
    window.location.href = `${environment.sharedBase}/`;
  }
}
