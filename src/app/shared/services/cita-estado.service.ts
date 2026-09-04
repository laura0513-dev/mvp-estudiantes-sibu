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
    this.citaSubject = new BehaviorSubject<CitaConfirmada | null>(this.crearCitaMockInicial());
    this.cita$ = this.citaSubject.asObservable();
  }

  get intentosRestantes(): number {
    return this.intentosSubject.value;
  }

  confirmarCita(cita: CitaConfirmada): void {
    this.citaSubject.next(cita);
  }

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
