# Test de conducir — aplicación

Sitio de práctica del examen teórico de conducir (autos, muestra B1 introductoria) para **CABA** y **Córdoba Capital**. Construido con Astro + TypeScript e isla React solo en las sesiones de práctica.

Los JSON del paquete padre (`../data/`) son la única fuente de verdad del contenido.

## Requisitos

- Node.js ≥ 22.22
- Python 3 (solo para `validate:data`)

## Comandos

```bash
cd app
npm install
npm run validate:data   # integridad del paquete de datos
npm test                # motor de preguntas y sesiones
npm run dev             # http://localhost:4321
npm run build           # salida en dist/
npm run preview         # sirve el build de producción
npm run check:production
```

## Variables de entorno

Copiá `.env.example`. Por defecto:

- `INDEXABLE_PRODUCTION=false` → todas las páginas públicas llevan `noindex`
- `SITE_URL` vacío → sin canonicales ni sitemap destinado a buscadores

Para un lanzamiento indexable (cuando existan dominio y revisión):

```bash
INDEXABLE_PRODUCTION=true SITE_URL=https://tu-dominio.com npm run build
```

## Rutas

| Ruta | Indexable (solo si producción lo permite) |
|---|---|
| `/` | Sí |
| `/test-de-conducir/` | Sí |
| `/test-de-conducir/caba/` | Sí |
| `/test-de-conducir/cordoba-capital/` | Sí |
| `/fuentes-y-metodologia/` | Sí |
| `/practicar/caba/` | No |
| `/practicar/cordoba-capital/` | No |

## Notas

- No hay autenticación, base de datos, pagos ni analítica instalada.
- El historial de prácticas vive en `localStorage` del navegador.
- El modo de examen oficial permanece deshabilitado en `site-config.json`.
