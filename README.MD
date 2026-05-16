# 🛒 Shopy Market MV

**Shopy Market** es una plataforma de ecommerce y servicios que permite a los administradores crear y gestionar tiendas y servicios en línea, a los clientes comprar productos y contratar servicios, y a los repartidores gestionar la entrega de pedidos.

---

## 📋 Tabla de Contenidos

- [Roles de Usuario](#-roles-de-usuario)
- [Datos del Usuario](#-datos-del-usuario)
- [Tiendas](#-tiendas)
- [Servicios](#-servicios)
- [Productos](#-productos)
- [Categorías y Subcategorías](#-categorías-y-subcategorías)
- [Carrito de Compras](#-carrito-de-compras)
- [Órdenes](#-órdenes)
- [Pagos](#-pagos)
- [Chatbot Asistente](#-chatbot-asistente)
- [Suscripciones y Modelo de Financiación](#-suscripciones-y-modelo-de-financiación)

---

## 👥 Roles de Usuario

La plataforma cuenta con **4 roles** de usuario, cada uno con permisos y funcionalidades específicas:

### 🔴 Super Admin

- Es el administrador principal del sistema con **control total** sobre la plataforma.
- Solo existe **una única cuenta** de Super Admin, la cual se genera automáticamente mediante un *initializer* (seed/script de inicialización).
- Tiene acceso completo a todos los **CRUD** (Crear, Leer, Actualizar, Eliminar) de la plataforma: usuarios, tiendas, servicios, productos, órdenes, pagos, etc.
- Puede gestionar y supervisar a todos los demás usuarios (admins, clientes y repartidores).

### 🟠 Admin (Administrador de Tienda/Servicio)

- Es un usuario que puede **crear y administrar múltiples tiendas** dentro de la plataforma.
- Tiene control total sobre cada una de sus tiendas: productos, inventario, personalización visual, etc.
- También puede **crear un perfil de servicio** para ofrecer servicios profesionales.
- Puede tener **ambos perfiles activos simultáneamente** (tienda + servicio), y en ese caso:
  - Su perfil mostrará un enlace para acceder a su **tienda**.
  - Su perfil mostrará un enlace para acceder a su **servicio**.
  - El servicio puede estar **vinculado a la tienda**, ofreciendo una experiencia integrada al cliente.

### 🟢 Cliente

- Es el usuario comprador de la plataforma.
- Puede **navegar y explorar** tiendas, productos y servicios sin necesidad de estar autenticado.
- Para **agregar productos al carrito y realizar compras**, debe estar registrado e iniciar sesión.
- Tiene acceso a un **carrito de compras** personal.
- Puede **realizar seguimiento en tiempo real** del trayecto de sus pedidos una vez pagados.

### 🔵 Repartidor

- Es el usuario encargado de la **logística de entrega**.
- Puede visualizar y tomar **órdenes ya pagadas** disponibles para reparto.
- Gestiona el **recorrido de entrega**: recoge los productos, planifica la ruta y los entrega a los clientes.
- Su estado y ubicación pueden ser rastreados por el cliente durante el proceso de entrega.

---

## 🪪 Datos del Usuario

Cada usuario registrado en la plataforma debe contar con la siguiente información:

| Campo                  | Descripción                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| `id`                   | Identificador único generado automáticamente                      |
| `nombre`               | Nombre del usuario                                                |
| `apellido`             | Apellido del usuario                                              |
| `correo`               | Correo electrónico (único, utilizado para autenticación)          |
| `contraseña`           | Contraseña del usuario (almacenada de forma segura con hash)      |
| `teléfono`             | Número de teléfono de contacto                                    |
| `foto de perfil`       | Imagen de perfil del usuario                                      |
| `país`                 | País de residencia                                                |
| `ciudad`               | Ciudad de residencia                                              |
| `dirección geográfica` | Dirección física / coordenadas para entregas y ubicación en mapa  |
| `rol`                  | Rol asignado: `super_admin`, `admin`, `cliente` o `repartidor`    |
| `plan de suscripción`  | Plan activo del usuario: `sin_plan`, `básica`, `premium`, `vendedor_básica` o `vendedor_premium` |

---

## 🏪 Tiendas

Cada admin puede crear una o varias tiendas dentro de la plataforma. La tienda es el espacio donde se exhiben y venden productos.

### Personalización Visual

El admin puede personalizar la apariencia de su tienda:

- **Color de fondo** personalizado.
- **Foto de perfil** de la tienda (logo o imagen representativa).
- **Banner** de la tienda (imagen destacada que se muestra al ingresar).

### Gestión de Productos

Dentro de su tienda, el admin puede agregar productos con la siguiente información:

- Imagen del producto.
- Precio.
- Descripción.
- Cantidad de stock disponible.

### Ubicación de la Tienda

Cada tienda debe tener registrada su ubicación física:

- **País** donde opera.
- **Ciudad** donde se encuentra.
- **Dirección geográfica** exacta (coordenadas o dirección legible para ubicación en mapa).

---

## 🔧 Servicios

Además de tiendas, los admins pueden crear **perfiles de servicio** para ofrecer servicios profesionales (ej: reparaciones, instalaciones, consultorías, etc.).

### Personalización Visual

Similar a las tiendas, cada servicio puede ser personalizado:

- **Color de fondo** personalizado.
- **Foto de perfil** del servicio.
- **Banner** del servicio.

### Gestión de Servicios

Cada servicio publicado incluye:

- **Imagen** representativa del servicio.
- **Precio** del servicio.
- **Descripción** detallada de lo que incluye.
- **Tiempo estimado de realización** (ej: "2 horas", "3 días hábiles").

### Tienda + Servicio Simultáneo

Si un admin tiene **ambos perfiles** (tienda y servicio) activos al mismo tiempo:

- Su perfil público mostrará **dos enlaces separados**: uno para la tienda y otro para el servicio.
- El servicio puede estar **vinculado directamente a la tienda**, permitiendo que los clientes contraten servicios relacionados con los productos que venden.

---

## 📦 Productos

Cada producto dentro de una tienda debe contar con los siguientes campos:

| Campo              | Descripción                                                                |
| ------------------ | -------------------------------------------------------------------------- |
| `nombre`           | Nombre del producto                                                        |
| `descripción`      | Descripción detallada del producto                                         |
| `precio`           | Precio unitario del producto                                               |
| `stock`            | Cantidad de unidades disponibles en inventario                             |
| `imagen`           | Imagen principal del producto                                              |
| `categoría`        | Categoría general del producto (ej: Tecnología, Ropa, Alimentos)           |
| `subcategoría`     | Subcategoría dentro de la categoría (ej: Celulares, Laptops, Tablets)      |
| `calificación (⭐)` | Promedio de estrellas otorgadas por los clientes que compraron el producto  |
| `cantidad de ventas`| Número total de unidades vendidas de ese producto                          |

---

## 🗂 Categorías y Subcategorías

### Categoría (Global)

Las categorías funcionan a **nivel global** de la plataforma:

- Desde la página de inicio (home), cualquier usuario puede buscar por categoría (ej: "Tecnología").
- Al buscar una categoría, se muestran **todos los productos** de esa categoría provenientes de **todas las tiendas** registradas en la plataforma.
- Esto permite al usuario descubrir productos de múltiples vendedores en un solo lugar.

**Ejemplo:** Si un usuario busca "Tecnología" en el home, verá productos de tecnología de la Tienda A, Tienda B, Tienda C, etc.

### Subcategoría (Por Tienda)

Las subcategorías funcionan a **nivel de tienda individual**:

- Dentro de una tienda específica, los productos están organizados por subcategorías.
- Las subcategorías permiten una navegación más granular dentro del catálogo de una tienda.

**Ejemplo:** Dentro de una tienda de tecnología, las subcategorías podrían ser: Celulares, Laptops, Tablets, Accesorios, etc.

---

## 🛒 Carrito de Compras

El carrito de compras es una funcionalidad **exclusiva para usuarios con rol de cliente** que hayan iniciado sesión.

### Características

- Solo los **usuarios autenticados** pueden agregar productos al carrito.
- Los usuarios **no autenticados** pueden navegar y ver tiendas y productos, pero **no pueden agregar al carrito ni comprar**.
- El carrito muestra:
  - Lista de productos seleccionados.
  - **Cantidad** a comprar de cada producto.
  - **Precio unitario** de cada producto.
  - **Precio total** acumulado de todos los productos.
- El cliente puede **modificar cantidades** o **eliminar productos** del carrito antes de proceder al pago.

---

## 📋 Órdenes

Las órdenes representan las **compras confirmadas** por los clientes.

### Características

- Una orden se genera cuando el cliente **confirma su carrito** y procede al pago.
- Cada orden contiene:
  - **Lista de productos** comprados con sus cantidades.
  - **Precio total** de la orden.
  - **Estado de la orden** (ej: `pendiente`, `pagada`, `en preparación`, `en camino`, `entregada`).
  - **Datos del cliente** (nombre, dirección de entrega).
  - **Datos de la tienda** de origen.
  - **Fecha y hora** de creación.
- El cliente puede **consultar el historial** de todas sus órdenes.
- El admin de la tienda puede **ver y gestionar** las órdenes de sus productos.
- El repartidor puede **tomar órdenes pagadas** para realizar la entrega.

---

## 💳 Pagos

El módulo de pagos gestiona las **transacciones monetarias** dentro de la plataforma.

### Características

- El pago se realiza al momento de **confirmar una orden**.
- Solo los **usuarios autenticados con rol de cliente** pueden realizar pagos.
- Cada registro de pago incluye:
  - **Monto total** pagado.
  - **Método de pago** utilizado.
  - **Estado del pago** (ej: `procesando`, `aprobado`, `rechazado`, `reembolsado`).
  - **Referencia** o ID de la transacción.
  - **Fecha y hora** del pago.
- Una vez aprobado el pago, la orden cambia su estado a `pagada` y queda disponible para que un repartidor la tome.

---

## 🤖 Chatbot Asistente

La plataforma contará con **1 chatbot asistente** integrado, disponible para los usuarios clientes.

### Funcionalidades del Chatbot

- **Consulta de productos:** El cliente puede preguntar por productos específicos de cualquier tienda registrada en la plataforma.
- **Información de la empresa:** El chatbot puede proporcionar información general sobre Shopy Market (políticas, contacto, preguntas frecuentes, etc.).
- **Información de servicios:** El chatbot puede brindar detalles sobre los servicios ofrecidos por las distintas tiendas.
- **Ayuda y soporte:** El cliente puede solicitar asistencia con problemas relacionados a pedidos, pagos, o navegación en la plataforma.

---

## 💎 Suscripciones y Modelo de Financiación

Shopy Market se financia a través de un **sistema de suscripciones** que ofrece beneficios tanto a compradores (clientes) como a vendedores (admins). Existen **4 planes de suscripción** organizados en dos categorías:

### Planes para Clientes (Compradores)

Estos planes están dirigidos a usuarios con rol de **cliente** que desean obtener ventajas al comprar productos y contratar servicios en la plataforma.

#### 1. 🥉 Suscripción Básica

| Característica           | Detalle                                                              |
| ------------------------ | -------------------------------------------------------------------- |
| **Dirigido a**           | Usuarios clientes                                                    |
| **Descuento en compras** | **5%** de descuento en todos los productos y servicios               |
| **Tarifa de envío**      | Costo de envío **reducido** respecto a usuarios sin suscripción      |
| **Puntos canjeables**    | ❌ No incluido                                                        |
| **Envío gratuito**       | ❌ No incluido                                                        |

> 💡 **Ideal para:** Clientes que compran de forma ocasional y quieren un pequeño ahorro en cada compra.

#### 2. 🥇 Suscripción Premium

| Característica           | Detalle                                                              |
| ------------------------ | -------------------------------------------------------------------- |
| **Dirigido a**           | Usuarios clientes                                                    |
| **Descuento en compras** | **7%** de descuento en todos los productos y servicios              |
| **Tarifa de envío**      | **Sin costo de envío** en todos los productos                        |
| **Puntos canjeables**    | ✅ Acumula puntos por cada compra, canjeables por productos gratuitos |
| **Envío gratuito**       | ✅ Incluido en todos los pedidos                                      |

> 💡 **Ideal para:** Clientes frecuentes que buscan maximizar sus ahorros y obtener productos gratis mediante puntos.

**Sistema de Puntos (Premium):**
- Por cada compra realizada, el cliente acumula **puntos** proporcionales al monto gastado.
- Los puntos pueden ser **canjeados** por productos disponibles en la plataforma de forma **gratuita**.
- Los puntos tienen una **fecha de expiración** (por definir) para incentivar su uso.

---

### Planes para Vendedores (Admins)

Estos planes están dirigidos a usuarios con rol de **admin** que desean potenciar la visibilidad y ventas de sus tiendas y servicios.

#### 3. 🏷️ Suscripción Vendedor Básica

| Característica               | Detalle                                                                    |
| ----------------------------- | -------------------------------------------------------------------------- |
| **Dirigido a**                | Usuarios admin (vendedores)                                                |
| **Productos destacados**      | ✅ Sus productos aparecen en la sección de **"Destacados"** y **"Novedades"** del home |
| **Mayor visibilidad**         | ✅ Mayor alcance y exposición frente a clientes de toda la plataforma      |
| **Reducción de comisión**     | ❌ No incluido (se aplica la comisión estándar de la plataforma)           |

> 💡 **Ideal para:** Vendedores nuevos que quieren ganar visibilidad rápidamente y posicionar sus productos frente a más clientes.

#### 4. 👑 Suscripción Vendedor Premium

| Característica               | Detalle                                                                    |
| ----------------------------- | -------------------------------------------------------------------------- |
| **Dirigido a**                | Usuarios admin (vendedores)                                                |
| **Productos destacados**      | ✅ Sus productos aparecen en la sección de **"Destacados"** y **"Novedades"** del home |
| **Mayor visibilidad**         | ✅ Mayor alcance y exposición frente a clientes de toda la plataforma      |
| **Reducción de comisión**     | ✅ **Tarifa de comisión reducida** por cada producto vendido               |
| **Prioridad en búsquedas**    | ✅ Sus productos aparecen con **mayor prioridad** en los resultados de búsqueda |

> 💡 **Ideal para:** Vendedores establecidos con alto volumen de ventas que buscan maximizar sus ganancias reduciendo comisiones y manteniendo alta visibilidad.

---

### 📊 Tabla Comparativa de Planes

| Beneficio                      | Sin Plan | Básica | Premium | Vendedor Básica | Vendedor Premium |
| ------------------------------ | :------: | :----: | :-----: | :-------------: | :--------------: |
| Comprar productos              |    ✅    |   ✅   |   ✅    |       —         |        —         |
| Descuento en compras           |    ❌    |   5%   |   7%   |       —         |        —         |
| Tarifa de envío reducida       |    ❌    |   ✅   |   ✅    |       —         |        —         |
| Envío gratuito                 |    ❌    |   ❌   |   ✅    |       —         |        —         |
| Acumulación de puntos          |    ❌    |   ❌   |   ✅    |       —         |        —         |
| Productos en Destacados        |    —     |   —    |    —    |       ✅        |        ✅        |
| Mayor visibilidad y alcance    |    —     |   —    |    —    |       ✅        |        ✅        |
| Comisión reducida por venta    |    —     |   —    |    —    |       ❌        |        ✅        |
| Prioridad en búsquedas         |    —     |   —    |    —    |       ❌        |        ✅        |

> **Nota:** Los precios de cada plan serán definidos conforme avance el desarrollo del proyecto.

---

### 💰 Modelo de Ingresos de Shopy Market

La plataforma genera ingresos a través de las siguientes fuentes:

1. **Comisión por venta:** Shopy Market cobra una **comisión porcentual** sobre cada producto vendido a través de la plataforma. Los vendedores con suscripción **Vendedor Premium** obtienen una tarifa de comisión más baja.
2. **Suscripciones de clientes:** Cobro mensual/anual por los planes **Básica** y **Premium** de los compradores.
3. **Suscripciones de vendedores:** Cobro mensual/anual por los planes **Vendedor Básica** y **Vendedor Premium** de los admins.
4. **Tarifa de envío:** Shopy Market retiene un margen sobre la tarifa de envío estándar. Los suscriptores Premium están exentos de este costo.

---

## 🚀 Tecnologías (Por definir)

> ⚠️ **Nota:** Las tecnologías y herramientas a utilizar serán definidas conforme avance el desarrollo del proyecto.

---

## 📄 Licencia

> ⚠️ **Nota:** La licencia del proyecto será definida próximamente.

---

*Desarrollado con ❤️ por el equipo de Shopy Market.*