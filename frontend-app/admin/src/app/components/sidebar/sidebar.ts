import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  @Input() isOpen = false;

  logout() {
    // Example logout behavior
    console.log('Logging out...');
    // navigate to login if you have router
    // this.router.navigate(['/login']);
  }
}
