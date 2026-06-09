# LEGALCASE — Frontend (Angular 19)

Sistema Web de Gestión de Casos Legales. Plataforma SaaS jurídica con tres roles
(**Administrador**, **Abogado**, **Cliente**) construida con Angular 19, standalone
components, Signals y arquitectura modular preparada para conectarse a un backend NestJS.

---

## 1. Requisitos

- **Node.js 18.19+ o 20+**
- **npm 9+**
- (Opcional) Angular CLI global: `npm install -g @angular/cli`

## 2. Instalación

```bash
npm install
```

## 3. Ejecución en desarrollo

```bash
npm start          # equivale a: ng serve
# Abrir http://localhost:4200
```

La app arranca en **modo demo** con datos en memoria, sin necesidad de backend.
En la pantalla de login, seleccione un rol y las credenciales se completan solas:

| Rol           | Correo                  | Contraseña |
|---------------|-------------------------|------------|
| Administrador | admin@legalcase.hn       | demo1234   |
| Abogado       | abogado@legalcase.hn     | demo1234   |
| Cliente       | cliente@legalcase.hn     | demo1234   |

## 4. Build de producción

```bash
npm run build      # genera dist/legalcase-frontend
```

---

## 5. Arquitectura

```
src/app/
├── core/                 # Núcleo sin UI (singletons, reglas, contratos)
│   ├── models/           # Interfaces y enums de dominio (tipado estricto)
│   ├── services/         # AuthService, ApiService y servicios de dominio
│   ├── store/            # Estado global con Signals (AuthStore, UiStore)
│   ├── guards/           # authGuard, roleGuard (RBAC)
│   └── interceptors/     # jwtInterceptor, errorInterceptor
├── shared/               # Componentes reutilizables y sin estado de negocio
│   └── components/       # icon, avatar, chip, kpi-card, panel, modal, toast…
├── layouts/              # Shells: public-layout y app-layout (sidebar + topbar)
└── features/             # Páginas por dominio (lazy loaded)
    ├── landing/ auth/ dashboard/ requests/ cases/ kanban/
    └── calendar/ documents/ users/ tasks/ messages/ reports/ settings/
```

**Alias de importación** (definidos en `tsconfig.json`): `@core/*`, `@shared/*`,
`@layouts/*`, `@features/*`, `@env/*`.

### Flujo de navegación
- Zona pública (`/`, `/login`) bajo `PublicLayout`.
- Zona privada (`/app/**`) protegida por `authGuard`, con `AppLayout` (sidebar
  + topbar dependientes del rol). Cada módulo se carga con **lazy loading**
  (`loadComponent`) y algunos exigen rol específico vía `roleGuard([...])`.

---

## 6. Manejo de estado global (Signals)

Se usa el patrón **"store como servicio"**: un servicio `@Injectable` con un
`signal` privado de escritura y selectores públicos `readonly`/`computed`.

- `AuthStore` — única fuente de verdad de la sesión: usuario, token y rol.
- `UiStore` — tema (claro/oscuro) y estado del sidebar.
- Servicios de dominio (`CasesService`, `RequestsService`, …) exponen sus
  colecciones como signals y métodos de mutación. Cualquier vista que lea esos
  selectores se re-renderiza automáticamente: **sin duplicación y siempre en sincronía**.

---

## 7. Cómo conectar el backend NestJS

1. Ajuste la URL en `src/environments/environment.ts` → `apiUrl`.
2. En `AuthService.login()`: elimine la rama mock (`of(session)`) y descomente
   la llamada `this.api.post('auth/login', creds)`.
3. En cada servicio de dominio, reemplace la lectura de `MOCK_*` por llamadas
   `ApiService.get/post/...`. El `jwtInterceptor` ya adjunta el token a cada
   petición y el `errorInterceptor` cierra sesión ante un 401.
4. No es necesario tocar guards, store, layouts ni componentes.

---

## 8. Cómo escalar

- **Nuevo módulo**: cree `features/<modulo>/<modulo>.page.ts` (standalone) y
  añada una ruta `loadComponent` en `app.routes.ts`. Se carga de forma perezosa.
- **Nuevo estado de dominio**: cree un servicio-store con signals en `core/services`.
- **Nuevo componente UI**: agréguelo en `shared/components` y reutilícelo.
- Para apps muy grandes puede migrarse el patrón de store a NgRx SignalStore sin
  cambiar la filosofía de selectores.

---

## 9. Tecnologías

Angular 19 · TypeScript estricto · Standalone Components · Signals · Angular Router
con Lazy Loading · HttpClient + interceptores funcionales · SCSS (design system
centralizado) · Diseño responsive.
