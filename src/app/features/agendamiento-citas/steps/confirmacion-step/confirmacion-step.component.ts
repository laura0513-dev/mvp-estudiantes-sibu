import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  EstadoCita,
  HorariosPorFranja,
  ModalidadOpcion,
} from '../../models/cita.model';

@Component({
  selector: 'app-confirmacion-step',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './confirmacion-step.component.html',
  styleUrl: './confirmacion-step.component.scss',
})
export class ConfirmacionStepComponent {
  @Input({ required: true }) citaForm!: FormGroup;
  @Input({ required: true }) modalidades!: ModalidadOpcion[];
  @Input({ required: true }) horarios!: HorariosPorFranja;
  @Input({ required: true }) estado!: EstadoCita;
  @Input() codigoConfirmacion: string | null = null;

  @Output() asignar = new EventEmitter<void>();

  get modalidadSeleccionada(): ModalidadOpcion | undefined {
    const valor = this.citaForm.get('modalidad.tipo')?.value;
    return this.modalidades.find((opcion) => opcion.valor === valor);
  }

  get fechaSeleccionada(): Date | null {
    return this.citaForm.get('fecha.fechaSeleccionada')?.value ?? null;
  }

  get horarioSeleccionado() {
    const id = this.citaForm.get('trabajadorHora.horarioId')?.value;
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
