-- Seed currencies: CLP, USD, EUR, JPY, CNY

INSERT INTO currencies (id, code, name, symbol, decimal_places) VALUES
    ('cur_clp', 'CLP', 'Peso Chileno', '$', 0);

INSERT INTO currencies (id, code, name, symbol, decimal_places) VALUES
    ('cur_usd', 'USD', 'US Dollar', 'US$', 2);

INSERT INTO currencies (id, code, name, symbol, decimal_places) VALUES
    ('cur_eur', 'EUR', 'Euro', '€', 2);

INSERT INTO currencies (id, code, name, symbol, decimal_places) VALUES
    ('cur_jpy', 'JPY', 'Yen Japones', '¥', 0);

INSERT INTO currencies (id, code, name, symbol, decimal_places) VALUES
    ('cur_cny', 'CNY', 'Yuan Chino', '¥', 2);
