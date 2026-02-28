-- Migrate category icons from emoji to Lucide icon names

-- Expense parent categories
UPDATE categories SET icon = 'utensils' WHERE id = 'cat_alimentacion';
UPDATE categories SET icon = 'bus' WHERE id = 'cat_transporte';
UPDATE categories SET icon = 'home' WHERE id = 'cat_vivienda';
UPDATE categories SET icon = 'gamepad-2' WHERE id = 'cat_entretenimiento';
UPDATE categories SET icon = 'hospital' WHERE id = 'cat_salud';
UPDATE categories SET icon = 'book-open' WHERE id = 'cat_educacion';
UPDATE categories SET icon = 'shirt' WHERE id = 'cat_ropa';
UPDATE categories SET icon = 'clipboard-list' WHERE id = 'cat_otros_expense';

-- Expense subcategories
UPDATE categories SET icon = 'shopping-cart' WHERE id = 'cat_supermercado';
UPDATE categories SET icon = 'sandwich' WHERE id = 'cat_comida_rapida';
UPDATE categories SET icon = 'wine' WHERE id = 'cat_restaurant';
UPDATE categories SET icon = 'package' WHERE id = 'cat_delivery';
UPDATE categories SET icon = 'train-front' WHERE id = 'cat_micro_metro';
UPDATE categories SET icon = 'car-taxi-front' WHERE id = 'cat_uber_taxi';
UPDATE categories SET icon = 'fuel' WHERE id = 'cat_bencina';
UPDATE categories SET icon = 'key-round' WHERE id = 'cat_arriendo';
UPDATE categories SET icon = 'lightbulb' WHERE id = 'cat_servicios_basicos';
UPDATE categories SET icon = 'globe' WHERE id = 'cat_internet';
UPDATE categories SET icon = 'tv' WHERE id = 'cat_streaming';
UPDATE categories SET icon = 'joystick' WHERE id = 'cat_juegos';
UPDATE categories SET icon = 'beer' WHERE id = 'cat_salidas';
UPDATE categories SET icon = 'pill' WHERE id = 'cat_farmacia';
UPDATE categories SET icon = 'stethoscope' WHERE id = 'cat_consulta_medica';

-- Income parent categories
UPDATE categories SET icon = 'wallet' WHERE id = 'cat_sueldo';
UPDATE categories SET icon = 'laptop' WHERE id = 'cat_freelance';
UPDATE categories SET icon = 'trending-up' WHERE id = 'cat_inversiones';
UPDATE categories SET icon = 'clipboard-list' WHERE id = 'cat_otros_income';

-- Income subcategories
UPDATE categories SET icon = 'banknote' WHERE id = 'cat_sueldo_base';
UPDATE categories SET icon = 'gift' WHERE id = 'cat_bonos';
UPDATE categories SET icon = 'clock' WHERE id = 'cat_horas_extra';
