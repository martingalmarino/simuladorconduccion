# Primer build — Test de conducir

Preparado el 20 de octubre de 2026 para desarrollar en Cursor.

## Empezá por acá

1. Descomprimí este paquete en una carpeta y abrila en Cursor.
2. Copiá el contenido de `CURSOR_PROMPT.txt` en el chat de Cursor. Pedile que lea los archivos del paquete antes de implementar.
3. Cursor construirá la aplicación en `app/`, conservando este material como referencia. El primer resultado debe poder ejecutarse localmente.
4. Revisá el recorrido completo de CABA y Córdoba Capital: elegir, responder, ver resultados y repasar errores.
5. Para publicar, definí marca y dominio reales y completá las verificaciones de `docs/SEO-GEO-AEO.md`. La configuración inicial es de desarrollo y no permite indexar una versión incompleta.

## Qué contiene

| Entregable | Contenido |
|---|---|
| `CURSOR_PROMPT.txt` | Instrucciones de implementación en inglés; toda la interfaz será en español argentino |
| `data/caba-b1.json` | 50 preguntas originales de práctica para autos en CABA |
| `data/cordoba-capital-b1.json` | 50 preguntas originales de práctica para autos en Córdoba Capital |
| `data/sources.json` | Fuentes oficiales con URL y fecha de consulta |
| `data/assets.json` y `public/images/questions/` | 7 ilustraciones SVG propias, dimensiones y texto alternativo |
| `data/site-config.json` | Alcance, modalidades y configuración de publicación |
| `data/question-bank.schema.json` | Contrato estructural de los bancos |
| `docs/ARQUITECTURA-Y-DISENO.md` | Rutas, componentes y dirección visual |
| `docs/SEO-GEO-AEO.md` | Indexación, contenido, datos estructurados y medición |
| `docs/FUENTES-Y-ALCANCE.md` | Procedencia, límites de cobertura y ampliación |
| `scripts/validate_data.py` | Verificación de integridad, sin dependencias externas |
| `reference/concepto-visual-aprobado.html` | Referencia visual anterior; no es la aplicación terminada |

Cada pregunta incluye tres alternativas, una respuesta correcta identificada por ID, explicación, jurisdicción y referencia al artículo o página de origen. Hay 40 preguntas en total, no 40 exámenes diferentes. Las prácticas de 10 o 20 se forman con esos bancos. Las preguntas compartidas en concepto entre jurisdicciones no se presentan como contenido normativo nacional.

Las 7 imágenes se reutilizan donde corresponde; no todas las preguntas necesitan una ilustración. Ninguna pregunta, respuesta o imagen se importó del repositorio de terceros. Se redactaron situaciones propias basadas en normas y se dibujaron SVG nuevos.

## Estado del material

Este paquete es la base de contenido y especificación del primer build, no una web ya implementada ni una certificación de cobertura del examen. Los datos fueron contrastados con las fuentes indicadas; no tienen aún revisión humana especializada. Ese estado está declarado en los JSON.

El simulacro con cantidad, tiempo y nota de aprobación oficiales queda deshabilitado hasta verificar esos requisitos por jurisdicción. La práctica inicial muestra aciertos y temas a repasar, sin afirmar que el usuario aprobó un examen oficial.

No se publican todavía motos, camiones, pasajeros ni articulados. La arquitectura permite incorporarlos cuando exista un banco revisado. Córdoba Capital no representa a todos los municipios de la provincia.

## Validar los archivos

Desde esta carpeta:

```bash
python3 scripts/validate_data.py
```

La validación comprueba integridad del material; no sustituye una revisión normativa. La aplicación que genere Cursor necesitará sus propias comprobaciones de funcionamiento y SEO.
