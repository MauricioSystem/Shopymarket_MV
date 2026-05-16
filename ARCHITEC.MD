# 🏗️ Arquitectura del Sistema - Shopy Market

Este documento describe la arquitectura técnica de **Shopy Market**, una plataforma escalable de ecommerce y servicios. El sistema está diseñado bajo el patrón **Modelo-Vista-Controlador (MVC)**, garantizando una separación clara entre la interfaz de usuario, la lógica de negocio y la gestión de datos.

---

## 🚀 Stack Tecnológico

| Capa               | Tecnología                     | Descripción                                           |
|--------------------|--------------------------------|-------------------------------------------------------|
| **Frontend**       | React.js / Next.js             | Framework para interfaces de usuario dinámicas y SEO. |
| **Backend**        | Node.js + Express              | Entorno de ejecución y framework para la API REST.    |
| **Base de Datos**  | PostgreSQL                     | Sistema de gestión de base de datos relacional.       |
| **Estilos**        | Tailwind CSS                   | Framework de CSS para un diseño moderno y rápido.     |
| **Autenticación**  | JWT (JSON Web Tokens)          | Manejo de sesiones y seguridad por roles.             |
| **Almacenamiento** | Cloudinary / AWS S3            | Gestión de imágenes de productos y perfiles.          |

---

## 🧩 Patrón de Diseño: MVC

### 1. Modelo (Model)
Gestiona la estructura de los datos y las reglas de negocio a nivel de persistencia. Se comunica directamente con **PostgreSQL**.

- **Estructura de Datos:** Definida en tablas relacionales para usuarios, tiendas, productos, órdenes y suscripciones.
- **Validaciones:** Asegura que los datos ingresados cumplan con los tipos y restricciones (ej: emails únicos, precios positivos).
- **Relaciones:** Maneja la complejidad de relaciones Muchos-a-Muchos (ej: `user_roles`) y Uno-a-Muchos (ej: `store_products`).

### 2. Vista (View)
Es la interfaz interactiva. En esta arquitectura, la "Vista" es un **Frontend desacoplado** que consume servicios del Backend.

- **Dashboard Cliente:** Navegación, carrito y seguimiento de pedidos.
- **Dashboard Admin:** Gestión de inventario, personalización de tienda y reporte de ventas.
- **Dashboard Repartidor:** Mapa de entregas y gestión de estados de orden.
- **Dashboard Super Admin:** Control total de la plataforma y usuarios.

### 3. Controlador (Controller)
Actúa como el cerebro del sistema, procesando las peticiones de la Vista y coordinando con el Modelo.

- **API RESTful:** Define los endpoints para cada recurso (`/api/products`, `/api/orders`, etc.).
- **Middleware:** Gestiona la seguridad (verificar si el usuario tiene el rol adecuado) y el parseo de datos.
- **Lógica de Negocio:** Calcula descuentos de suscripciones, procesa pagos y gestiona el flujo de inventario.

---

## 📂 Estructura de Directorios (Distribución)

Para mantener la organización y escalabilidad del proyecto siguiendo el patrón MVC, se propone la siguiente distribución de carpetas:

### 🖥️ Backend (Node.js + Express)
```text
/backend
├── src/
│   ├── config/             # Configuraciones de Base de Datos y Variables de Entorno
│   ├── controllers/        # Lógica de las peticiones (Cerebro del sistema)
│   ├── models/             # Esquemas y consultas a PostgreSQL (Persistencia)
│   ├── routes/             # Definición de rutas y endpoints de la API
│   ├── middlewares/        # Validaciones de JWT, Roles y Errores
│   ├── services/           # Integraciones externas (Pasarela de pagos, Email, AI)
│   ├── utils/              # Funciones de ayuda y constantes
│   └── app.js              # Punto de entrada de la aplicación
├── .env                    # Secretos y credenciales
└── package.json            # Dependencias del servidor
```

### 🎨 Frontend (React / Next.js)
```text
/frontend
├── public/                 # Imágenes estáticas y activos globales
├── src/
│   ├── components/         # Componentes reutilizables (Botones, Cards, Navbar)
│   ├── dashboards/         # Vistas específicas por Rol (Admin, Cliente, Repartidor)
│   ├── hooks/              # Lógica de estado y efectos reutilizables
│   ├── services/           # Llamadas a la API del Backend (Axios/Fetch)
│   ├── context/            # Gestión del estado global (Auth, Carrito)
│   ├── styles/             # Archivos de CSS Global y configuración de Tailwind
│   └── pages/              # Enrutado dinámico de la aplicación
├── tailwind.config.js      # Configuración de estilos
└── package.json            # Dependencias de la interfaz
```

---

## 🛠️ Desglose de Módulos Principales

### 🔐 Autenticación y Autorización
Utiliza una estrategia de **RBAC (Role-Based Access Control)**.
- El sistema verifica el `role_id` del usuario en cada petición sensible.
- Las rutas están protegidas para asegurar que, por ejemplo, un Cliente no pueda acceder a las funciones de un Super Admin.

### 🛒 Gestión de Órdenes y Pagos
1. **Carrito:** Se almacena de forma persistente en la BD para que el cliente no lo pierda entre dispositivos.
2. **Orden:** Al confirmar, se genera un registro en `orders` con estado `pending`.
3. **Pago:** La integración con la pasarela valida la transacción y actualiza el estado a `paid`.
4. **Logística:** La orden aparece automáticamente en el radar de los Repartidores.

### 🤖 Chatbot de Asistencia
El controlador de Chatbot se integra con una API de IA (ej: Gemini/OpenAI) para:
- Consultar el catálogo de productos dinámicamente.
- Responder dudas sobre estados de pedidos.
- Proporcionar soporte básico 24/7.

---

## 📈 Escalabilidad y Mantenimiento
- **Código Limpio:** Separación de carpetas por `routes`, `controllers`, `models` y `services`.
- **Variables de Entorno:** Configuración segura para credenciales de BD y APIs externas.
- **Documentación de API:** Se recomienda el uso de Swagger para documentar todos los endpoints disponibles.

---
*Documento generado para el equipo de desarrollo de Shopy Market.*
