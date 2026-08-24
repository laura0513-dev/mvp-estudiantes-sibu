import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/agendamiento-citas/agendamiento-citas.component').then(
        (m) => m.AgendamientoCitasComponent,
      ),
    title: 'Agendar cita con trabajador social',
  },
];
