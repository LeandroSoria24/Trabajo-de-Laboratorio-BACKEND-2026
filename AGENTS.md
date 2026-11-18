# Reglas del Repositorio

- **Aislamiento de cambios de CI:** Cuando se solicite configurar o corregir workflows de GitHub Actions (`.github/workflows/*.yml`), mantener la configuración de base de datos efímera, seeds de CI y ajustes de secuencias dentro del propio archivo `.yml`. No crear nuevas migraciones en `prisma/migrations/` ni modificar `.env` o `.env.test` locales salvo pedido explícito.
- **No tocar la tabla `Localidad`:** Preservar siempre los 44 registros de municipios de Catamarca en scripts de limpieza, seed y tests contra Supabase.
