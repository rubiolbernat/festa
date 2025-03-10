import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../dashboard/components/header/header.component';
import { SidebarComponent } from '../../dashboard/components/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard-layout',
  imports: [HeaderComponent, SidebarComponent, RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {

}
