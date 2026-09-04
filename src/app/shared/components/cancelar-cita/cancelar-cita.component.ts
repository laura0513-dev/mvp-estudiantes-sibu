import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CitaEstadoService } from '../../services/cita-estado.service';
import { CancelarCitaDialogComponent } from '../cancelar-cita-dialog/cancelar-cita-dialog.component';

@Component({
  selector: 'app-cancelar-cita',
  templateUrl: './cancelar-cita.component.html',
  styleUrls: ['./cancelar-cita.component.scss'],
})
export class CancelarCitaComponent {
  readonly intentosRestantes$: Observable<number> = this.citaEstadoService.intentosRestantes$;

  constructor(
    private readonly dialog: MatDialog,
    private readonly citaEstadoService: CitaEstadoService,
  ) {}

  abrirDialogoCancelacion(): void {
    const dialogRef = this.dialog.open(CancelarCitaDialogComponent, {
      data: { intentosRestantes: this.citaEstadoService.intentosRestantes },
      ariaLabel: 'Confirmar cancelación de cita',
    });
    dialogRef.afterClosed().subscribe((confirmado: boolean | undefined) => {
      if (confirmado) {
        this.citaEstadoService.cancelarCita();
      }
    });
  }
}
