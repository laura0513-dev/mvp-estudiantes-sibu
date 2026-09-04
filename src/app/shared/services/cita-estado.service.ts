import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CitaConfirmada } from '../models/cita.model';
import { AgendamientoMockService } from './agendamiento-mock.service';

/** Máximo de intentos de cancelación/reagendamiento que un estudiante puede usar (regla simulada). */
const INTENTOS_INICIALES = 2;

/**
 * Estado local (mock) de la cita confirmada del estudiante y de sus intentos de
 * cancelación/reagendamiento restantes. Compartido entre la pestaña "Agenda" (stepper)
 * y la pestaña "Mi Cita" para que ambas reflejen la misma cita y permitan cancelarla
 * desde cualquiera de las dos.
 */
@Injectable({ providedIn: 'root' })
export class CitaEstadoService {
  private readonly citaSubject: BehaviorSubject<CitaConfirmada | null>;
  private readonly intentosSubject = new BehaviorSubject<number>(INTENTOS_INICIALES);
  private readonly canceladaSubject = new Subject<void>();

  readonly cita$: Observable<CitaConfirmada | null>;
  readonly intentosRestantes$: Observable<number> = this.intentosSubject.asObservable();
  /** Emite cuando el estudiante confirma la cancelación desde el modal, para que quien escuche reinicie su flujo. */
  readonly cancelada$: Observable<void> = this.canceladaSubject.asObservable();

  constructor(private readonly agendamientoMock: AgendamientoMockService) {
    // "Mi Cita" arranca con una cita mock ya asignada (en vez del estado vacío) para mostrar de
    // entrada cómo se ve una cita confirmada, con todos sus datos.
    // TODO-BACKEND: Reemplazar este mock por una llamada real al backend.
    // Hoy: "Mi Cita" arranca siempre con una cita mock ya asignada (crearCitaMockInicial),
    // en vez de reflejar si el estudiante realmente tiene o no una cita agendada. Debe:
    // consultar al backend la cita vigente del estudiante autenticado al iniciar la app y
    // hacer citaSubject.next(cita) (o null si no tiene ninguna) con esa respuesta, con la
    // misma forma que CitaConfirmada (ver shared/models/cita.model.ts).
    // Sugerencia de endpoint: GET /api/citas/mi-cita
    this.citaSubject = new BehaviorSubject<CitaConfirmada | null>(this.crearCitaMockInicial());
    this.cita$ = this.citaSubject.asObservable();
  }

  get intentosRestantes(): number {
    return this.intentosSubject.value;
  }

  // TODO-BACKEND: hoy solo actualiza el estado local/en memoria (BehaviorSubject) tras la
  // respuesta simulada de AgendamientoMockService.asignarCita(). Cuando ese método se
  // conecte a un POST real, este método debe llamarse únicamente si esa petición fue
  // exitosa (usar la cita que devuelva el backend, no la armada en el cliente en
  // AgendaComponent.onAsignar).
  confirmarCita(cita: CitaConfirmada): void {
    this.citaSubject.next(cita);
  }

  // TODO-BACKEND: Reemplazar esta simulación por una petición real al backend.
  // Hoy: solo actualiza el estado local/en memoria (intentosSubject y citaSubject), no llama
  // a ningún backend ni maneja error. Debe: enviar una petición real (PATCH o DELETE según
  // el diseño de la API) para cancelar la cita vigente, manejar el caso de error de esa
  // petición (ej. no descontar el intento ni limpiar citaSubject si la petición falla), y
  // solo tras una respuesta exitosa actualizar intentosSubject/citaSubject/canceladaSubject
  // con los datos que confirme el backend.
  // Sugerencia de endpoint: PATCH /api/citas/:id/cancelar
  cancelarCita(): void {
    if (this.intentosSubject.value <= 0) {
      return;
    }
    this.intentosSubject.next(this.intentosSubject.value - 1);
    this.citaSubject.next(null);
    this.canceladaSubject.next();
  }

  private crearCitaMockInicial(): CitaConfirmada {
    const modalidadVirtual = this.agendamientoMock
      .getModalidades()
      .find((modalidad) => modalidad.valor === 'virtual')!;

    return {
      modalidad: modalidadVirtual,
      fecha: this.agendamientoMock.getFechaMasProxima(),
      horario: {
        id: 'ts-2-14:00',
        trabajadorId: 'ts-2',
        trabajadorNombre: 'Carlos Gómez',
        hora: '14:00',
        horaTexto: '2:00 p.m.',
        franja: 'tarde',
      },
      codigoConfirmacion: 'CITA-482913',
      observaciones: 'https://meet.udea.edu.co/ts/carlos-gomez',
    };
  }
}
