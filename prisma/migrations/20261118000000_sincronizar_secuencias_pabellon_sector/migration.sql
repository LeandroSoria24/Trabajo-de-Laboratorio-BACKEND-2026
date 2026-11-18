-- Sincroniza las secuencias SERIAL de Pabellon y Sector tras inserts manuales con id=1 en migraciones previas
SELECT setval(
  pg_get_serial_sequence('"Pabellon"', 'id'),
  COALESCE((SELECT MAX("id") FROM "Pabellon"), 1),
  true
);

SELECT setval(
  pg_get_serial_sequence('"Sector"', 'id'),
  COALESCE((SELECT MAX("id") FROM "Sector"), 1),
  true
);
