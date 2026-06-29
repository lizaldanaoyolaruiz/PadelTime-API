<div align="center">

<a href="https://padel-time-roan.vercel.app" target="_blank">
  <img src="https://res.cloudinary.com/dabikk5ei/image/upload/padeltime/assets/logo_white.png" alt="PadelTime Logo" width="320"/>
</a>

# PadelTime — Backend API

**API REST para la plataforma SaaS de reservas de canchas de pádel**

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://padel-time-api.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

🔌 **[API en producción](https://padel-time-api.vercel.app)** · 🌐 **[Repositorio Frontend](https://github.com/lizaldanaoyolaruiz/PadelTime)**

</div>

---

## 📋 Índice

- [Descripción](#-descripción)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Variables de Entorno](#-variables-de-entorno)
- [Scripts Disponibles](#-scripts-disponibles)
- [Modelos de Base de Datos](#-modelos-de-base-de-datos)
- [API Reference](#-api-reference)
- [Servicios Externos](#-servicios-externos)
- [Equipo](#-equipo)

---

## 📖 Descripción

Este repositorio contiene el **backend** de PadelTime: una API REST construida con Node.js y Express que gestiona autenticación, complejos deportivos, canchas, reservas y pagos.

Se conecta a **MongoDB Atlas** como base de datos, utiliza **Cloudinary** para el almacenamiento de imágenes, **Mercado Pago** para el procesamiento de pagos y **SMTP** para el envío de notificaciones por email.

---

## 🛠️ Stack Tecnológico

| Tecnología             | Uso                                     |
| ---------------------- | --------------------------------------- |
| **Node.js**            | Runtime del servidor                    |
| **Express**            | Framework web y manejo de rutas         |
| **MongoDB + Mongoose** | Base de datos NoSQL                     |
| **JWT**                | Autenticación stateless                 |
| **Bcrypt**             | Hash seguro de contraseñas              |
| **Express Validator**  | Validación de entradas en los endpoints |
| **Cloudinary**         | Almacenamiento y CDN de imágenes        |
| **Mercado Pago SDK**   | Procesamiento de pagos (seña)           |
| **Nodemailer**         | Envío de emails via SMTP                |
| **Multer**             | Manejo de archivos en las subidas       |

---

## 📁 Estructura del Proyecto

```
📁 BACKEND — PadelTime-API
│
├── server.js
├── package.json
│
└── src/
    │
    ├── config/
    │   ├── db.js
    │   ├── cloudinary.js
    │   └── chatbotPrompt.js
    │
    ├── controllers/
    │   ├── adminController.js
    │   ├── authController.js
    │   ├── blockoutController.js
    │   ├── bookingController.js
    │   ├── chatbotController.js
    │   ├── complexController.js
    │   ├── contactController.js
    │   ├── courtController.js
    │   ├── favoriteController.js
    │   ├── maintenanceController.js
    │   ├── metricsController.js
    │   ├── paymentController.js
    │   ├── reportController.js
    │   ├── reviewController.js
    │   ├── scheduleController.js
    │   ├── tournamentController.js
    │   └── userController.js
    │
    ├── middlewares/
    │   ├── authMiddleware.js
    │   ├── roleMiddleware.js
    │   ├── validateMiddleware.js
    │   ├── uploadMiddleware.js
    │   ├── resolveNameMiddleware.js
    │   ├── adminValidationMiddleware.js
    │   ├── authValidationMiddleware.js
    │   ├── complexValidationMiddleware.js
    │   ├── contactValidationMiddleware.js
    │   ├── courtValidationMiddleware.js
    │   ├── reviewValidationMiddleware.js
    │   └── tournamentValidationMiddleware.js
    │
    ├── models/
    │   ├── User.js
    │   ├── Complex.js
    │   ├── Court.js
    │   ├── Booking.js
    │   ├── Schedule.js
    │   ├── Blockout.js
    │   ├── MaintenanceSlot.js
    │   ├── Review.js
    │   ├── Tournament.js
    │   └── ActivityLog.js
    │
    ├── routes/
    │   ├── index.js
    │   ├── adminRoutes.js
    │   ├── authRoutes.js
    │   ├── blockoutRoutes.js
    │   ├── bookingRoutes.js
    │   ├── chatbotRoutes.js
    │   ├── complexRoutes.js
    │   ├── contactRoutes.js
    │   ├── courtRoutes.js
    │   ├── favoriteRoutes.js
    │   ├── maintenanceRoutes.js
    │   ├── metricsRoutes.js
    │   ├── paymentRoutes.js
    │   ├── reportRoutes.js
    │   ├── reviewRoutes.js
    │   ├── tournamentRoutes.js
    │   └── userRoutes.js
    │
    ├── services/
    │   ├── emailService.js
    │   ├── exportService.js
    │   ├── metricsService.js
    │   ├── mpService.js
    │   └── scheduleService.js
    │
    ├── utils/
    │   ├── encryption.js
    │   ├── generateToken.js
    │   └── timeHelpers.js
    │
    ├── db/
    │   └── seed.js
    │
    └── scripts/
        ├── diagnoseMp.js
        └── setupMpToken.js

```

---

## 🚀 Instalación

### Prerequisitos

- Node.js >= 18.x
- npm >= 9.x
- Cuenta en MongoDB Atlas
- Cuenta en Cloudinary
- Cuenta de Mercado Pago (sandbox para desarrollo)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/lizaldanaoyolaruiz/PadelTime-API.git
cd PadelTime-API

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores correspondientes

# 4. Correr en desarrollo
npm run dev
```

La API estará disponible en `http://localhost:3000`

---

## 🔐 Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
MONGODB_URI=mongodb+srv://<usuario>:<password>@padelTimeClauster.mongodb.net/padeltime

# JWT
JWT_SECRET=tu_jwt_secret_aqui
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Mercado Pago
MP_MASTER_KEY=tu_master_key

# SMTP / Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
EMAIL_FROM=noreply@padeltime.com

# Frontend URL (CORS y links en emails)
FRONTEND_URL=http://localhost:5173
```

> ⚠️ Nunca commitees el archivo `.env` con credenciales reales. Verificá que esté en `.gitignore`.

---

## 📜 Scripts Disponibles

```bash
npm run dev     # Servidor con nodemon (hot reload)
npm start       # Servidor en producción
```

---

## 🗄️ Modelos de Base de Datos

### User

```js
{
  name: String,
  email: String,         // único
  password: String,      // hasheado con bcrypt
  role: String,          // 'superadmin' | 'owner' | 'client'
  createdAt: Date
}
```

### Complex

```js
{
  name: String,
  description: String,
  address: String,
  phone: String,
  whatsapp: String,
  schedule: String,
  images: [String],      // URLs de Cloudinary
  status: String,        // 'pending' | 'approved' | 'suspended'
  ownerId: ObjectId,     // ref: User
  depositPercent: Number, // 20 | 30 | 50
  mpKey: String,         // master key de Mercado Pago del propietario
  createdAt: Date
}
```

### Court

```js
{
  complexId: ObjectId,   // ref: Complex
  name: String,
  description: String,
  pricePerHour: Number,
  status: String,        // 'enabled' | 'disabled'
  images: [String],      // URLs de Cloudinary
  schedule: [String],    // horarios disponibles
  createdAt: Date
}
```

### Tournament

```js
{
  complexId: ObjectId,   // ref: Complex
  name: String,
  date: Date,
  createdAt: Date
}
```

### Reservation

```js
{
  userId: ObjectId,      // ref: User
  complexId: ObjectId,   // ref: Complex
  courtId: ObjectId,     // ref: Court
  date: Date,
  hour: String,
  status: String,        // 'pending' | 'confirmed' | 'rejected'
  confirmationMethod: String, // 'whatsapp' | 'mercadopago'
  paymentId: String,     // ID de pago de Mercado Pago
  createdAt: Date
}
```

---

## 📡 API Reference

Base URL: `https://padel-time-api.vercel.app/api`

> 🔒 Los endpoints marcados con **JWT** requieren el header `Authorization: Bearer <token>`

---

### 🔑 Auth

| Método | Endpoint         | Descripción                    | Auth   |
| ------ | ---------------- | ------------------------------ | ------ |
| `POST` | `/auth/register` | Registro de usuario            | ❌     |
| `POST` | `/auth/login`    | Inicio de sesión, devuelve JWT | ❌     |
| `GET`  | `/auth/me`       | Datos del usuario autenticado  | 🔒 JWT |

---

### 🏟️ Complejos

| Método | Endpoint                  | Descripción                 | Auth     |
| ------ | ------------------------- | --------------------------- | -------- |
| `GET`  | `/complexes`              | Listar complejos aprobados  | ❌       |
| `GET`  | `/complexes/search?name=` | Buscar complejos por nombre | ❌       |
| `GET`  | `/complexes/:id`          | Detalle de un complejo      | ❌       |
| `POST` | `/complexes`              | Crear complejo              | 🔒 Owner |
| `PUT`  | `/complexes/:id`          | Editar complejo             | 🔒 Owner |
| `GET`  | `/complexes/my`           | Obtener mi complejo         | 🔒 Owner |

---

### 🎾 Canchas

| Método   | Endpoint                | Descripción                   | Auth     |
| -------- | ----------------------- | ----------------------------- | -------- |
| `GET`    | `/complexes/:id/courts` | Listar canchas de un complejo | ❌       |
| `POST`   | `/complexes/:id/courts` | Crear cancha                  | 🔒 Owner |
| `PUT`    | `/courts/:id`           | Editar cancha                 | 🔒 Owner |
| `DELETE` | `/courts/:id`           | Eliminar cancha               | 🔒 Owner |

---

### 📅 Reservas

| Método  | Endpoint                   | Descripción               | Auth      |
| ------- | -------------------------- | ------------------------- | --------- |
| `POST`  | `/reservations`            | Crear reserva             | 🔒 Client |
| `GET`   | `/reservations/my`         | Mis reservas              | 🔒 Client |
| `GET`   | `/reservations/complex`    | Reservas del complejo     | 🔒 Owner  |
| `PATCH` | `/reservations/:id/status` | Cambiar estado de reserva | 🔒 Owner  |

---

### 🏆 Torneos

| Método   | Endpoint                     | Descripción                   | Auth     |
| -------- | ---------------------------- | ----------------------------- | -------- |
| `GET`    | `/complexes/:id/tournaments` | Listar torneos de un complejo | ❌       |
| `POST`   | `/complexes/:id/tournaments` | Crear torneo                  | 🔒 Owner |
| `PUT`    | `/tournaments/:id`           | Editar torneo                 | 🔒 Owner |
| `DELETE` | `/tournaments/:id`           | Eliminar torneo               | 🔒 Owner |

---

### 💳 Pagos

| Método | Endpoint                      | Descripción                  | Auth      |
| ------ | ----------------------------- | ---------------------------- | --------- |
| `POST` | `/payments/create-preference` | Crear preferencia de pago MP | 🔒 Client |
| `POST` | `/payments/webhook`           | Webhook de Mercado Pago      | ❌        |

---

### 🔧 Super Admin

| Método   | Endpoint                       | Descripción                | Auth     |
| -------- | ------------------------------ | -------------------------- | -------- |
| `GET`    | `/admin/complexes`             | Listar todos los complejos | 🔒 Admin |
| `PATCH`  | `/admin/complexes/:id/approve` | Aprobar complejo           | 🔒 Admin |
| `PATCH`  | `/admin/complexes/:id/suspend` | Suspender complejo         | 🔒 Admin |
| `GET`    | `/admin/users`                 | Listar todos los usuarios  | 🔒 Admin |
| `DELETE` | `/admin/users/:id`             | Eliminar usuario           | 🔒 Admin |

---

## ☁️ Servicios Externos

### Cloudinary

Las imágenes de complejos y canchas se suben a Cloudinary y se almacenan las URLs en la base de datos. Se usa Multer como middleware para recibir los archivos en el servidor antes de subirlos.

### Mercado Pago

El propietario configura su Master Key desde el panel. Al realizar una reserva con seña, se crea una preferencia de pago y se redirige al usuario al checkout de Mercado Pago. Un webhook notifica al backend cuando el pago se acredita y la reserva pasa a `confirmed` automáticamente.

### SMTP / Nodemailer

Se envían emails automáticos en los siguientes eventos:

- Registro de nuevo usuario
- Confirmación de reserva realizada
- Cambio de estado de reserva (confirmada / rechazada)
- Aprobación de complejo por el Super Admin

---

## 👨‍💻 Equipo

| Nombre                      | Rol           |
| --------------------------- | ------------- |
| **Marisol Lamas**           | Scrum Master  |
| **Aldana Liz Oyola Ruiz**   | Líder Técnica |
| **Facundo Camaño**          | Desarrollo    |
| **Octavio Fernández Caram** | Desarrollo    |

---

## 📄 Licencia

Proyecto Final de curso © 2026 PadelTime.

---

<div align="center">

<a href="https://padel-time-roan.vercel.app" target="_blank">
  🌐 padel-time-roan.vercel.app
</a>

</div>
