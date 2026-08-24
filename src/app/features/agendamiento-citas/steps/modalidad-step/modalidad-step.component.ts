import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { ModalidadOpcion } from '../../models/cita.model';

@Component({
  selector: 'app-modalidad-step',
  standalone: true,
  imports: [ReactiveFormsModule, MatRadioModule, MatIconModule],
  templateUrl: './modalidad-step.component.html',
  styleUrl: './modalidad-step.component.scss',
})
export class ModalidadStepComponent {
  /** Sub-formulario del formulario padre (control "tipo"). No se resetea al navegar entre pasos. */
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) opciones!: ModalidadOpcion[];

  get control() {
    return this.formGroup.get('tipo');
  }

  get muestraError(): boolean {
    return !!this.control && this.control.invalid && (this.control.touched || this.control.dirty);
  }

  descripcionId(valor: string): string {
    return `modalidad-desc-${valor}`;
  }
}
