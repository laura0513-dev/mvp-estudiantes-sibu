import { Injectable } from '@angular/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';

/** Traducción al español de las etiquetas accesibles del datepicker de Angular Material. */
@Injectable()
export class MatDatepickerIntlEs extends MatDatepickerIntl {
  override calendarLabel = 'Calendario';
  override openCalendarLabel = 'Abrir calendario';
  override closeCalendarLabel = 'Cerrar calendario';
  override prevMonthLabel = 'Mes anterior';
  override nextMonthLabel = 'Mes siguiente';
  override prevYearLabel = 'Año anterior';
  override nextYearLabel = 'Año siguiente';
  override prevMultiYearLabel = 'Rango de 24 años anterior';
  override nextMultiYearLabel = 'Rango de 24 años siguiente';
  override switchToMonthViewLabel = 'Cambiar a vista de mes';
  override switchToMultiYearViewLabel = 'Cambiar a vista de año';
}
