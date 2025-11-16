CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS users (
  id              serial PRIMARY KEY,
  email           text NOT NULL UNIQUE,
  first_name      text,
  last_name       text,
  password        text NOT NULL,
  balance         numeric(18,2) DEFAULT 0 NOT NULL,
  profile_image   text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS services (
  id            serial PRIMARY KEY,
  service_code  text NOT NULL UNIQUE,
  service_name  text,
  service_icon  text,
  service_tariff numeric(18,2) NOT NULL,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS banners (
  id           serial PRIMARY KEY,
  banner_name  text,
  banner_image text,
  description  text,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id               serial PRIMARY KEY,
  invoice_number   text NOT NULL UNIQUE,
  user_id          integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL,
  service_code     text,
  service_name     text,
  amount           numeric(18,2) NOT NULL,
  total_amount     numeric(18,2) NOT NULL,
  description      text,
  created_on       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice ON transactions(invoice_number);

