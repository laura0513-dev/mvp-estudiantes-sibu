# INTEGRATION.md — Guía de fusión de `mvp-estudiantes`

> Este documento está escrito para que un agente de IA (u otro desarrollador) lo
> ejecute paso a paso al fusionar este repositorio dentro de otro proyecto Angular 13 +
> Angular Material + CDK ya existente ("proyecto destino"). No es documentación humana
> genérica: cada sección da instrucciones accionables, con rutas exactas.

## 0. Qué es este repositorio (leer antes de empezar)

Este repositorio **ya es el paquete de entrega**, no el proyecto Angular original
completo. Fue depurado en una rama separada (`to-copy`) específicamente para fusionarse
dentro de otro proyecto: se eliminó todo el scaffolding/configuración propios de este
proyecto como aplicación standalone (no tienen sentido dentro de un proyecto destino que
ya existe y ya tiene su propia configuración equivalente). Lo único que queda en el
repositorio es código de feature: los módulos de Angular a copiar, más este documento.

**Se eliminó** (y por qué no hace falta copiarlo):

| Eliminado | Por qué |
|---|---|
| `angular.json`, `package.json`, `package-lock.json`, `tsconfig*.json`, `karma.conf.js`, `.browserslistrc`, `.editorconfig`, `.prettierrc`, `.nvmrc`, `.gitignore`, `README.md`, `.vscode/` | Configuración/tooling propios de este proyecto como aplicación Angular independiente. El proyecto destino ya tiene su propio equivalente de cada uno; no se fusionan, solo se usan como referencia (ver secciones 2 y 3 para lo que sí hay que trasladar de su contenido). |
| `node_modules/`, `dist/`, `.angular/` | Artefactos de instalación/build, nunca se versionan ni se copian entre proyectos. |
| `src/main.ts`, `src/polyfills.ts`, `src/test.ts`, `src/index.html`, `src/favicon.ico` | Bootstrap/shell de esta app como proyecto standalone. El proyecto destino ya tiene los suyos; solo hace falta tomar de `index.html` las etiquetas `<link>` de fuentes (ver sección 8). |
| `src/environments/environment.ts`, `environment.prod.ts` | Solo contenían el flag `production` por defecto del CLI, sin ningún valor específico de este proyecto (ej. no había `apiUrl` configurada, ver sección 9). El proyecto destino ya tiene sus propios archivos de entorno. |
| `src/styles.scss` | Hoja de estilos **global** de este proyecto standalone (aplica el tema, y algunas reglas sueltas fuera de la encapsulación de componente). No se puede copiar tal cual sin re-estilizar toda la app destino — su contenido relevante y el riesgo asociado quedan documentados íntegramente en la sección 7.2 para que se reconcilie a mano. |
| `src/assets/` (solo contenía `.gitkeep`) | No había ningún asset local real (ver sección 8: fuentes e íconos se cargan por CDN, no hay archivos que copiar). |
| `src/app/app.module.ts`, `src/app/app-routing.module.ts`, `src/app/app.component.*` | Es el shell raíz de este proyecto standalone (el `<app-root>` con el `mat-tab-group` que alterna "Agenda"/"Mi Cita"). El proyecto destino no debe reemplazar su propio `AppComponent`/`AppModule` con estos — en su lugar debe reconstruir el contenedor de pestañas como un componente propio del feature. La lógica exacta que tenían estos archivos se transcribe en la sección 5 para no perderla. |

**Lo que queda en este repositorio** (y es exactamente lo que hay que copiar) — bajo
`src/app/`:

```
src/app/
├── agenda/                  → AgendaModule y sus 3 sub-componentes de paso (wizard)
├── mi-cita/                 → MiCitaModule
└── shared/
    ├── components/          → CancelarCitaComponent + CancelarCitaDialogComponent
    ├── models/               → interfaces/tipos de dominio (Cita, HorarioDisponible, etc.)
    ├── services/             → AgendamientoMockService, CitaEstadoService, MatDatepickerIntlEs
    ├── styles/               → sistema de diseño genérico (tipografía/colores/espaciados)
    └── shared.module.ts
```

`shared/components/` y `shared.module.ts` no estaban en la lista mínima original de "qué
llevar", pero **son una dependencia obligatoria**: `AgendaModule` y `MiCitaModule` importan
`SharedModule` (que declara `CancelarCitaComponent`, usado tanto en el paso de
confirmación de "Agenda" como en "Mi Cita"). Sin esta carpeta el paquete no compila —
se conservó por eso, no por descuido.

Dos servicios (`AgendamientoMockService`, `CitaEstadoService`, dentro de
`shared/services/`) ya tienen comentarios `TODO-BACKEND` agregados directamente en el
código señalando los 8 puntos donde hoy hay datos/acciones simuladas — ver sección 9.

## 1. Resumen

`mvp-estudiantes` (Angular 13.3 + Angular Material 13) es el feature para que un
estudiante agende y consulte una cita con Trabajo Social (dos módulos: "Agenda" y "Mi
Cita"). Todo el backend está mockeado en el cliente. Este repositorio, ya depurado, se
fusiona como un feature lazy-loaded dentro de un proyecto Angular 13 más grande que ya
usa Angular Material.

## 2. Dependencias a agregar al `package.json` del proyecto destino

**No se requieren dependencias adicionales — el proyecto usa únicamente lo que Angular
Material y CDK ya proveen.** No hay máscaras de input, librerías de fechas, ni
utilidades de terceros (lodash, moment, date-fns, ngx-*, etc.). No hace falta agregar
ninguna entrada nueva a `dependencies` ni a `devDependencies` del proyecto destino.

Bloque a agregar al `package.json` del destino:

```json
{
  "dependencies": {}
}
```

(Es decir: nada que agregar. El bloque vacío es intencional, para dejar constancia de
que se revisó y no quedó como una duda abierta.)

Lo único a verificar es que las versiones de Angular/Material/CDK del destino sean
compatibles dentro del mismo major (13.x) con las que usaba este proyecto — no
necesitan ser idénticas:

```
@angular/animations             ~13.3.0
@angular/cdk                    ^13.3.9
@angular/common                 ~13.3.0
@angular/compiler               ~13.3.0
@angular/core                   ~13.3.0
@angular/forms                  ~13.3.0
@angular/material               ^13.3.9
@angular/platform-browser       ~13.3.0
@angular/platform-browser-dynamic ~13.3.0
@angular/router                 ~13.3.0
rxjs                            ~7.5.0
tslib                           ^2.3.0
zone.js                         ~0.11.4
```

Dado que la premisa de esta fusión es que el proyecto destino **ya es** Angular 13 +
Material + CDK, en el caso normal no hay que instalar nada.

## 3. Módulos globales a verificar en el `AppModule` del proyecto destino

La mayoría de los módulos de Angular Material que usa este feature ya están
encapsulados dentro de `AgendaModule`, `MiCitaModule` y `SharedModule` (ver sección 4),
así que **no** hace falta declararlos en el `AppModule` del proyecto destino. Verificar
únicamente lo siguiente antes de fusionar:

- **`BrowserAnimationsModule`** (`@angular/platform-browser/animations`): imprescindible.
  Si el proyecto destino usa `NoopAnimationsModule` en su lugar, el stepper, los diálogos
  (`MatDialog`) y las transiciones de `mat-tab-group` de este feature perderán sus
  animaciones (no van a fallar, pero se verán "cortadas").
- **`LOCALE_ID`**: este proyecto registraba `{ provide: LOCALE_ID, useValue: 'es-CO' }`
  a nivel raíz (en el `AppModule` ya eliminado de este repositorio, ver sección 0). Si el
  proyecto destino no fija ya un `LOCALE_ID` en español, agregar este provider (o uno
  equivalente, ej. `es-CO`/`es`) a nivel raíz — si no, los `Date` mostrados por el
  `MatDatepicker` y los formatos de fecha no se verán en español.
- **`ReactiveFormsModule`**, **`MatNativeDateModule`**, **`MAT_DATE_LOCALE`**: usados
  dentro de `AgendaModule`, ya viajan con esa carpeta al copiarla — no requieren nada en
  el `AppModule` del destino.
- **`HttpClientModule`**: **no se usa hoy en ningún lado** (todo el feature usa datos
  mock, sin llamadas HTTP reales — ver sección 9). El proyecto destino debe tenerlo ya
  disponible a nivel raíz para cuando se conecten los `TODO-BACKEND`.

## 4. Pasos de copia

Este repositorio ya contiene únicamente lo que hay que copiar (ver sección 0). Copiar
el contenido completo de la carpeta `src/app/` de este repositorio **tal cual**, sin
modificarlo, dentro de `src/app/` del proyecto destino. Se sugiere agruparlo bajo un
namespace propio para no mezclar archivos con el resto del proyecto destino, por
ejemplo `src/app/citas-estudiantes/`:

| Carpeta en este repositorio | Ruta destino sugerida |
|---|---|
| `src/app/agenda/` | `src/app/citas-estudiantes/agenda/` |
| `src/app/mi-cita/` | `src/app/citas-estudiantes/mi-cita/` |
| `src/app/shared/` (completa: `models/`, `services/`, `components/`, `styles/`, `shared.module.ts`) | `src/app/citas-estudiantes/shared/` |

Si se respeta la misma jerarquía relativa de arriba (es decir, `agenda/`, `mi-cita/` y
`shared/` quedan como hermanos dentro del mismo namespace), **no hace falta tocar
ningún import** — los imports relativos (`../shared/...`, `../../../shared/...`) ya
apuntan correctamente entre sí. Solo hay que actualizarlos si se elige una profundidad
de carpetas distinta a la de arriba.

## 5. Ruta de integración sugerida

**Importante**: `AgendaComponent` (`app-agenda`) y `MiCitaComponent` (`app-mi-cita`) no
son rutas independientes en el proyecto original — eran dos pestañas de un único
`mat-tab-group` en el `AppComponent` raíz (archivo ya eliminado de este repositorio, ver
sección 0), y comparten estado a través de `CitaEstadoService` (cancelar una cita desde
"Mi Cita" hacía que la vista volviera automáticamente a la pestaña "Agenda"). Para no
perder ese comportamiento al fusionar, se transcribe aquí la lógica exacta que tenía ese
componente raíz, ya eliminado:

```html
<!-- Plantilla original de AppComponent (ya no existe en este repo) -->
<mat-tab-group
  class="tabs-principales"
  animationDuration="0ms"
  aria-label="Secciones del agendamiento de citas"
  [(selectedIndex)]="tabSeleccionado"
>
  <mat-tab label="Agenda">
    <ng-template matTabContent>
      <app-agenda></app-agenda>
    </ng-template>
  </mat-tab>
  <mat-tab label="Mi Cita">
    <ng-template matTabContent>
      <app-mi-cita></app-mi-cita>
    </ng-template>
  </mat-tab>
</mat-tab-group>
```

```typescript
// Lógica original de AppComponent (ya no existe en este repo)
tabSeleccionado = 0;

constructor(private readonly citaEstadoService: CitaEstadoService) {}

ngOnInit(): void {
  // Al confirmar una cancelación desde cualquier pestaña, se vuelve a "Agenda"
  // para que el estudiante inicie un nuevo agendamiento desde el paso 1.
  this.citaEstadoService.cancelada$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
    this.tabSeleccionado = 0;
  });
}
```

Con esa base, para fusionar sin perder el comportamiento:

1. Crear un componente contenedor nuevo (ej. `CitasEstudiantesComponent`) en
   `src/app/citas-estudiantes/`, con la plantilla y la lógica de arriba (adaptando el
   selector para no chocar con el `app-root` del destino, y usando `Subject`/`takeUntil`
   igual que el resto de los componentes del feature para dar de baja la suscripción).
2. Crear un módulo nuevo (ej. `CitasEstudiantesModule`) que declare ese componente
   contenedor e importe `AgendaModule`, `MiCitaModule` y `MatTabsModule`.
3. Registrar ese módulo como única ruta lazy-loaded en el `app-routing.module.ts` del
   proyecto destino:

```typescript
{
  path: 'citas-estudiantes', // ajustar el segmento de ruta al criterio del proyecto destino
  loadChildren: () =>
    import('./citas-estudiantes/citas-estudiantes.module').then(
      (m) => m.CitasEstudiantesModule,
    ),
}
```

4. Dentro de `CitasEstudiantesModule`, enrutar internamente hacia el componente
   contenedor (`{ path: '', component: CitasEstudiantesComponent }`) si el proyecto
   destino espera que todo `loadChildren` tenga su propio `RouterModule.forChild(...)`.

No registres `AgendaModule` y `MiCitaModule` como dos rutas lazy separadas — perderías
la navegación compartida descrita arriba.

Ninguno de los dos feature modules (`AgendaModule`, `MiCitaModule`) estaba lazy-loaded
en el proyecto original — ambos se importaban de forma eager, simplemente porque el
proyecto no tenía otras rutas con las que dividir el bundle. Al fusionarlos vía
`loadChildren` como se describe arriba, pasan a ser lazy-loaded por primera vez.

## 6. Variables de tema a reconciliar

Todas viven en `src/app/shared/styles/custom-theme.scss` de este repositorio (misma
ruta relativa que tendrá dentro del destino tras el paso de copia de la sección 4).

**Antes de copiar este archivo**, verificar si el proyecto destino ya tiene un tema de
Angular Material propio con el mismo verde institucional de la Universidad de Antioquia
(`#026937` / Pantone 349 C). Dos escenarios:

- **Si el destino ya tiene una paleta equivalente** (mismo verde institucional u otra
  paleta de marca ya definida): **no dupliques este archivo de tema**. Hay que mapear los
  usos de estas variables SCSS (`tema.$color-primary`, etc., referenciadas en los
  `.scss` de cada componente) a las variables/paleta ya existentes en el destino, y
  **no** incluir el `@include aplicar-tema-placeholder()` de este archivo (ver el riesgo
  de colisión más abajo) — el destino ya debe estar aplicando su propio
  `mat.all-component-themes(...)` a nivel global.
- **Si el destino usa una paleta de marca distinta** (proyecto no institucional, u otra
  identidad visual): mantener este archivo pero renombrarlo/namespacearlo (ej.
  `citas-estudiantes-theme.scss`) para que no se confunda con el tema global del destino,
  y **no** llamar a `aplicar-tema-placeholder()` desde la hoja de estilos global del
  destino — solo tiene sentido si el feature completo debe verse con la paleta
  institucional aunque el resto de la app destino use otra.

Lista completa de variables:

| Variable | Valor | Uso |
|---|---|---|
| `$color-primary` | `#026937` | Verde institucional principal (Pantone 349 C) |
| `$color-secondary` | `#35944b` | Verde secundario (Pantone 7740 C) |
| `$color-accent` | `#069a7e` | Verde-azulado de acento/CTA (Pantone 334 C) |
| `$color-success` | `#43b649` | Verde de confirmación/éxito (Pantone 361 C) |
| `$color-warn` | `#f9a12c` | Naranja para errores y advertencias (Pantone 137 C) |
| `$color-surface` | `#ffffff` | Neutro de fondo (sin equivalente en la paleta de marca) |
| `$color-text-primary` | `#212121` | Gris oscuro estándar de Material (sin equivalente en la paleta de marca) |
| `$color-text-secondary` | `#757575` | Gris medio estándar de Material (sin equivalente en la paleta de marca) |
| `$color-on-primary` | `#ffffff` | Texto/ícono sobre `$color-primary` |
| `$color-on-secondary` | `#18181b` | Texto/ícono sobre `$color-secondary` |
| `$color-on-accent` | `= $color-text-primary` | Texto/ícono sobre `$color-accent` (blanco no cumple 4.5:1 ahí) |
| `$color-on-warn` | `= $color-text-primary` | Texto/ícono sobre `$color-warn` (blanco no cumple 4.5:1 ahí) |
| `$color-highlight-success` | `rgba(67, 182, 73, 0.2)` | Fondo de resaltado (ej. header de paso activo del stepper); ver nota de contraste caso a caso en el propio archivo |
| `$padding-seccion` | `1rem 0 3rem` | Padding del contenedor raíz de Agenda y Mi Cita |
| `$color-surface-container-low` | `color.scale($color-surface, -3%)` | Fondo de tarjeta en componentes del wizard |
| `$color-outline-variant` | `#8a8a8a` | Borde sutil de componentes UI (cumple 3:1) |
| `$color-button-disabled` | `#e0e0e0` | Gris reutilizable para elemento inactivo/neutro sobre fondo oscuro (ej. botón del snackbar) |
| `$color-warn-texto` | tono 800 derivado de `$color-warn` | Texto de error/advertencia fuera de componentes Material (`$color-warn` no cumple 4.5:1 como texto) |
| `$app-primary` / `$app-accent` / `$app-warn` | paletas M2 derivadas de los colores de arriba | Paleta pasada a `mat.define-light-theme` |
| `$app-theme` | tema M2 completo | Pasado a `mat.all-component-themes` en `aplicar-tema-placeholder()` |

Variables tipográficas (en `src/app/shared/styles/_lineamientos-udea.scss`) — este
archivo es **autocontenido** (no importa nada del resto del proyecto) y puede copiarse
sin reconciliar nada, salvo decidir si la fuente Lato coexiste bien con la tipografía que
ya use el proyecto destino (ver sección 8):

| Variable | Valor | Uso |
|---|---|---|
| `$udea-font-family` | `'Lato', Arial, sans-serif` | Familia tipográfica institucional |
| `$udea-peso-black` | `900` | Título principal |
| `$udea-peso-bold` | `700` | Menús y encabezados de sección |
| `$udea-peso-regular` | `400` | Contenido |
| `$udea-estilo-italic` | `italic` | Resúmenes |
| `$udea-tamano-base` | `1rem` | Tamaño de fuente base (mínimo 16px por lineamiento) |
| `$udea-color-boton-normal-fondo` | `#026937` | Fondo de botón primario |
| `$udea-color-boton-normal-texto` | `#ffffff` | Texto de botón primario |
| `$udea-color-boton-hover-fondo` | `#8dc63f` | Fondo de botón primario en hover |
| `$udea-color-boton-hover-texto` | `#014a2b` | Texto de botón primario en hover (corregido por contraste, ver comentario en el archivo) |
| `$udea-color-enlace` | `#026937` | Color de enlaces de texto |

## 7. Riesgos de colisión detectados

### 7.1 Selectores de componentes

Todos usan el prefijo `app-` (el prefijo por defecto de Angular CLI). **Verificar
explícitamente que ninguno de estos selectores ya exista en el proyecto destino** antes
de copiar (son genéricos y con nombres cortos — el riesgo de colisión es real si el
destino también usa el prefijo `app-` por defecto):

- `app-agenda`
- `app-mi-cita`
- `app-confirmacion-step`
- `app-modalidad-step`
- `app-horarios-step`
- `app-cancelar-cita`
- `app-cancelar-cita-dialog`

(`app-root`, del `AppComponent` original de este proyecto standalone, no forma parte de
este paquete — ver sección 0 — pero igual conviene confirmar que el destino no tenga ya
un componente propio con ese selector si en algún punto se copió por error algo del
proyecto original completo.)

Si el proyecto destino usa un prefijo distinto (ej. `udea-`, `ts-`, etc.) en su propio
`angular.json`, considerar renombrar estos selectores al fusionar para mantener
consistencia con las convenciones del destino (no es obligatorio para que funcione, solo
recomendado).

### 7.2 Fugas de estilos global (fuera de la encapsulación de componente)

**Riesgo alto — `src/app/agenda/agenda.component.scss` (línea 53 en el archivo original)**:

```scss
::ng-deep .mat-horizontal-stepper-header-container {
  flex-wrap: wrap;
}
```

Este `::ng-deep` está en el nivel superior de la hoja de estilos del componente, **sin
ningún selector propio del componente antes de `::ng-deep`**. Angular solo aplica el
atributo de encapsulación (`[_ngcontent-xxx]`) al selector que precede a `::ng-deep`; si
no hay ninguno, la regla queda **completamente global y sin scoping**, afectando a
**cualquier** `mat-horizontal-stepper-header-container` en toda la aplicación destino
(cualquier otro `mat-stepper` horizontal que ya exista ahí, no solo el de este feature).
**Verificar explícitamente contra el proyecto destino antes de fusionar** — si el destino
tiene otros steppers horizontales, esta regla los va a afectar también. Esto **no se
corrigió** en este paquete — esta entrega es solo de auditoría/empaquetado, no de
corrección de estilos; si hace falta, scopearla añadiendo la clase del contenedor del
componente antes de `::ng-deep` (ej. `.agendamiento-contenedor ::ng-deep
.mat-horizontal-stepper-header-container`, siguiendo el mismo patrón que las demás
reglas de ese mismo archivo).

**Riesgo medio — mismo archivo, resto de los `::ng-deep` a nivel de componente**:

```scss
::ng-deep .agendamiento-contenedor .mat-horizontal-content-container { ... }
::ng-deep .agendamiento-contenedor .mat-step-header[aria-selected='true'] { ... }
::ng-deep .agendamiento-contenedor { .mat-horizontal-stepper-header-container { ... } ... }
::ng-deep .agendamiento-contenedor { .mat-vertical-content-container { ... } ... }
```

Mismo problema técnico (`::ng-deep` como primer token → sin scoping de Angular), pero
acá el selector queda calificado por la clase `.agendamiento-contenedor` (definida en el
template de `AgendaComponent`), lo que reduce bastante la probabilidad real de colisión.
Riesgo residual: si el proyecto destino tiene **en cualquier parte de la app** un
elemento con esa misma clase `.agendamiento-contenedor`, estas reglas se le aplicarían
también. Verificar que esa clase no exista ya en el destino.

**Riesgo medio — hoja de estilos global del proyecto original (`styles.scss`, ya
eliminada de este repositorio — ver sección 0, contenido reproducido aquí para no
perderlo)**:

```scss
.mat-tab-label { ... }
.mat-simple-snackbar-action button.mat-button { ... }
```

Y, de forma indirecta, el `@include aplicar-tema-placeholder()` (que sí sigue estando en
`custom-theme.scss`, incluido en este paquete) contiene:

```scss
.mat-flat-button.mat-primary,
.mat-raised-button.mat-primary { ... }
```

Estas tres reglas no usaban `::ng-deep` porque vivían directamente en la hoja de
estilos **global** del proyecto original, así que aplicaban sin ningún scoping por
diseño. **Por eso `styles.scss` no se incluyó en este paquete** (ver sección 0): si se
porta tal cual al `styles.scss` global del proyecto destino, o si se llama a
`aplicar-tema-placeholder()` desde ahí, **va a re-estilizar todos los `mat-tab-label`,
todos los botones planos/elevados con `color="primary"`, y todas las acciones de
snackbar de toda la aplicación destino**, no solo los de este feature — incluyendo
componentes de Material que no tienen nada que ver con "Agenda"/"Mi Cita". Este es el
riesgo de colisión más importante del paquete y está directamente ligado a la decisión
de reconciliación de tema de la sección 6: si el destino ya tiene su propio tema Angular
Material aplicado globalmente, **no** agregues este `@include` (ni estas reglas sueltas)
a su hoja de estilos global.

**Sin riesgo (confirmado, para referencia)**: el resto de los usos de `::ng-deep` (en
`horarios-step.component.scss` y `modalidad-step.component.scss`, incluidos en este
paquete) están anidados dentro de una clase propia del componente (`.horario-field`,
`.modalidad-opcion` respectivamente) **antes** de `::ng-deep`, por lo que Angular sí les
aplica el atributo de encapsulación y quedan correctamente limitados a instancias de ese
componente. No requieren acción.

## 8. Assets a copiar

No hay ningún archivo de fuente o ícono local en este paquete — no hay nada físico que
copiar a la carpeta `assets` del destino ni que registrar en su `angular.json`. Ambos se
cargaban vía CDN de Google Fonts desde el `index.html` del proyecto original (ya
eliminado de este repositorio — ver sección 0), con estas etiquetas exactas:

- **Fuente Lato**:
  ```html
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap" rel="stylesheet">
  ```
  Agregar estas dos etiquetas al `<head>` del `index.html` del proyecto destino (si el
  destino ya carga otra fuente vía Google Fonts, se pueden combinar en una sola familia
  de `<link>`s, no hace falta duplicar el `preconnect`).
- **Material Icons** (sin SVGs ni `MatIconRegistry.addSvgIcon` personalizados — se usa
  el set estándar de `mat-icon` vía ligatures):
  ```html
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  ```
  Agregar este `<link>` al `index.html` del destino **solo si no lo tiene ya** (muchos
  proyectos que ya usan Angular Material lo tienen desde su propio setup inicial —
  verificar antes de duplicar).

## 9. Puntos pendientes de conexión a backend

Todos los puntos de datos/acciones simuladas están marcados en el código con comentarios
`TODO-BACKEND` (buscar ese literal para ubicarlos rápido — ambos archivos forman parte
de este paquete, en `src/app/shared/services/`). Ningún servicio usa `HttpClient` hoy;
el proyecto original tampoco tenía una `apiUrl` configurada en sus archivos de entorno
(no se incluyeron en este paquete — ver sección 0). Habrá que agregar esa configuración
de entorno propia del destino al conectar el backend real.

| Archivo | Método/bloque | Tipo | Nota |
|---|---|---|---|
| `src/app/shared/services/agendamiento-mock.service.ts` | `getModalidades()` | Lectura | Lista de modalidades hoy hardcodeada; sugerido `GET /api/modalidades` |
| `src/app/shared/services/agendamiento-mock.service.ts` | `getFechaMasProxima()` | Lectura | Regla de "próxima fecha disponible" simulada en el cliente; sugerido `GET /api/citas/proxima-disponible` |
| `src/app/shared/services/agendamiento-mock.service.ts` | `esFechaDisponible` | Lectura | Regla de disponibilidad por fecha simulada (usada como `[dateFilter]` del datepicker); sugerido `GET /api/citas/disponibilidad?mes=YYYY-MM` |
| `src/app/shared/services/agendamiento-mock.service.ts` | `getHorariosDisponibles(fecha)` | Lectura | Horarios fijos sin importar la fecha recibida; sugerido `GET /api/horarios?fecha=YYYY-MM-DD` |
| `src/app/shared/services/agendamiento-mock.service.ts` | `asignarCita()` | Acción (escritura) | Solo simula éxito con latencia artificial, sin persistir nada ni manejar error; sugerido `POST /api/citas`. El llamador (`AgendaComponent.onAsignar`, en `src/app/agenda/agenda.component.ts`) tampoco maneja error hoy — agregarlo al conectar. |
| `src/app/shared/services/cita-estado.service.ts` | constructor (`crearCitaMockInicial()`) | Lectura | El estado inicial de "Mi Cita" arranca con una cita mock ya asignada en vez de consultar si el estudiante realmente tiene una; sugerido `GET /api/citas/mi-cita` |
| `src/app/shared/services/cita-estado.service.ts` | `confirmarCita(cita)` | Acción (escritura, estado local) | Solo actualiza el `BehaviorSubject` local; debe depender de la respuesta real de `asignarCita()` una vez conectada |
| `src/app/shared/services/cita-estado.service.ts` | `cancelarCita()` | Acción (escritura) | Solo actualiza estado local (intentos + cita), sin backend ni manejo de error; sugerido `PATCH /api/citas/:id/cancelar` |

Total: **8 puntos marcados con `TODO-BACKEND`**, en 2 archivos (ambos bajo
`src/app/shared/services/`).
