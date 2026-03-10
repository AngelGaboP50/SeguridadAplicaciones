import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { AuthService } from '../../../services/auth.service';

type Estatus = 'Activo' | 'Pausado' | 'Inactivo';
type Nivel = 'Básico' | 'Intermedio' | 'Avanzado';

type GroupRow = {
  nombre: string;
  nivel: Nivel;
  autor: string;
  users: { email: string; name: string }[];
  tickets: number;
  descripcion: string;
  estatus: Estatus;
};

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    InputTextModule,
    ToolbarModule,
    DialogModule,
    SelectModule,
    InputNumberModule,
    TextareaModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './groups.html',
  styleUrls: ['./groups.css']
})
export class Groups {
  private msg = inject(MessageService);
  private auth = inject(AuthService);

  currentUser = this.auth.currentUser();

  q = '';

  nivelOptions = [
    { label: 'Básico', value: 'Básico' as Nivel },
    { label: 'Intermedio', value: 'Intermedio' as Nivel },
    { label: 'Avanzado', value: 'Avanzado' as Nivel }
  ];

  statusOptions = [
    { label: 'Activo', value: 'Activo' as Estatus },
    { label: 'Pausado', value: 'Pausado' as Estatus },
    { label: 'Inactivo', value: 'Inactivo' as Estatus }
  ];

  groups: GroupRow[] = [
    {
      nombre: 'Administradores',
      nivel: 'Avanzado',
      autor: 'ERP System',
      users: [
        { email: 'pansotic29@gmail.com', name: 'Panso TIC' },
        { email: 'admin2@ejemplo.com', name: 'Admin Dos' },
        { email: 'admin3@ejemplo.com', name: 'Admin Tres' }
      ],
      tickets: 12,
      descripcion: 'Acceso total al sistema.',
      estatus: 'Activo'
    },
    {
      nombre: 'Ventas',
      nivel: 'Intermedio',
      autor: 'ERP System',
      users: [
        { email: 'ventas1@ejemplo.com', name: 'Laura Ventas' },
        { email: 'ventas2@ejemplo.com', name: 'Carlos Ventas' }
      ],
      tickets: 7,
      descripcion: 'Gestión de ventas y reportes.',
      estatus: 'Activo'
    },
    {
      nombre: 'Soporte',
      nivel: 'Intermedio',
      autor: 'ERP System',
      users: [
        { email: 'soporte1@ejemplo.com', name: 'Ana Soporte' },
        { email: 'soporte2@ejemplo.com', name: 'Luis Soporte' }
      ],
      tickets: 21,
      descripcion: 'Atención a incidencias.',
      estatus: 'Activo'
    },
    {
      nombre: 'Invitados',
      nivel: 'Básico',
      autor: 'ERP System',
      users: [
        { email: 'invitado1@ejemplo.com', name: 'Invitado Uno' }
      ],
      tickets: 0,
      descripcion: 'Acceso limitado.',
      estatus: 'Pausado'
    }
  ];

  filtered = computed(() => {
    const s = this.q.trim().toLowerCase();
    if (!s) return this.groups;
    return this.groups.filter(g => g.nombre.toLowerCase().includes(s));
  });

  statusSeverity(status: Estatus): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch (status) {
      case 'Activo': return 'success';
      case 'Pausado': return 'warn';
      case 'Inactivo': return 'danger';
      default: return 'info';
    }
  }

  // --- Modal  (CRUD visual)
  dialogOpen = false;
  isEdit = false;
  editIndex = -1;

  draft: GroupRow = this.emptyDraft();

  openCreate() {
    this.isEdit = false;
    this.editIndex = -1;
    this.draft = this.emptyDraft();
    this.dialogOpen = true;
  }

  openEdit(row: GroupRow) {
    this.isEdit = true;
    this.editIndex = this.groups.indexOf(row);
    this.draft = { ...row };
    this.dialogOpen = true;
  }

  save() {
    if (this.isEdit && this.editIndex >= 0) {
      this.groups[this.editIndex] = { ...this.draft };
      this.groups = [...this.groups];
    } else {
      this.groups = [{ ...this.draft }, ...this.groups];
    }
    this.dialogOpen = false;
  }

  remove(row: GroupRow) {
    this.groups = this.groups.filter(g => g !== row);
    this.msg.add({ severity: 'success', summary: 'Grupo eliminado', detail: 'El grupo ha sido eliminado exitosamente' });
  }

  // --- User Management in Draft ---
  newUserEmail: string = '';

  addUserToGroup() {
    if (!this.newUserEmail || !this.newUserEmail.includes('@')) {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'Email inválido' });
      return;
    }

    // Check if already exists
    if (this.draft.users.some(u => u.email === this.newUserEmail)) {
      this.msg.add({ severity: 'warn', summary: 'Usuario Existente', detail: 'Este usuario ya está en el grupo' });
      return;
    }

    // Add with a default name for now
    this.draft.users.unshift({
      email: this.newUserEmail,
      name: this.newUserEmail.split('@')[0]
    });
    this.newUserEmail = '';
  }

  removeUserFromGroup(email: string) {
    this.draft.users = this.draft.users.filter(u => u.email !== email);
  }

  private emptyDraft(): GroupRow {
    return {
      nombre: '',
      nivel: 'Básico',
      autor: 'ERP System',
      users: [],
      tickets: 0,
      descripcion: '',
      estatus: 'Activo'
    };
  }
}