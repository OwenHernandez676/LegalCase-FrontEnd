# Bitácora Técnica — Conversión del Prototipo a Angular 19

Registro de las decisiones de arquitectura tomadas al transformar el prototipo
visual de LEGALCASE en un proyecto Angular profesional. No se modificó el diseño,
el flujo ni las pantallas: el objetivo fue portar el prototipo a código mantenible.

---

### D-01 · Standalone Components en lugar de NgModules
Angular 19 promueve componentes standalone. Se eliminó por completo el uso de
`NgModule`; el arranque es `bootstrapApplication(AppComponent, appConfig)` y cada
componente declara sus propios `imports`. **Beneficio:** menos boilerplate, tree-shaking
más fino y lazy loading directo por componente.

### D-02 · Estado global con Signals ("store como servicio")
En vez de añadir una librería (NgRx) para un proyecto académico, se usó el sistema
nativo de **Signals**. Cada store es un `@Injectable({providedIn:'root'})` con un
`signal` privado de escritura y selectores `readonly`/`computed` públicos.
**Razón:** moderno, sin dependencias, desacoplado y reactivo. `AuthStore` y `UiStore`
son singletons; los servicios de dominio actúan como stores de su colección.
**Trade-off:** para dominios muy grandes convendría NgRx SignalStore; el patrón
elegido migra a él sin reescribir la filosofía.

### D-03 · Lazy loading por ruta (`loadComponent`)
Todas las páginas privadas se cargan de forma perezosa. **Beneficio:** el bundle
inicial solo contiene landing + login; cada módulo llega bajo demanda, lo que
mantiene el arranque ligero y escalable a más pantallas.

### D-04 · Guards e interceptores funcionales
Se usaron `CanActivateFn` (`authGuard`, `roleGuard`) y `HttpInterceptorFn`
(`jwtInterceptor`, `errorInterceptor`) en lugar de clases. **Razón:** es el estándar
actual de Angular, más componible y testeable. `roleGuard` es una *factory*
(`roleGuard(['administrador'])`) para reutilizarse con cualquier combinación de roles (RBAC).

### D-05 · Capa Core / Shared / Features
- **core**: lo que no tiene UI y vive una sola vez (modelos, servicios, store,
  guards, interceptores).
- **shared**: componentes presentacionales reutilizables y sin lógica de negocio
  (icon, avatar, chip, kpi-card, panel, modal, toast…).
- **features**: páginas por dominio.
**Beneficio:** dependencias en una sola dirección (features → shared/core), evitando
acoplamiento circular.

### D-06 · Design system centralizado en `styles.scss`
El CSS del prototipo ("Ink & Champagne", navy + dorado) se portó a variables CSS
con tema claro/oscuro vía `[data-theme]`, más utilidades (`.btn`, `.panel`, `.kpi`,
`.chip`, `.tbl`, `.field`, `.prog`…). Los componentes usan estas clases semánticas.
**Razón:** mantener el estilo idéntico al prototipo, evitar duplicar estilos y permitir
el cambio de tema en un solo punto. **Trade-off:** estilos globales vs. encapsulados;
se aceptó por coherencia visual y para reducir el número de archivos.

### D-07 · Plantillas inline vs. archivos separados
Componentes simples (icon, chip, avatar, kpi) usan plantilla inline; las páginas y
layouts grandes separan `.html`/`.scss`. **Razón:** equilibrio entre legibilidad y
cantidad de archivos.

### D-08 · Datos mock desacoplados (`mock-data.ts` + `ApiService`)
La app corre sin backend gracias a datos en memoria, pero la estructura ya está
lista para HTTP: existe un `ApiService` tipado contra `environment.apiUrl` y los
servicios encapsulan el origen de datos. Cambiar a NestJS no toca componentes ni store.
**Beneficio:** se puede demostrar el sistema hoy y conectarlo al backend después
sin refactor.

### D-09 · Preparación para JWT
`AuthStore` guarda el token y lo persiste en `localStorage`; el `jwtInterceptor` lo
adjunta como `Authorization: Bearer` en cada petición; el `errorInterceptor` cierra
sesión ante 401. El `AuthService` ya tiene comentada la línea real de login contra NestJS.

### D-10 · TypeScript estricto + alias de rutas
`strict: true` y reglas adicionales (`noImplicitOverride`, `strictTemplates`…) para
detectar errores en compilación. Alias `@core`, `@shared`, `@layouts`, `@features`,
`@env` para imports limpios y evitar rutas relativas frágiles.

---

## Resumen
El prototipo se transformó en un proyecto Angular 19 enterprise: standalone +
signals + lazy loading + capas desacopladas + design system centralizado, listo
para `npm install`, `ng serve` y para conectar NestJS sin reescribir la base.
