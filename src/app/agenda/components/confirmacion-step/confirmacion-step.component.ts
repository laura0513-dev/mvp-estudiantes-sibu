import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  EstadoCita,
  HorariosPorFranja,
  ModalidadOpcion,
} from '../../../shared/models/cita.model';

@Component({
  selector: 'app-confirmacion-step',
  templateUrl: './confirmacion-step.component.html',
  styleUrls: ['./confirmacion-step.component.scss'],
})
export class ConfirmacionStepComponent {
  @Input() citaForm!: FormGroup;
  @Input() modalidades!: ModalidadOpcion[];
  @Input() horarios!: HorariosPorFranja;
  @Input() estado!: EstadoCita;
  @Input() codigoConfirmacion: string | null = null;

  @Output() asignar = new EventEmitter<void>();

  get modalidadSeleccionada(): ModalidadOpcion | undefined {
    const valor = this.citaForm.get('modalidad.tipo')?.value;
    return this.modalidades.find((opcion) => opcion.valor === valor);
  }

  get fechaSeleccionada(): Date | null {
    return this.citaForm.get('horarios.fechaSeleccionada')?.value ?? null;
  }

  get horarioSeleccionado() {
    const id = this.citaForm.get('horarios.horarioId')?.value;
    if (!id) {
      return undefined;
    }
    return [...this.horarios.manana, ...this.horarios.tarde].find((h) => h.id === id);
  }

  get puedeAsignar(): boolean {
    return this.citaForm.valid && this.estado === 'pendiente';
  }

  onAsignar(): void {
    if (this.puedeAsignar) {
      this.asignar.emit();
    }
  }
}
