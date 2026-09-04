/** Modalidad en la que se realizará la cita. */
export type Modalidad = 'presencial' | 'virtual';

/** Franja horaria usada para agrupar los horarios disponibles. */
export type FranjaHoraria = 'manana' | 'tarde';

/** Estado del proceso de agendamiento. */
export type EstadoCita = 'pendiente' | 'asignando' | 'asignada';

export interface ModalidadOpcion {
  valor: Modalidad;
  titulo: string;
  descripcion: string;
  icono: string;
}

export interface TrabajadorSocial {
  id: string;
  nombre: string;
}

/** Un horario disponible de un trabajador social, ya combinado en una sola opción seleccionable. */
export interface HorarioDisponible {
  id: string;
  trabajadorId: string;
  trabajadorNombre: string;
  hora: string;
  horaTexto: string;
  franja: FranjaHoraria;
}

export interface HorariosPorFranja {
  manana: HorarioDisponible[];
  tarde: HorarioDisponible[];
}

export interface ResultadoAsignacion {
  exito: boolean;
  mensaje: string;
  codigoConfirmacion: string;
}

/** Cita ya confirmada por el estudiante, con los datos necesarios para mostrarla en "Mi Cita". */
export interface CitaConfirmada {
  modalidad: ModalidadOpcion;
  fecha: Date;
  horario: HorarioDisponible;
  codigoConfirmacion: string;
  /** Dato adicional según la modalidad (p. ej. el enlace de conexión si es virtual); vacío si no aplica. */
  observaciones: string;
}
