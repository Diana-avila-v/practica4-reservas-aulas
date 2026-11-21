# Reservas de Aulas — Práctica 4 Full Stack

Aplicación web para que cada usuario registrado gestione sus **reservas de aulas** (aula, fecha, hora y motivo).
El backend es una API REST con autenticación por **JWT** y el frontend es una SPA en **React**.

## Tecnologías

| Parte    | Tecnologías |
|----------|-------------|
| Backend  | Node.js 20, Express 5, MongoDB + Mongoose 8, bcrypt, jsonwebtoken, dotenv, cors |
| Frontend | React 19, Vite 6, React Router 7, axios, CSS propio (sin librerías de UI) |
| Raíz     | concurrently (levanta backend y frontend a la vez) |

## Funcionalidades

**Autenticación**
- Registro con nombre, email, contraseña y confirmación (validación en el formulario y en la API).
- Las contraseñas se guardan cifradas con bcrypt y nunca se devuelven en las respuestas.
- Login que devuelve un JWT. El frontend guarda el token y los datos del usuario en `localStorage`.
- Todas las peticiones protegidas envían `Authorization: Bearer <token>`.
- Si la API responde 401 (token inválido o expirado), se borra la sesión y se redirige al login con el aviso “Sesión expirada”.
- Rutas protegidas (`RutaProtegida`). Con la sesión iniciada no se puede volver al login ni al registro.

**Reservas (CRUD protegido)**
- Crear, listar, ver, editar y eliminar (con confirmación) reservas propias. Nadie ve ni modifica las reservas de otro usuario.
- Búsqueda por texto (aula o motivo) y filtro por fecha. En el aula se ignoran espacios y mayúsculas: buscar `lab4` encuentra `A1, Lab 4`.
- El nombre del aula se normaliza al guardar: se quitan los espacios sobrantes y se deja `", "` tras cada coma (`"  A1 ,Lab   4 "` → `"A1, Lab 4"`).
- Las reservas son **bloques fijos de 1 hora** que empiezan en punto, de `07:00 – 08:00` a `20:00 – 21:00`. En el formulario se eligen en un desplegable (los bloques de hoy que ya empezaron aparecen desactivados) y la tabla muestra el rango.
- Un aula no se puede reservar dos veces en el mismo bloque (mismo día y hora). Se compara ignorando espacios y mayúsculas: `A1, Lab4`, `a1,lab 4` y `A1, Lab 4` son la misma aula. La API responde **409** y la interfaz lo explica.
- No se puede reservar en el pasado: se rechaza una fecha anterior a hoy o, si es hoy, un bloque que ya empezó. Se usa la hora de **Ecuador (America/Guayaquil, UTC-5)**. La API responde **400** con “No puedes reservar en una fecha u hora pasada”, y el formulario lo valida antes de enviar (el selector de fecha no permite días anteriores a hoy).
- La API solo acepta horas en punto entre `07:00` y `20:00` (inicio del bloque). Cualquier otra (`08:30`, `21:00`…) devuelve **400** con un mensaje claro.
- Las reservas antiguas con minutos sueltos (por ejemplo `07:12`), creadas antes de los bloques, se siguen mostrando con la etiqueta “fuera de bloque”. Se pueden ver y eliminar, y al editarlas hay que elegir un bloque.

**Interfaz**
- Diseño limpio y responsive: en el móvil la tabla se convierte en tarjetas.
- Mensajes de éxito y error visibles e indicadores de “cargando”.

**Errores**
- Manejo centralizado en el backend con mensajes en español: `{ "mensaje": "...", "errores": ["..."] }`.

## Endpoints de la API

Base: `http://localhost:4000/api`

| Método | Ruta | Protegida | Descripción |
|--------|------|:---------:|-------------|
| POST   | `/auth/register` | No | Registra un usuario. Body: `{ nombre, email, password }` → 201 |
| POST   | `/auth/login`    | No | Inicia sesión. Body: `{ email, password }` → `{ token, usuario }` |
| GET    | `/auth/me`       | Sí | Datos del usuario autenticado |
| GET    | `/reservas`      | Sí | Lista tus reservas. Query opcional: `q` (texto en aula/motivo; en el aula ignora espacios y mayúsculas), `aula` (exacta, ignorando espacios y mayúsculas), `fecha` (`AAAA-MM-DD`) |
| POST   | `/reservas`      | Sí | Crea una reserva. Body: `{ aula, fecha: "AAAA-MM-DD", hora: "HH:00", motivo }`. `hora` es el inicio del bloque de 1 hora (`07:00` … `20:00`) y no puede haber empezado ya (hora de Ecuador) |
| GET    | `/reservas/:id`  | Sí | Ver una reserva |
| PUT    | `/reservas/:id`  | Sí | Editar (se pueden enviar solo los campos a cambiar). Si cambia la fecha o la hora, el resultado no puede quedar en el pasado |
| DELETE | `/reservas/:id`  | Sí | Eliminar |
| GET    | `/health`        | No | Comprobación rápida de que la API está en marcha |

**Códigos de respuesta**

| Código | Significado |
|--------|-------------|
| 400 | Validación fallida (incluye fecha u hora pasada y hora que no es un bloque de 07:00 a 20:00), id mal formado o JSON inválido |
| 401 | Falta el token, no es válido o expiró; o credenciales incorrectas |
| 404 | La reserva no existe o no es tuya |
| 409 | Email ya registrado o aula ya reservada a esa hora |
| 500 | Error interno |

## Estructura del proyecto

```
practica4-fullstack/
├── package.json            # scripts para levantar todo junto
├── backend/
│   ├── server.js           # arranque: conecta a MongoDB y escucha
│   ├── app.js              # Express: CORS, JSON, rutas y manejo de errores
│   ├── .env.example
│   ├── config/             # env.js (variables), db.js (conexión Mongo), migraciones.js (ajustes de datos al arrancar)
│   ├── models/             # Usuario.js, Reserva.js
│   ├── controllers/        # authController.js, reservaController.js
│   ├── routes/             # authRoutes.js, reservaRoutes.js
│   ├── middleware/         # auth.js (JWT), errorHandler.js
│   └── utils/              # AppError.js, fechaHora.js (fecha/hora de Ecuador), aula.js (normalización del aula)
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── .env.example
    └── src/
        ├── main.jsx, App.jsx, index.css
        ├── api/            # client.js (axios + interceptores), sesion.js
        ├── context/        # AuthContext.jsx (sesión global)
        ├── components/     # Navbar, RutaProtegida, RutaPublica, Alerta, Cargando, ReservaForm, ReservaTabla
        ├── pages/          # Login, Registro, Dashboard
        └── utils/          # fechas.js, validaciones.js
```

## Cómo ejecutarlo

### Requisitos
- Node.js 20 o superior y npm.
- MongoDB: puede ser local (puerto 27017) o una base gratuita en MongoDB Atlas.

### 1. Instalar dependencias (desde la raíz)
```bash
npm run instalar
```

### 2. Configurar variables de entorno
```bash
# backend
cp backend/.env.example backend/.env
# frontend
cp frontend/.env.example frontend/.env
```
En Windows PowerShell usa `Copy-Item` en lugar de `cp`.

`backend/.env`:

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `PORT` | `4000` | Puerto de la API |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/practica4` | Conexión a MongoDB (o la URI de Atlas) |
| `JWT_SECRET` | cadena larga aleatoria | Clave para firmar los tokens |
| `JWT_EXPIRES_IN` | `1d` | Duración del token (`15m`, `1h`, `1d`…) |
| `CLIENT_URL` | `http://localhost:5173` | Origen del frontend permitido por CORS (opcional) |

`frontend/.env`:

| Variable | Ejemplo |
|----------|---------|
| `VITE_API_URL` | `http://localhost:4000/api` |

### 3. Arrancar

Los dos a la vez, desde la raíz:
```bash
npm run dev
```

Por separado, cada uno en su terminal:
```bash
cd backend && npm run dev     # API en http://localhost:4000
cd frontend && npm run dev    # Web en http://localhost:5173
```

Al arrancar, el backend revisa las reservas ya guardadas: normaliza su aula, les calcula la clave de comparación y actualiza los índices. Si dos reservas antiguas resultan ser la misma aula el mismo día a la misma hora (por ejemplo `A1, Lab4` y `A1, Lab 4`), lo muestra como `AVISO` en la consola con sus ids. En ese caso elimina o cambia una de ellas y reinicia. Mientras tanto, la API sigue rechazando duplicados nuevos. También avisa de las reservas **futuras** con hora fuera de bloque (por ejemplo `07:12`): conviene editarlas para elegir un bloque o eliminarlas, porque podrían cruzarse con un bloque nuevo de la misma aula. Las pasadas no molestan.

Build de producción del frontend:
```bash
npm run build        # genera frontend/dist
```
