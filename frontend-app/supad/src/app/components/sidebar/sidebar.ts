import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
    localStorage.removeItem('twofaEmail');
    localStorage.removeItem('twofaCode');
    this.router.navigate(['/login']);
  }
}
