import { TestBed } from '@angular/core/testing';
import { MatTabsModule } from '@angular/material/tabs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AgendaModule } from './agenda/agenda.module';
import { AppComponent } from './app.component';
import { MiCitaModule } from './mi-cita/mi-cita.module';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MatTabsModule, AgendaModule, MiCitaModule],
      declarations: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the two tabs (Agenda y Mi Cita)', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const etiquetas = Array.from(compiled.querySelectorAll('.mat-tab-label-content')).map(
      (elemento) => elemento.textContent?.trim(),
    );
    expect(etiquetas).toEqual(['Agenda', 'Mi Cita']);
  });
});
