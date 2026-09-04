import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { SharedModule } from '../shared/shared.module';
import { MiCitaComponent } from './mi-cita.component';

@NgModule({
  declarations: [MiCitaComponent],
  imports: [CommonModule, MatIconModule, SharedModule],
  exports: [MiCitaComponent],
})
export class MiCitaModule {}
