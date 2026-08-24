import { ElementRef, Component, QueryList, ViewChildren, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatStepperModule } from '@angular/material/stepper';

import { ConfirmacionStepComponent } from './steps/confirmacion-step/confirmacion-step.component';
import { FechaStepComponent } from './steps/fecha-step/fecha-step.component';
import { ModalidadStepComponent } from './steps/modalidad-step/modalidad-step.component';
import { TrabajadorHoraStepComponent } from './steps/trabajador-hora-step/trabajador-hora-step.component';

import { EstadoCita, HorariosPorFranja, Modalidad } from './models/cita.model';
import { AgendamientoMockService } from './services/agendamiento-mock.service';
import { MatDatepickerIntlEs } from './services/mat-datepicker-intl-es';

interface PasoMeta {
  etiqueta: string;
  encabezado: string;
}

@Component({
  selector: 'app-agendamiento-citas',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatSnackBarModule,
    ModalidadStepComponent,
    FechaStepComponent,
    TrabajadorHoraStepComponent,
    ConfirmacionStepComponent,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MatDatepickerIntl, useClass: MatDatepickerIntlEs },
  ],
  templateUrl: './agendamiento-citas.component.html',
  styleUrl: './agendamiento-citas.component.scss',
})
export class AgendamientoCitasComponent {
  private readonly agendamientoMock = inject(AgendamientoMockService);
  private readonly snackBar = inject(MatSnackBar);

  @ViewChildren('stepHeading') private readonly stepHeadings!: QueryList<ElementRef<HTMLElement>>;

  readonly modalidades = this.agendamientoMock.getModalidades();
  readonly fechaMasProxima = this.agendamientoMock.getFechaMasProxima();
  readonly dateFilter = this.agendamientoMock.esFechaDisponible;

  readonly horarios = signal<HorariosPorFranja>({ manana: [], tarde: [] });
  readonly estadoCita = signal<EstadoCita>('pendiente');
  readonly codigoConfirmacion = signal<string | null>(null);

  readonly pasos: PasoMeta[] = [
    { etiqueta: 'Modalidad', encabezado: 'Paso 1 de 4: Modalidad de la cita' },
    { etiqueta: 'Fecha', encabezado: 'Paso 2 de 4: Selección de fecha' },
    { etiqueta: 'Trabajador y hora', encabezado: 'Paso 3 de 4: Trabajador social y hora' },
    { etiqueta: 'Confirmación', encabezado: 'Paso 4 de 4: Confirmación y asignación' },
  ];

  /** Un único FormGroup padre: navegar entre pasos nunca resetea lo ya seleccionado. */
  readonly citaForm = new FormGroup({
    modalidad: new FormGroup({
      tipo: new FormControl<Modalidad | null>(null, { validators: Validators.required }),
    }),
    fecha: new FormGroup({
      fechaSeleccionada: new FormControl<Date | null>(this.fechaMasProxima, {
        validators: Validators.required,
      }),
    }),
    trabajadorHora: new FormGroup({
      horarioId: new FormControl<string | null>(null, { validators: Validators.required }),
    }),
  });

  get modalidadGroup(): FormGroup {
    return this.citaForm.get('modalidad') as FormGroup;
  }

  get fechaGroup(): FormGroup {
    return this.citaForm.get('fecha') as FormGroup;
  }

  get trabajadorHoraGroup(): FormGroup {
    return this.citaForm.get('trabajadorHora') as FormGroup;
  }

  constructor() {
    this.agendamientoMock.getHorariosDisponibles(this.fechaMasProxima).subscribe((horarios) => {
      this.horarios.set(horarios);
    });
  }

  /** Mueve el foco al encabezado del paso al que se navega (adelante o atrás, con teclado o mouse). */
  onStepChange(evento: StepperSelectionEvent): void {
    const encabezado = this.stepHeadings.get(evento.selectedIndex);
    if (encabezado) {
      // Se difiere al siguiente ciclo para asegurar que el contenido del paso ya esté visible.
      setTimeout(() => encabezado.nativeElement.focus());
    }
  }

  onAsignar(): void {
    if (this.citaForm.invalid || this.estadoCita() === 'asignando') {
      return;
    }
    this.estadoCita.set('asignando');
    this.agendamientoMock.asignarCita().subscribe((resultado) => {
      this.estadoCita.set('asignada');
      this.codigoConfirmacion.set(resultado.codigoConfirmacion);
      this.snackBar.open(resultado.mensaje, 'Cerrar', {
        duration: 8000,
        politeness: 'polite',
      });
    });
  }
}
