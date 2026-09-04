import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { CitaConfirmada } from '../shared/models/cita.model';
import { CitaEstadoService } from '../shared/services/cita-estado.service';

@Component({
  selector: 'app-mi-cita',
  templateUrl: './mi-cita.component.html',
  styleUrls: ['./mi-cita.component.scss'],
})
export class MiCitaComponent {
  readonly cita$: Observable<CitaConfirmada | null> = this.citaEstadoService.cita$;

  constructor(private readonly citaEstadoService: CitaEstadoService) {}
}
