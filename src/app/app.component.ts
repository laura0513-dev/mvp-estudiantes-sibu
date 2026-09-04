import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CitaEstadoService } from './shared/services/cita-estado.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  /** Índice de la pestaña activa (0 = Agenda, 1 = Mi Cita). */
  tabSeleccionado = 0;

  constructor(private readonly citaEstadoService: CitaEstadoService) {}

  ngOnInit(): void {
    // Al confirmar una cancelación desde cualquier pestaña, se vuelve a "Agenda"
    // para que el estudiante inicie un nuevo agendamiento desde el paso 1.
    this.citaEstadoService.cancelada$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.tabSeleccionado = 0;
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
