# Guía práctica: Strapi v5 + Angular 22

Aplicación de gestión de tareas que demuestra la integración entre un backend Strapi v5 y un frontend Angular 22. Cubre el ciclo completo: desarrollo local, despliegue del backend en Strapi Cloud y despliegue del frontend en Firebase Hosting.

Este repositorio contiene el **frontend**. El repositorio del backend está en [macobosf/guia-strapi-backend](https://github.com/macobosf/guia-strapi-backend).

---

## Tabla de contenidos

- [Requisitos previos](#requisitos-previos)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Backend — Configuración local](#backend--configuración-local)
- [Frontend — Configuración local](#frontend--configuración-local)
- [Modelo de datos](#modelo-de-datos)
- [Arquitectura del frontend](#arquitectura-del-frontend)
- [Deploy del backend a Strapi Cloud](#deploy-del-backend-a-strapi-cloud)
- [Deploy del frontend a Firebase Hosting](#deploy-del-frontend-a-firebase-hosting)
- [Solución de problemas](#solución-de-problemas)
- [Stack tecnológico](#stack-tecnológico)
- [Repositorio relacionado](#repositorio-relacionado)
- [Licencia](#licencia)

---

## Requisitos previos

- Node.js 20 o superior (este proyecto usa v24.15.0)
- pnpm 11 o superior (`npm install -g pnpm`)
- Git
- Cuenta en [GitHub](https://github.com)
- Cuenta en [Firebase](https://firebase.google.com) (para el deploy del frontend)
- Cuenta en [Strapi Cloud](https://cloud.strapi.io) (para el deploy del backend)

---

## Estructura del repositorio

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── tareas/
│   │   │       ├── tareas.ts        # Componente principal (standalone, signals)
│   │   │       ├── tareas.html
│   │   │       └── tareas.css
│   │   ├── services/
│   │   │   └── tarea.ts             # TareaService — CRUD vía HttpClient
│   │   ├── models/
│   │   │   └── tarea.ts             # Interfaz Tarea
│   │   ├── app.ts                   # Componente raíz
│   │   ├── app.config.ts            # Configuración de la aplicación (zoneless)
│   │   ├── app.routes.ts
│   │   └── app.html
│   ├── environments/
│   │   ├── environment.ts           # Producción
│   │   └── environment.development.ts  # Desarrollo local
│   └── main.ts
├── angular.json
├── package.json
└── tsconfig.json
```

---

## Backend — Configuración local

### 1. Clonar el repositorio

```bash
git clone https://github.com/macobosf/guia-strapi-backend
cd guia-strapi-backend
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Aprobar scripts de build

pnpm bloquea por defecto la ejecución de scripts de instalación en paquetes de terceros. Strapi requiere este paso para compilar sus dependencias nativas:

```bash
pnpm approve-builds
```

Selecciona todos los paquetes que lo soliciten.

### 4. Iniciar el servidor de desarrollo

```bash
pnpm develop
```

Strapi estará disponible en `http://localhost:1337/admin`.

### 5. Crear el usuario administrador

Accede a `http://localhost:1337/admin` y completa el formulario de registro la primera vez.

### 6. Crear el Content-Type "Tarea"

En el panel de administración, ve a **Content-Type Builder > Create new collection type** y crea el tipo con los siguientes campos:

| Campo | Tipo en Strapi | Configuración |
|---|---|---|
| `titulo` | Short text | Requerido |
| `descripcion` | Long text | Opcional |
| `completada` | Boolean | Default: `false` |
| `prioridad` | Enumeration | Valores: `baja`, `media`, `alta` |

Haz clic en **Save** y espera a que Strapi reinicie.

> Los nombres de los campos deben escribirse exactamente en minúsculas tal como se indica. Strapi es case-sensitive y el nombre definido aquí debe coincidir con la interfaz TypeScript del frontend.

### 7. Configurar permisos públicos

Ve a **Settings > Users & Permissions Plugin > Roles > Public** y habilita las siguientes acciones para el tipo `Tarea`:

- `find`
- `findOne`
- `create`
- `update`
- `delete`

Guarda los cambios.

### 8. Verificar el endpoint

```bash
curl http://localhost:1337/api/tareas
```

La respuesta debe tener la forma `{ "data": [], "meta": { ... } }`.

---

## Frontend — Configuración local

### 1. Clonar el repositorio

```bash
git clone https://github.com/macobosf/guia-strapi-frontend
cd guia-strapi-frontend
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar el entorno de desarrollo

Edita `src/environments/environment.development.ts`:

```typescript
export const environment = {
  production: false,
  strapiUrl: 'http://localhost:1337/api'
};
```

Este valor ya viene configurado por defecto en el repositorio.

### 4. Sobre la configuración zoneless

El proyecto usa `provideZonelessChangeDetection` en `app.config.ts`, que es el mecanismo de detección de cambios sin Zone.js introducido en Angular 18 y estabilizado en versiones posteriores.

```typescript
// src/app/app.config.ts
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient()
  ]
};
```

No uses `provideZoneChangeDetection` en este proyecto: requiere el polyfill `zone.js` en `polyfills`, que no está incluido. Mezclar ambas configuraciones produce el error `NG0908`.

### 5. Iniciar el servidor de desarrollo

```bash
pnpm start
```

La aplicación estará disponible en `http://localhost:4200`.

---

## Modelo de datos

La interfaz `Tarea` en `src/app/models/tarea.ts` refleja la respuesta de la API de Strapi v5:

| Campo | Tipo TypeScript | Notas |
|---|---|---|
| `id` | `number` | ID numérico interno de Strapi |
| `documentId` | `string` | Identificador estable para update/delete en Strapi v5 |
| `titulo` | `string` | Requerido |
| `descripcion` | `string \| undefined` | Opcional |
| `completada` | `boolean` | Default `false` |
| `prioridad` | `'baja' \| 'media' \| 'alta'` | Enumeration |
| `createdAt` | `string` | ISO 8601, generado por Strapi |
| `updatedAt` | `string` | ISO 8601, generado por Strapi |
| `publishedAt` | `string \| undefined` | Generado por Strapi |

> El nombre de cada campo debe coincidir exactamente (respetando mayúsculas y minúsculas) con el atributo definido en el `schema.json` del Content-Type en Strapi. El archivo relevante en el backend es `src/api/tarea/content-types/tarea/schema.json`.

---

## Arquitectura del frontend

### TareaService (`src/app/services/tarea.ts`)

Encapsula el acceso a la API. Usa `HttpClient` con RxJS para exponer observables tipados.

Strapi v5 envuelve todas las respuestas en `{ data, meta }`. El servicio mapea la respuesta internamente:

```typescript
getAll(): Observable<Tarea[]> {
  return this.http
    .get<StrapiListResponse<Tarea>>(`${this.baseUrl}?sort=createdAt:desc`)
    .pipe(map(res => res.data));
}
```

Para las operaciones de modificación (`update`, `delete`), Strapi v5 requiere el `documentId` (cadena) en lugar del `id` numérico. El payload de escritura se envuelve en `{ data: ... }`:

```typescript
update(documentId: string, tarea: Partial<Tarea>): Observable<Tarea> {
  return this.http
    .put<StrapiSingleResponse<Tarea>>(`${this.baseUrl}/${documentId}`, { data: tarea })
    .pipe(map(res => res.data));
}
```

### Componente Tareas (`src/app/components/tareas/tareas.ts`)

Componente standalone que gestiona el estado con signals de Angular:

```typescript
tareas = signal<Tarea[]>([]);
cargando = signal(false);
error = signal<string | null>(null);
```

Importa `FormsModule` directamente (no hay módulo raíz) para usar `ngModel` en el formulario de creación.

---

## Deploy del backend a Strapi Cloud

### 1. Preparar el repositorio

Asegúrate de que el `.gitignore` del backend excluya:

```
node_modules
.env
.tmp
build
dist
```

Sube el código a GitHub en la rama `main`.

### 2. Conectar con Strapi Cloud

1. Accede a [cloud.strapi.io](https://cloud.strapi.io) e inicia sesión.
2. Crea un nuevo proyecto y conecta el repositorio de GitHub.
3. Selecciona la rama `main`. Strapi Cloud detecta automáticamente el proyecto y configura el build.
4. El deploy se dispara automáticamente en cada push a `main`.

Strapi Cloud provisiona PostgreSQL automáticamente. No es necesario configurar la base de datos manualmente.

### 3. Crear el usuario administrador en producción

Una vez desplegado, accede al panel en `https://tu-proyecto.strapiapp.com/admin` y crea el usuario administrador.

### 4. Configurar permisos públicos en producción

Repite el mismo proceso que en local: **Settings > Users & Permissions Plugin > Roles > Public**, habilita `find`, `findOne`, `create`, `update` y `delete` para `Tarea`.

### 5. Verificar

```bash
curl https://tu-proyecto.strapiapp.com/api/tareas
```

---

## Deploy del frontend a Firebase Hosting

### 1. Actualizar el entorno de producción

Edita `src/environments/environment.ts` con la URL de tu proyecto en Strapi Cloud:

```typescript
export const environment = {
  production: true,
  strapiUrl: 'https://tu-proyecto.strapiapp.com/api'
};
```

### 2. Instalar Firebase CLI

```bash
pnpm add -D firebase-tools
```

### 3. Autenticarse en Firebase

```bash
npx firebase login
```

### 4. Inicializar Firebase Hosting

```bash
npx firebase init hosting
```

Responde a las preguntas del asistente:

- **What do you want to use as your public directory?** `dist/frontend/browser`
- **Configure as a single-page app (rewrite all urls to /index.html)?** `Yes`
- **Set up automatic builds and deploys with GitHub?** `No`

> Si aparece el error `Could not load dependency "vite"` durante este paso, vite no está instalado. Instálalo antes de reintentar:
> ```bash
> pnpm add -D vite
> ```
> vite ya está incluido como devDependency en este repositorio, por lo que este error no debería ocurrir si ejecutaste `pnpm install` correctamente.

### 5. Compilar la aplicación

```bash
pnpm build
```

El resultado se genera en `dist/frontend/browser/`.

### 6. Desplegar

```bash
npx firebase deploy --only hosting
```

La aplicación quedará disponible en `https://tu-proyecto.web.app`.

---

## Solución de problemas

| Error | Causa | Solución |
|---|---|---|
| `ERR_PNPM_IGNORED_BUILDS` al instalar Strapi | pnpm bloquea scripts de instalación de terceros por seguridad | Ejecuta `pnpm approve-builds` y selecciona los paquetes solicitados |
| `NG0908: Angular requires Zone.js` | Se usó `provideZoneChangeDetection` sin el polyfill `zone.js`, o coexiste con `provideZonelessChangeDetection` | Usa únicamente `provideZonelessChangeDetection` en `app.config.ts` |
| HTTP 400 `Invalid key [nombre_campo]` al hacer POST | El nombre del campo en la interfaz TypeScript no coincide con el atributo definido en el schema de Strapi (diferencia de mayúsculas/minúsculas) | Revisa `src/api/tarea/content-types/tarea/schema.json` en el backend y alinea los nombres exactos |
| HTTP 403 Forbidden en cualquier endpoint | Los permisos del rol Public no están configurados | Ve a **Settings > Roles > Public** en el panel de Strapi y habilita las acciones necesarias |
| `Could not load dependency "vite"` en `firebase init hosting` | vite no está instalado como devDependency | Ejecuta `pnpm add -D vite` antes de reintentar |

---

## Stack tecnológico

| Tecnología | Versión |
|---|---|
| Node.js | 24.15.0 |
| pnpm | 11.4.0 |
| Angular | 22.0.0 |
| TypeScript | 6.0 |
| RxJS | 7.8 |
| Strapi | 5.48.0 |
| Base de datos (local) | SQLite |
| Base de datos (producción) | PostgreSQL (Strapi Cloud) |
| Hosting frontend | Firebase Hosting |

---

## Repositorio relacionado

Backend (Strapi v5): [macobosf/guia-strapi-backend](https://github.com/macobosf/guia-strapi-backend)

---

## Licencia

MIT
