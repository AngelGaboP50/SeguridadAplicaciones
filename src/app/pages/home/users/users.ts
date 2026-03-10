import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';

import { MessageService } from 'primeng/api';

type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined;

import { AuthService } from '../../../services/auth.service';

type Role = 'admin' | 'user';
type Status = 'Activo' | 'Pausado' | 'Inactivo';

export interface UserTicket {
  id: string;
  title: string;
  description: string;
  state: 'Pendiente' | 'En progreso' | 'Revisión' | 'Hecho' | 'Bloqueado';
  priority: string;
  assignee: string;
  dueDate: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    CardModule,
    AvatarModule,
    DividerModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    TagModule,
    ToolbarModule,
    PanelModule,
    ToastModule,
    DialogModule
  ],
  providers: [MessageService],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users {

  private auth = inject(AuthService);
  private msg = inject(MessageService);

  currentUser = this.getUserSafe();

  q = '';

  editDialogVisible = false;
  editingUser: any = {};

  openEdit() {
    this.editingUser = { ...this.currentUser };
    this.editDialogVisible = true;
  }

  saveEdit() {
    this.currentUser = { ...this.currentUser, ...this.editingUser };
    this.editDialogVisible = false;
    this.msg.add({ severity: 'success', summary: 'Actualizado', detail: 'Datos del usuario guardados' });
  }

  deactivateUser() {
    this.currentUser.status = 'Inactivo';
    this.msg.add({ severity: 'warn', summary: 'Usuario dado de baja', detail: 'El usuario ha sido desactivado exitosamente' });
  }

  activity = [
    { action: 'Inicio de sesión', date: 'Hoy', status: 'OK' },
    { action: 'Accedió a Users', date: 'Hoy', status: 'OK' },
    { action: 'Accedió a Groups', date: 'Hoy', status: 'OK' },
    { action: 'Cambió vista', date: 'Hoy', status: 'OK' }
  ];

  permissions = this.currentUser.permissions.map(p => {
    let module = 'General';
    if (p.startsWith('group')) module = 'Groups';
    if (p.startsWith('ticket')) module = 'Ticket';
    if (p.startsWith('user')) module = 'Users';
    return {
      module,
      name: p,
      role: this.currentUser.role,
      status: 'Activo' as Status
    };
  });

  // Signal computed
  filteredPermissions = computed(() => {
    const s = this.q.trim().toLowerCase();
    if (!s) return this.permissions;
    return this.permissions.filter(p => p.name.toLowerCase().includes(s) || p.module?.toLowerCase().includes(s));
  });

  roleSeverity(role: Role): TagSeverity {
    return role === 'admin' ? 'info' : 'warn';
  }

  statusSeverity(status: Status): TagSeverity {
    if (status === 'Activo') return 'success';
    if (status === 'Pausado') return 'warn';
    return 'danger';
  }

  showToast() {
    this.msg.add({
      severity: 'success',
      summary: 'Perfil cargado',
      detail: 'Usuario cargado correctamente'
    });
  }

  private getUserSafe() {
    const u = this.auth.currentUser();

    const email = u?.email || 'pansotic29@gmail.com';

    return {
      username: u?.username || 'Panso',
      fullName: u?.fullName || 'Panso TIC',
      email,
      phone: u?.phone || '4420000000',
      address: 'Querétaro, México', // Assuming address and birthDate are static or not in auth user for now
      birthDate: '1990-01-01',
      role: (u?.role || 'admin') as Role,
      status: 'Activo' as Status,
      permissions: u?.permissions || [
        'group:view', 'group:edit', 'group:add', 'group:delete',
        'ticket:view', 'ticket:edit', 'ticket:add', 'ticket:delete', 'ticket:edit_state',
        'user:view', 'users:view', 'user:edit', 'user:add', 'user:delete'
      ]
    };
  }

  // --- MOCK TICKETS ---
  assignedTickets: UserTicket[] = [
    {
      id: 'TK-1001',
      title: 'Actualizar dependencias del proyecto',
      description: 'Llevar Angular a la última versión',
      state: 'Pendiente',
      priority: 'Alta (Alta)',
      assignee: 'Panso TIC',
      dueDate: '2026-03-15'
    },
    {
      id: 'TK-1002',
      title: 'Corregir error de login',
      description: 'El token expira muy rápido',
      state: 'En progreso',
      priority: 'Urgente (Urgente)',
      assignee: 'Panso TIC',
      dueDate: '2026-03-11'
    },
    {
      id: 'TK-1003',
      title: 'Rediseñar vista de usuarios',
      description: 'Añadir la sección de tickets asignados',
      state: 'Hecho',
      priority: 'Media (Media)',
      assignee: 'Panso TIC',
      dueDate: '2026-03-10'
    },
    {
      id: 'TK-1004',
      title: 'Validar permisos en API',
      description: 'Revisar endpoints',
      state: 'Pendiente',
      priority: 'Baja (Baja)',
      assignee: 'Panso TIC',
      dueDate: '2026-03-20'
    }
  ];

  // --- COMPUTED SUMMARIES ---
  get totalTickets() { return this.assignedTickets.length; }
  get pendingTickets() { return this.assignedTickets.filter(t => t.state === 'Pendiente').length; }
  get progressTickets() { return this.assignedTickets.filter(t => t.state === 'En progreso').length; }
  get doneTickets() { return this.assignedTickets.filter(t => t.state === 'Hecho').length; }
  get blockedTickets() { return this.assignedTickets.filter(t => t.state === 'Bloqueado').length; }

  getPrioritySeverity(priority: string): TagSeverity {
    if (priority.includes('Urgente')) return 'danger';
    if (priority.includes('Alta')) return 'warn';
    if (priority.includes('Baja')) return 'info';
    return 'success';
  }
}