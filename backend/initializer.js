const bcrypt = require('bcryptjs');
const pool = require('./src/db/database');
require('dotenv').config();

const hashPassword = (password) => {
  return bcrypt.hash(password, 10);
};

const SQL = `
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone VARCHAR(30),
    profile_image_url TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50),
    price NUMERIC(10,2) DEFAULT 0,
    discount NUMERIC(10,2) DEFAULT 0,
    free_shipping BOOLEAN DEFAULT FALSE,
    points_enabled BOOLEAN DEFAULT FALSE,
    featured_products BOOLEAN DEFAULT FALSE,
    reduced_commission BOOLEAN DEFAULT FALSE,
    search_priority BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

CREATE TABLE IF NOT EXISTS stores (
    id BIGSERIAL PRIMARY KEY,
    admin_user_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    background_color VARCHAR(20),
    logo_url TEXT,
    banner_url TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS service_profiles (
    id BIGSERIAL PRIMARY KEY,
    admin_user_id BIGINT NOT NULL,
    store_id BIGINT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    background_color VARCHAR(20),
    profile_image_url TEXT,
    banner_url TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES users(id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS subcategories (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    store_id BIGINT,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    subcategory_id BIGINT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    average_rating NUMERIC(3,2) DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
);

CREATE TABLE IF NOT EXISTS services (
    id BIGSERIAL PRIMARY KEY,
    service_profile_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    estimated_time VARCHAR(100),
    image_url TEXT,
    average_rating NUMERIC(3,2) DEFAULT 0,
    contracts_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_profile_id) REFERENCES service_profiles(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS carts (
    id BIGSERIAL PRIMARY KEY,
    customer_user_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    customer_user_id BIGINT NOT NULL,
    store_id BIGINT,
    delivery_user_id BIGINT,
    order_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    subtotal NUMERIC(10,2) NOT NULL,
    discount NUMERIC(10,2) DEFAULT 0,
    shipping_cost NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    delivery_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_user_id) REFERENCES users(id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (delivery_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_details (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT,
    service_id BIGINT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    CHECK (
        product_id IS NOT NULL OR service_id IS NOT NULL
    )
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    amount NUMERIC(10,2) NOT NULL,
    transaction_reference VARCHAR(150),
    paid_at TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS deliveries (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    delivery_user_id BIGINT,
    delivery_status VARCHAR(50) DEFAULT 'pending',
    origin_address TEXT,
    destination_address TEXT,
    current_location TEXT,
    assigned_at TIMESTAMP,
    delivered_at TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT,
    service_id BIGINT,
    store_id BIGINT,
    service_profile_id BIGINT,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (service_profile_id) REFERENCES service_profiles(id)
);

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_rating_check;
ALTER TABLE reviews ADD CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 0 AND 5);

ALTER TABLE stores ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS rating_percentage NUMERIC(5,2) DEFAULT 0;

ALTER TABLE service_profiles ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE service_profiles ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
ALTER TABLE service_profiles ADD COLUMN IF NOT EXISTS rating_percentage NUMERIC(5,2) DEFAULT 0;

ALTER TABLE products ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dislike_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS vote_score INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS product_votes (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    vote SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (product_id, user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_store_review_per_user
ON reviews (user_id, store_id)
WHERE store_id IS NOT NULL AND product_id IS NULL AND service_id IS NULL AND service_profile_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_service_profile_review_per_user
ON reviews (user_id, service_profile_id)
WHERE service_profile_id IS NOT NULL AND product_id IS NULL AND service_id IS NULL AND store_id IS NULL;

CREATE TABLE IF NOT EXISTS user_points (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_id BIGINT,
    points INTEGER NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    expiration_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS chatbot_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES chatbot_conversations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pages (
    id BIGSERIAL PRIMARY KEY,
    created_by_user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);
`;

const init = async () => {
  try {
    await pool.query('BEGIN');
    await pool.query(SQL);
    await pool.query(
      `INSERT INTO roles (name, description)
       VALUES
         ('super_admin', 'Usuario con permisos totales del sistema'),
         ('admin', 'Administrador de tienda o servicio'),
         ('cliente', 'Cliente comprador de la plataforma'),
         ('repartidor', 'Usuario encargado de la entrega')
       ON CONFLICT (name) DO NOTHING;
      `
    );


    await pool.query(
      `INSERT INTO subscription_plans (name, type, price, discount, free_shipping, points_enabled, featured_products, reduced_commission, search_priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (name) DO NOTHING;
      `,
      ['Sin Plan', 'free', 0, 0, false, false, false, false, false, 'active']
    );

    const email = process.env.SUPERADMIN_EMAIL || 'root@root.com';
    const password = process.env.SUPERADMIN_PASSWORD || 'Root123!';
    const firstName = process.env.SUPERADMIN_FIRST_NAME || 'Super';
    const lastName = process.env.SUPERADMIN_LAST_NAME || 'Admin';
    const phone = process.env.SUPERADMIN_PHONE || '+0000000000';
    const passwordHash = await hashPassword(password);

    const userResult = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       ON CONFLICT (email) DO UPDATE SET
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         password_hash = EXCLUDED.password_hash,
         phone = EXCLUDED.phone,
         status = EXCLUDED.status
       RETURNING id;
      `,
      [firstName, lastName, email, passwordHash, phone]
    );

    const userId = userResult.rows[0].id;
    const roleResult = await pool.query(`SELECT id FROM roles WHERE name = $1`, ['super_admin']);
    const roleId = roleResult.rows[0].id;

    await pool.query(
      `INSERT INTO user_roles (user_id, role_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING;
      `,
      [userId, roleId]
    );

    await pool.query('COMMIT');

    console.log(' Inicialización completada.');

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(' Error durante la inicialización:', error);
  } finally {
    await pool.end();
  }
};

init();
