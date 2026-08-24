import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-fecha-step',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './fecha-step.component.html',
  styleUrl: './fecha-step.component.scss',
})
export class FechaStepComponent {
  /** Sub-formulario del formulario padre (control "fechaSeleccionada"). */
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) fechaMasProxima!: Date;
  @Input({ required: true }) dateFilter!: (fecha: Date | null) => boolean;

  get control() {
    return this.formGroup.get('fechaSeleccionada');
  }

  get muestraError(): boolean {
    return !!this.control && this.control.invalid && (this.control.touched || this.control.dirty);
  }

  usaFechaMasProxima(): void {
    this.control?.setValue(this.fechaMasProxima);
    this.control?.markAsTouched();
  }

  esFechaProximaSeleccionada(): boolean {
    const valor: Date | null = this.control?.value ?? null;
    return !!valor && valor.toDateString() === this.fechaMasProxima.toDateString();
  }
}
