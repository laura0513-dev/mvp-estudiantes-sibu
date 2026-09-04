import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HorarioDisponible, HorariosPorFranja } from '../../../shared/models/cita.model';

@Component({
  selector: 'app-horarios-step',
  templateUrl: './horarios-step.component.html',
  styleUrls: ['./horarios-step.component.scss'],
})
export class HorariosStepComponent {
  /** Sub-formulario del formulario padre (controles "fechaSeleccionada" y "horarioId"). */
  @Input() formGroup!: FormGroup;
  @Input() fechaMasProxima!: Date;
  @Input() dateFilter!: (fecha: Date | null) => boolean;
  @Input() horarios!: HorariosPorFranja;

  /** Se emite cuando el estudiante selecciona un día distinto, para recargar los horarios de ese día. */
  @Output() fechaCambiada = new EventEmitter<Date>();

  get fechaControl() {
    return this.formGroup.get('fechaSeleccionada');
  }

  get horarioControl() {
    return this.formGroup.get('horarioId');
  }

  get fechaSeleccionada(): Date | null {
    return this.fechaControl?.value ?? null;
  }

  get muestraErrorHorario(): boolean {
    return (
      !!this.horarioControl &&
      this.horarioControl.invalid &&
      (this.horarioControl.touched || this.horarioControl.dirty)
    );
  }

  onSeleccionFecha(fecha: Date | null): void {
    if (!fecha) {
      return;
    }
    this.fechaControl?.setValue(fecha);
    this.fechaControl?.markAsTouched();
    this.horarioControl?.reset(null);
    this.fechaCambiada.emit(fecha);
  }

  trackById(_index: number, horario: HorarioDisponible): string {
    return horario.id;
  }
}
