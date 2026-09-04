import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { CancelarCitaComponent } from './components/cancelar-cita/cancelar-cita.component';
import { CancelarCitaDialogComponent } from './components/cancelar-cita-dialog/cancelar-cita-dialog.component';

/**
 * Componentes reutilizados por más de un feature: `CancelarCitaComponent` se usa tanto desde
 * "Mi Cita" como desde el último paso del stepper de "Agenda" (confirmación). Los modelos y
 * servicios ya son compartibles sin necesidad de módulo (son providedIn: 'root' o solo tipos),
 * pero un componente sí necesita declararse en un NgModule para poder usarse en más de un
 * feature module.
 */
@NgModule({
  declarations: [CancelarCitaComponent, CancelarCitaDialogComponent],
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  exports: [CancelarCitaComponent],
})
export class SharedModule {}
