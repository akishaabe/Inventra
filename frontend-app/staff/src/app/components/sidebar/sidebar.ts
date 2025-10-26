import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule], // ← ADD THIS LINE
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  @Input() isOpen = false;

  logout() {
    localStorage.clear();
    document.cookie = 'inventra_user=; Max-Age=0; Path=/; SameSite=Lax';
    window.location.href = `${environment.sharedBase}/`;
  }
}
