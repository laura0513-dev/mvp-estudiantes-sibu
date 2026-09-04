import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface CancelarCitaDialogData {
  intentosRestantes: number;
}

@Component({
  selector: 'app-cancelar-cita-dialog',
  templateUrl: './cancelar-cita-dialog.component.html',
  styleUrls: ['./cancelar-cita-dialog.component.scss'],
})
export class CancelarCitaDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<CancelarCitaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: CancelarCitaDialogData,
  ) {}

  confirmar(): void {
    this.dialogRef.close(true);
  }

  rechazar(): void {
    this.dialogRef.close(false);
  }
}
