import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerIntl, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';

import { MatDatepickerIntlEs } from '../shared/services/mat-datepicker-intl-es';
import { SharedModule } from '../shared/shared.module';
import { AgendaComponent } from './agenda.component';
import { ConfirmacionStepComponent } from './components/confirmacion-step/confirmacion-step.component';
import { HorariosStepComponent } from './components/horarios-step/horarios-step.component';
import { ModalidadStepComponent } from './components/modalidad-step/modalidad-step.component';

@NgModule({
  declarations: [
    AgendaComponent,
    ModalidadStepComponent,
    HorariosStepComponent,
    ConfirmacionStepComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    SharedModule,
  ],
  exports: [AgendaComponent],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
    { provide: MatDatepickerIntl, useClass: MatDatepickerIntlEs },
  ],
})
export class AgendaModule {}
