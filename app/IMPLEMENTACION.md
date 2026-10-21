# Resumen de implementación (primer build)

Fecha de build local: 2026-10-21. Ampliación intermedia de bancos: 2026-10-21.

## Qué se construyó

Aplicación Astro 7 + TypeScript en `app/`, con HTML estático para estudio y una isla React (`QuizApp`) solo en `/practicar/{jurisdiccion}/`.

- Bancos: CABA y Córdoba Capital (50 + 50), cargados desde `../data/`.
- Modalidades: Aprender (10/20/50, feedback inmediato) y Práctica (20/50, feedback al final).
- Examen oficial: deshabilitado según `site-config.json` (`fullSyllabus: false`).
- SEO: `lang=es-AR`, metadata centralizada, JSON-LD WebSite/WebPage/BreadcrumbList, prácticas con `noindex`, sitemap vacío mientras `INDEXABLE_PRODUCTION=false`.

## Comandos

```bash
cd app
npm install
npm run validate:data
npm test
npm run dev
npm run build
npm run preview
npm run check:production
```

## Resultados de verificación

| Chequeo | Resultado |
|---|---|
| `python3 ../scripts/validate_data.py` | PASS (100 preguntas, 7 assets) |
| `npm test` (Vitest) | PASS |
| `npm run build` | OK → `dist/` |
| HTML estudio CABA / Córdoba | ~50 anclas de pregunta c/u, respuestas, explicaciones y fuentes sin JS |
| `/practicar/*` | `noindex,follow`; ausente del sitemap |
| Canonicales / sitemap indexable | Omitidos (preview: sin `SITE_URL` indexable) |
| Ruta inexistente en preview | HTTP 404 |

Auditoría Lighthouse: no se usa como certificación de Core Web Vitals reales.

## Inputs de lanzamiento aún pendientes

1. Marca / nombre comercial definitivo  
2. Dominio HTTPS (`SITE_URL`) e `INDEXABLE_PRODUCTION=true`  
3. Revisión editorial humana del banco  
4. Canal real de contacto / reporte de errores  
5. Analítica (opcional; hooks no instalados)  
6. Perfiles oficiales de examen (cantidad, tiempo, umbral) si se habilita ese modo  

El sitio corre en local con los datos del paquete sin esos inputs.
