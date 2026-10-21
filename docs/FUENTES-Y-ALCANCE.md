# Fuentes, procedencia y ampliación

Consulta de fuentes: 20/10/2026 (ampliación intermedia: 21/10/2026). Fecha del paquete: 21/10/2026.

## Banco actual (ampliación intermedia)

| Banco | Preguntas | Fuente principal | Alcance |
|---|---:|---|---|
| CABA — autos | 50 | Código de Tránsito y Transporte, Ley 2148 + Manual de Conducción Vehicular Teórica (GCABA) | Ampliación intermedia B1; no es temario oficial completo |
| Córdoba Capital — autos | 50 | Ordenanza municipal 9981 y guía municipal para señales | Ciudad de Córdoba; ampliación intermedia B1 |

Los enlaces completos están en `data/sources.json`. Cada pregunta indica el artículo o la página que la respalda. “Página física” cuenta la portada del PDF como página 1; no es necesariamente la numeración impresa.

Las preguntas, distractores y explicaciones de este paquete son redacciones nuevas. Se contrastó la respuesta correcta con la fuente indicada. El texto actualizado de una norma y la fecha de consulta no constituyen una promesa de que no habrá cambios posteriores.

La cobertura temática se orienta con `docs/TEMARIO-CABA.md`, `docs/TEMARIO-CORDOBA.md` y `data/syllabus-map.json`. Sigue habiendo huecos parciales; no se ha completado el programa de examen.

El banco de Córdoba se apoya en la ordenanza municipal. El preguntero oficial se consultó como referencia de formato y contraste; no se copió de forma integral. No se heredaron automáticamente respuestas de materiales antiguos.

## Imágenes

Se crearon siete SVG nuevos mediante geometría vectorial: semáforo rojo, amarillo intermitente, rojo intermitente, doble línea continua, PARE, CEDA EL PASO y máxima 40. Se emplean donde aportan información, no como decoración de todas las preguntas.

Las señales PARE y CEDA se contrastaron visualmente con la página física 13 de la guía municipal; el modelo de velocidad máxima, con la página física 14. El número 40 es un ejemplo del valor mostrado por la señal, no una atribución del límite general de avenidas de Córdoba.

Son dibujos educativos simplificados, no archivos técnicos de señalización vial. No incluyen logotipos oficiales ni imágenes extraídas de PDFs. El texto alternativo describe la forma visible. En las luces intermitentes, una etiqueta textual evita depender de animaciones.

## Repositorio investigado

Referencia: https://github.com/bandinopla/simulador-test-de-conducir

El repositorio reúne materiales de varias procedencias. Para este build no se reutiliza su código, su banco ni sus imágenes. La licencia de un proyecto de software no demuestra por sí sola la procedencia o los permisos de todos los contenidos externos que reúne. Si se desea importarlo más adelante, habrá que revisar por fuente el territorio, la vigencia, las respuestas y la autorización de uso; conservar atribuciones cuando correspondan.

La decisión actual permite avanzar con un banco nuevo y trazable sin depender de esa importación. No se adjuntan copias completas de los manuales oficiales: se enlazan sus fuentes.

## Estados editoriales

`source-checked-draft`: la preparación contrastó la respuesta con la fuente citada. No equivale a una validación humana especializada.

`humanReviewedAt` y `humanReviewer` son null. Solo completarlos cuando una persona real haya revisado el contenido y autorizado la identificación correspondiente. Mantener un historial por pregunta: versión, qué cambió, fuente y fecha.

Separar fecha de redacción, fecha de consulta de fuente, fecha de revisión humana y fecha de publicación. No convertir automáticamente unas en otras. Las futuras preguntas con una fuente contradictoria o inaccesible deben quedar fuera de producción hasta resolver el punto concreto.

## Próxima ampliación de contenido

Meta intermedia actual: ~50 preguntas por jurisdicción (`fullSyllabus: false`). Objetivo posterior propuesto: acercarse a ~100 por ciudad con cobertura temática más equilibrada. No se promete que esa cantidad represente el banco oficial.

1. Mantener el mapa del temario de autos por ciudad usando material oficial vigente.
2. Identificar vacíos restantes en `syllabus-map.json` y redactar preguntas nuevas que los cubran.
3. Verificar por separado cantidad, tiempo y criterio de aprobación del examen real, si se busca reproducir su formato.
4. Revisar con una persona responsable, corregir y publicar el banco versionado.
5. Incorporar clases A, C, D y E y nuevas jurisdicciones cuando haya fuentes y contenido suficientes; evitar trasladar automáticamente un banco de autos a vehículos profesionales.

El crecimiento se mide en preguntas útiles y cobertura real. Reordenar las mismas preguntas no amplía el conocimiento cubierto.
