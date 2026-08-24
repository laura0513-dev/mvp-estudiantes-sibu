import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { HorariosPorFranja } from '../../models/cita.model';

@Component({
  selector: 'app-trabajador-hora-step',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './trabajador-hora-step.component.html',
  styleUrl: './trabajador-hora-step.component.scss',
})
export class TrabajadorHoraStepComponent {
  /** Sub-formulario del formulario padre (control "horarioId"). */
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) horarios!: HorariosPorFranja;

  get control() {
    return this.formGroup.get('horarioId');
  }

  get muestraError(): boolean {
    return !!this.control && this.control.invalid && (this.control.touched || this.control.dirty);
  }
}
