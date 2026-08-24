import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import {
  HorariosPorFranja,
  ModalidadOpcion,
  ResultadoAsignacion,
  TrabajadorSocial,
} from '../models/cita.model';

/**
 * Servicio con datos simulados (mock) de agendamiento: no realiza llamadas HTTP reales.
 * Sustituir por un servicio conectado al backend cuando exista la API definitiva.
 */
@Injectable({ providedIn: 'root' })
export class AgendamientoMockService {
  private readonly trabajadores: TrabajadorSocial[] = [
    { id: 'ts-1', nombre: 'Ana Pérez' },
    { id: 'ts-2', nombre: 'Carlos Gómez' },
    { id: 'ts-3', nombre: 'Luisa Ramírez' },
  ];

  /** Fechas (día del mes) sin ningún cupo disponible, para simular disponibilidad limitada. */
  private readonly diasSinCupoOffset = [5, 9, 14];

  getModalidades(): ModalidadOpcion[] {
    return [
      {
        valor: 'presencial',
        titulo: 'Presencial',
        descripcion:
          'La cita se realiza en las instalaciones de Bienestar Universitario, oficina de Trabajo Social.',
        icono: 'apartment',
      },
      {
        valor: 'virtual',
        titulo: 'Virtual',
        descripcion:
          'La cita se realiza por videollamada. Recibirás el enlace de acceso por correo institucional.',
        icono: 'videocam',
      },
    ];
  }

  /**
   * Fecha más próxima disponible: hoy + 2 días (regla simulada), avanzando
   * día a día si esa fecha cae en un día sin cupos (p. ej. domingo).
   */
  getFechaMasProxima(): Date {
    const fecha = new Date();
    fecha.setHours(0, 0, 0, 0);
    fecha.setDate(fecha.getDate() + 2);
    while (!this.esFechaDisponible(fecha)) {
      fecha.setDate(fecha.getDate() + 1);
    }
    return fecha;
  }

  /**
   * Indica si una fecha tiene cupos disponibles.
   * Reglas simuladas: domingos sin atención y un conjunto fijo de días sin cupo.
   */
  esFechaDisponible = (fecha: Date | null): boolean => {
    if (!fecha) {
      return false;
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fecha < hoy) {
      return false;
    }
    if (fecha.getDay() === 0) {
      return false;
    }
    const offsetDias = Math.round((fecha.getTime() - hoy.getTime()) / 86_400_000);
    return !this.diasSinCupoOffset.includes(offsetDias);
  };

  /**
   * Horarios disponibles agrupados por franja para una fecha dada.
   * En este mockup la lista de horarios es la misma para toda fecha disponible.
   */
  getHorariosDisponibles(_fecha: Date | null): Observable<HorariosPorFranja> {
    const [ana, carlos, luisa] = this.trabajadores;
    const resultado: HorariosPorFranja = {
      manana: [
        this.crearHorario(ana, '09:00', '9:00 a.m.', 'manana'),
        this.crearHorario(carlos, '10:00', '10:00 a.m.', 'manana'),
        this.crearHorario(luisa, '11:30', '11:30 a.m.', 'manana'),
      ],
      tarde: [
        this.crearHorario(ana, '14:00', '2:00 p.m.', 'tarde'),
        this.crearHorario(carlos, '15:30', '3:30 p.m.', 'tarde'),
        this.crearHorario(luisa, '16:00', '4:00 p.m.', 'tarde'),
      ],
    };
    return of(resultado).pipe(delay(200));
  }

  /** Simula la asignación de la cita en backend (con latencia artificial). */
  asignarCita(): Observable<ResultadoAsignacion> {
    return of({
      exito: true,
      mensaje: 'Tu cita quedó asignada. Se envió una notificación de confirmación por correo electrónico.',
      codigoConfirmacion: this.generarCodigoConfirmacion(),
    }).pipe(delay(700));
  }

  private crearHorario(
    trabajador: TrabajadorSocial,
    hora: string,
    horaTexto: string,
    franja: 'manana' | 'tarde',
  ) {
    return {
      id: `${trabajador.id}-${hora}`,
      trabajadorId: trabajador.id,
      trabajadorNombre: trabajador.nombre,
      hora,
      horaTexto,
      franja,
    };
  }

  private generarCodigoConfirmacion(): string {
    return `CITA-${Math.floor(100000 + Math.random() * 900000)}`;
  }
}
