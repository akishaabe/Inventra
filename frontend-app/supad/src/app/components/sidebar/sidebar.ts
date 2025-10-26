import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  @Input() isOpen = false;

  constructor(private router: Router) {}

  logout() {
    localStorage.clear();
    document.cookie = 'inventra_user=; Max-Age=0; Path=/; SameSite=Lax';
    window.location.href = `${environment.sharedBase}/`;
  }
}
