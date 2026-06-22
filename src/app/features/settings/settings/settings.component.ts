import { Component, OnInit, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


interface SettingsCard {
  icon: string;
  title: string;
  description: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NgFor, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.less',
})
export class SettingsComponent implements OnInit {

  readonly cards: SettingsCard[] = [
    { icon: 'admin_panel_settings', title: 'Roles', description: 'Manage user roles and access levels', route: '/settings/roles', color: '#1565C0' },
    { icon: 'lock', title: 'Permissions', description: 'Configure module-level permissions', route: '/settings/permissions', color: '#512da8' },
    { icon: 'group', title: 'Users', description: 'Manage system users and assignments', route: '/settings/users', color: '#00796b' },
    { icon: 'tune', title: 'System Config', description: 'Company settings and preferences', route: '/settings/system-config', color: '#e65100' },
    { icon: 'history', title: 'Audit Logs', description: 'View system activity and changes', route: '/settings/audit-logs', color: '#c62828' },
    { icon: 'email', title: 'Email Templates', description: 'Manage notification email templates', route: '/settings/email-templates', color: '#0277bd' },
  ];

  ngOnInit() {
  }
}
