-- Seed categories: default expense and income categories with subcategories

-- ===== EXPENSE CATEGORIES =====

-- Alimentacion
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_alimentacion', 'Alimentacion', 'expense', '🍽️', NULL);
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_supermercado', 'Supermercado', 'expense', '🛒', 'cat_alimentacion');
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_comida_rapida', 'Comida Rapida', 'expense', '🍔', 'cat_alimentacion');
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_restaurant', 'Restaurant', 'expense', '🍷', 'cat_alimentacion');
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_delivery', 'Delivery', 'expense', '📦', 'cat_alimentacion');

-- Transporte
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_transporte', 'Transporte', 'expense', '🚌', NULL);
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_micro_metro', 'Micro/Metro', 'expense', '🚇', 'cat_transporte');
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_uber_taxi', 'Uber/Taxi', 'expense', '🚕', 'cat_transporte');
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_bencina', 'Bencina', 'expense', '⛽', 'cat_transporte');

-- Vivienda
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_vivienda', 'Vivienda', 'expense', '🏠', NULL);
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_arriendo', 'Arriendo', 'expense', '🔑', 'cat_vivienda');
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_servicios_basicos', 'Servicios Basicos', 'expense', '💡', 'cat_vivienda');
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_internet', 'Internet', 'expense', '🌐', 'cat_vivienda');

-- Entretenimiento
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_entretenimiento', 'Entretenimiento', 'expense', '🎮', NULL);
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_streaming', 'Streaming', 'expense', '📺', 'cat_entretenimiento');
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_juegos', 'Juegos', 'expense', '🕹️', 'cat_entretenimiento');
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_salidas', 'Salidas', 'expense', '🍻', 'cat_entretenimiento');

-- Salud
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_salud', 'Salud', 'expense', '🏥', NULL);
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_farmacia', 'Farmacia', 'expense', '💊', 'cat_salud');
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_consulta_medica', 'Consulta Medica', 'expense', '🩺', 'cat_salud');

-- Categorias simples de expense
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_educacion', 'Educacion', 'expense', '📚', NULL);
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_ropa', 'Ropa', 'expense', '👕', NULL);
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_otros_expense', 'Otros', 'expense', '📋', NULL);

-- ===== INCOME CATEGORIES =====

-- Sueldo
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_sueldo', 'Sueldo', 'income', '💰', NULL);
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_sueldo_base', 'Sueldo Base', 'income', '💵', 'cat_sueldo');
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_bonos', 'Bonos', 'income', '🎁', 'cat_sueldo');
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_horas_extra', 'Horas Extra', 'income', '⏰', 'cat_sueldo');

-- Categorias simples de income
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_freelance', 'Freelance', 'income', '💻', NULL);
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_inversiones', 'Inversiones', 'income', '📈', NULL);
INSERT INTO categories (id, name, type, icon, parent_id) VALUES
    ('cat_otros_income', 'Otros', 'income', '📋', NULL);
