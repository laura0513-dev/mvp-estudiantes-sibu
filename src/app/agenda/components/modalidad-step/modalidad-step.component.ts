import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalidadOpcion } from '../../../shared/models/cita.model';

@Component({
  selector: 'app-modalidad-step',
  templateUrl: './modalidad-step.component.html',
  styleUrls: ['./modalidad-step.component.scss'],
})
export class ModalidadStepComponent {
  /** Sub-formulario del formulario padre (control "tipo"). No se resetea al navegar entre pasos. */
  @Input() formGroup!: FormGroup;
  @Input() opciones!: ModalidadOpcion[];

  get control() {
    return this.formGroup.get('tipo');
  }

  get muestraError(): boolean {
    return !!this.control && this.control.invalid && (this.control.touched || this.control.dirty);
  }

  trackByValor(_index: number, opcion: ModalidadOpcion): string {
    return opcion.valor;
  }
}
