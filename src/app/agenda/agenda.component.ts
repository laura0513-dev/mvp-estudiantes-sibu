import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Optional,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { MatTabGroup } from '@angular/material/tabs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EstadoCita, HorariosPorFranja, ModalidadOpcion } from '../shared/models/cita.model';
import { AgendamientoMockService } from '../shared/services/agendamiento-mock.service';
import { CitaEstadoService } from '../shared/services/cita-estado.service';

interface PasoMeta {
  etiqueta: string;
  encabezado: string;
}

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.scss'],
})
export class AgendaComponent implements OnInit, OnDestroy {
  /** Por debajo de este ancho el stepper pasa a orientación vertical (modo acordeón nativo). */
  private static readonly CONSULTA_MOVIL = '(max-width: 639.98px)';

  @ViewChildren('stepHeading') private stepHeadings!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('stepper') private stepper!: MatStepper;

  private readonly destroyed$ = new Subject<void>();

  /** true por debajo de 640px: controla la orientación del stepper (vertical vs. horizontal). */
  esMovil = false;

  readonly modalidades: ModalidadOpcion[];
  readonly fechaMasProxima: Date;
  readonly dateFilter: (fecha: Date | null) => boolean;

  horarios: HorariosPorFranja = { manana: [], tarde: [] };
  estadoCita: EstadoCita = 'pendiente';
  codigoConfirmacion: string | null = null;

  readonly pasos: PasoMeta[] = [
    { etiqueta: 'Modalidad', encabezado: 'Paso 1 de 3: Modalidad de la cita' },
    { etiqueta: 'Horarios', encabezado: 'Paso 2 de 3: Selección de horario' },
    { etiqueta: 'Confirmación', encabezado: 'Paso 3 de 3: Confirmación y asignación' },
  ];

  /** Un único FormGroup padre: navegar entre pasos nunca resetea lo ya seleccionado. */
  readonly citaForm: FormGroup;

  constructor(
    private readonly agendamientoMock: AgendamientoMockService,
    private readonly citaEstadoService: CitaEstadoService,
    private readonly snackBar: MatSnackBar,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly elementoRaiz: ElementRef<HTMLElement>,
    @Optional() private readonly tabGroup: MatTabGroup | null,
  ) {
    this.modalidades = this.agendamientoMock.getModalidades();
    this.fechaMasProxima = this.agendamientoMock.getFechaMasProxima();
    this.dateFilter = this.agendamientoMock.esFechaDisponible;

    this.citaForm = this.crearFormulario();

    this.cargarHorarios(this.fechaMasProxima);
  }

  ngOnInit(): void {
    this.citaEstadoService.cancelada$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.reiniciarFlujo());

    this.breakpointObserver
      .observe(AgendaComponent.CONSULTA_MOVIL)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((resultado) => {
        this.esMovil = resultado.matches;
      });

    // Bug conocido de Angular Material: un mat-stepper vertical dentro de un mat-tab puede
    // quedar con todos los pasos expandidos si su orientación cambió (por resize) mientras la
    // pestaña "Agenda" estaba oculta (el motor de animaciones no puede calcular alturas con
    // display:none). Al reactivarse esta pestaña, si el stepper vertical ya es visible, se
    // fuerza su recomputación interna para que vuelva a comportarse como acordeón.
    if (this.tabGroup) {
      this.tabGroup.selectedTabChange
        .pipe(takeUntil(this.destroyed$))
        .subscribe(() => this.recalcularStepperSiVisible());
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  get modalidadGroup(): FormGroup {
    return this.citaForm.get('modalidad') as FormGroup;
  }

  get horariosGroup(): FormGroup {
    return this.citaForm.get('horarios') as FormGroup;
  }

  /** Mueve el foco al encabezado del paso al que se navega (adelante o atrás, con teclado o mouse). */
  onStepChange(evento: StepperSelectionEvent): void {
    const encabezado = this.stepHeadings.toArray()[evento.selectedIndex];
    if (encabezado) {
      // Se difiere al siguiente ciclo para asegurar que el contenido del paso ya esté visible.
      setTimeout(() => encabezado.nativeElement.focus());
    }
  }

  onFechaCambiada(fecha: Date): void {
    this.cargarHorarios(fecha);
  }

  onAsignar(): void {
    if (this.citaForm.invalid || this.estadoCita === 'asignando') {
      return;
    }
    this.estadoCita = 'asignando';
    this.agendamientoMock.asignarCita().subscribe((resultado) => {
      this.estadoCita = 'asignada';
      this.codigoConfirmacion = resultado.codigoConfirmacion;

      const modalidad = this.modalidades.find(
        (opcion) => opcion.valor === this.modalidadGroup.get('tipo')?.value,
      );
      const horarioId = this.horariosGroup.get('horarioId')?.value;
      const horario = [...this.horarios.manana, ...this.horarios.tarde].find(
        (h) => h.id === horarioId,
      );
      if (modalidad && horario) {
        this.citaEstadoService.confirmarCita({
          modalidad,
          fecha: this.horariosGroup.get('fechaSeleccionada')!.value,
          horario,
          codigoConfirmacion: resultado.codigoConfirmacion,
          // El enlace de conexión (si la modalidad es virtual) se envía luego por correo
          // institucional, no se genera en el momento de la asignación (ver descripción de
          // la modalidad virtual en AgendamientoMockService.getModalidades()).
          observaciones: '',
        });
      }

      this.snackBar.open(resultado.mensaje, 'Cerrar', {
        duration: 8000,
        politeness: 'polite',
      });
    });
  }

  /** Ver el comentario en ngOnInit sobre el bug de mat-vertical-stepper dentro de mat-tab. */
  private recalcularStepperSiVisible(): void {
    setTimeout(() => {
      if (this.stepper && this.elementoRaiz.nativeElement.offsetParent !== null) {
        this.stepper._stateChanged();
      }
    });
  }

  private cargarHorarios(fecha: Date): void {
    this.agendamientoMock.getHorariosDisponibles(fecha).subscribe((horarios) => {
      this.horarios = horarios;
    });
  }

  private crearFormulario(): FormGroup {
    return new FormGroup({
      modalidad: new FormGroup({
        tipo: new FormControl(null, { validators: Validators.required }),
      }),
      horarios: new FormGroup({
        fechaSeleccionada: new FormControl(this.fechaMasProxima, {
          validators: Validators.required,
        }),
        horarioId: new FormControl(null, { validators: Validators.required }),
      }),
    });
  }

  /** Restablece el flujo completo tras una cancelación confirmada, para iniciar un nuevo agendamiento. */
  private reiniciarFlujo(): void {
    this.estadoCita = 'pendiente';
    this.codigoConfirmacion = null;
    this.citaForm.reset({
      modalidad: { tipo: null },
      horarios: { fechaSeleccionada: this.fechaMasProxima, horarioId: null },
    });
    this.cargarHorarios(this.fechaMasProxima);
    this.stepper?.reset();
  }
}
