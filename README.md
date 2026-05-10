# 🍽️ GastroFlow API

Backend de GastroFlow, una plataforma de gestión gastronómica diseñada para digitalizar y optimizar la operación de restaurantes.

La aplicación permite administrar reservas, órdenes, flujo de cocina, empleados, pagos y métricas en tiempo real, ofreciendo una solución integral tanto para restaurantes como para sus clientes.

Desarrollado utilizando arquitectura modular y buenas prácticas backend, priorizando la escalabilidad, mantenibilidad y organización del código.

---

# 🚀 Funcionalidades

## 👥 Gestión de usuarios y autenticación

- Registro e inicio de sesión
- Autenticación con JWT
- Inicio de sesión con Google OAuth 2.0
- Sistema de roles y permisos
- Protección de rutas mediante Guards

---

## 🍽️ Gestión gastronómica

- Creación y administración de restaurantes
- Gestión de mesas
- Gestión de empleados:
  - Meseros
  - Cocineros
  - Cajeros
- Gestión de platillos y categorías
- Menú digital

---

## 🧾 Órdenes y cocina

- Creación de órdenes/comandas
- Actualización de estados en tiempo real
- Flujo de cocina
- Cierre y pago de órdenes
- Historial de órdenes

---

## 🪑 Reservas

- Reservas online
- Señal de pago para reservas
- Gestión de disponibilidad de mesas
- Confirmaciones automáticas

---

## 💳 Pagos y suscripciones

- Integración con Stripe
- Manejo de suscripciones
- Procesamiento de pagos

---

## 📊 Métricas y estadísticas

- Estadísticas de órdenes
- Métricas de cocina
- Rendimiento de empleados
- Información de pagos y facturación

---

## 📩 Notificaciones y soporte

- Envío de emails automáticos mediante Brevo
- Chat de soporte integrado

---

# 🧱 Arquitectura

El proyecto sigue una arquitectura modular basada en NestJS, enfocada en la separación de responsabilidades y escalabilidad.

## Buenas prácticas implementadas

- Arquitectura modular
- DTO Validation
- Guards & Interceptors
- Manejo centralizado de errores
- Variables de entorno
- Principios REST
- Relaciones complejas con TypeORM
- Separación por módulos y servicios

---

# ⚙️ Stack Tecnológico

## Backend

- NestJS
- TypeScript
- PostgreSQL
- TypeORM

## Autenticación y Seguridad

- JWT
- Google OAuth 2.0
- Role-Based Access Control (RBAC)

## Documentación

- Swagger / OpenAPI

## Servicios e Integraciones

- Stripe
- Cloudinary
- Brevo

---

# 📖 Documentación API

Swagger disponible en:

[gastroflow-swagger](https://back-gastroflow.onrender.com/api)
