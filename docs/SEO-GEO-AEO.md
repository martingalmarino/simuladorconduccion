# SEO, GEO y AEO desde el primer build

Especificación preparada el 20/10/2026. Define una base técnica y editorial verificable. No garantiza posiciones, indexación, tráfico ni menciones en respuestas de IA.

## 1. Arquitectura e indexación

Una URL principal por intención y jurisdicción. Inicio presenta el producto; el directorio ayuda a elegir; cada página local enseña y permite practicar. Evitar títulos y contenidos idénticos entre inicio y directorio.

Las páginas educativas necesitan HTML útil desde la respuesta inicial: introducción, preguntas, respuestas, explicaciones y fuentes. El componente interactivo no debe ser la única forma de acceder al conocimiento.

Usar la matriz de rutas del documento de arquitectura. Las prácticas y resultados llevan `noindex,follow` y no se incluyen en sitemap. No bloquearlos en robots.txt si se pretende que los buscadores lean el noindex. No convertir selecciones, orden aleatorio, puntuaciones o filtros en miles de URLs.

Producción: canonical absoluto y coherente para cada página pública; HTTPS; redirecciones de variantes; sitemap XML solo con URLs canónicas indexables y estados 200. Los cambios de URL necesitan redirecciones permanentes. `lastmod` refleja cambios reales del contenido, no la hora del build.

Preview: `INDEXABLE_PRODUCTION=false`, noindex global, sin URLs ficticias de producción ni sitemap destinado a buscadores. Noindex no protege información privada; este proyecto no debe almacenar datos personales en páginas públicas.

Fuentes técnicas: [Canonicalización](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [robots meta](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag), [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## 2. Metadata y contenido

Todos los títulos, descripciones y H1 deben describir el alcance real. Plantillas iniciales:

| Página | Título propuesto | H1 propuesto |
|---|---|---|
| Inicio | Test de conducir: practicá para CABA y Córdoba Capital | Prepará tu examen teórico de conducir |
| Directorio | Tests de conducir por jurisdicción: elegí dónde practicar | Elegí dónde vas a rendir |
| CABA | Test de conducir CABA: preguntas explicadas para autos | Practicá el test de conducir de autos en CABA |
| Córdoba Capital | Test de conducir Córdoba Capital: práctica para autos | Practicá el test de conducir en Córdoba Capital |

La bajada debe decir que hay una muestra introductoria de 20 preguntas por ciudad. No usar “todos los tests”, “banco oficial”, “preguntas exactas del examen” o “actualizado 2026” como reclamo automático.

Cada página: una jerarquía clara, encabezados descriptivos, enlaces internos útiles, textos alternativos y descripción social propia. Los conteos vienen del banco. Las respuestas usan lenguaje preciso, sin repeticiones artificiales de palabras clave. Crear nuevas páginas solo cuando resuelvan una necesidad distinta con contenido suficiente.

## 3. Respuestas útiles para personas y sistemas de IA

GEO/AEO se implementa como claridad, trazabilidad y accesibilidad del contenido. Para cada cuestión: respuesta breve al principio, explicación, jurisdicción, condiciones o excepciones relevantes, fuente concreta y fecha de consulta. Los fragmentos `#caba-b1-001`, por ejemplo, permiten enlazar una pregunta directamente dentro de su página de estudio.

Mantener consistencia en nombres de ciudad, clase y tema. Córdoba Capital significa la ciudad; no extrapolar sus reglas a toda Córdoba. No presentar una regla local como respuesta universal argentina.

Publicar metodología real y un mecanismo operativo de corrección cuando exista un contacto configurado. No inventar expertos, revisiones humanas ni sellos. Al ampliar, sumar ejemplos originales y explicaciones que ayuden a entender el error, no páginas masivas que solo cambien el nombre de la localidad.

Google indica que sus funciones de IA no exigen un marcado o archivo especial adicional. La base sigue siendo contenido accesible, indexable y útil. `llms.txt` no es un requisito del MVP ni una garantía de cita. Mantener una política explícita de acceso a rastreadores en hosting/CDN; no confundir una decisión sobre entrenamiento de modelos con la indexación en buscadores.

Fuentes: [Funciones de IA y tu sitio](https://developers.google.com/search/docs/appearance/ai-features), [Guía de optimización para IA](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

## 4. Datos estructurados

Implementar JSON-LD generado a partir del mismo contenido visible:

- `WebSite`: nombre real y URL real cuando estén definidos.
- `WebPage`: título, idioma y URL de cada página.
- `BreadcrumbList`: solo los pasos de navegación que se muestran.
- `Article`: reservado para guías editoriales reales, si se agregan más adelante.
- `Quiz` / `Question`: opcionales para contenido educativo visible y correctamente descrito; no son una promesa de resultado enriquecido en Google.

No usar `QAPage` para un banco escrito por el editor. No añadir estrellas, reseñas, autorías, organizaciones o un buscador interno que no existen. Los campos de fecha deben corresponder a lo que realmente ocurrió.

El historial de Google consultado indica que los resultados enriquecidos de FAQ dejaron de mostrarse en mayo de 2026. Se pueden escribir preguntas frecuentes útiles, pero no prometer esa presentación en buscadores ni tratar `FAQPage` como una ventaja automática.

Fuentes: [Políticas de datos estructurados](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), [Quiz](https://schema.org/Quiz), [Question](https://schema.org/Question), [Historial de cambios de Google](https://developers.google.com/search/updates).

## 5. Rendimiento y accesibilidad

Objetivos de Core Web Vitals en el percentil 75 de visitas reales: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1. Son objetivos para medir después del lanzamiento; un resultado Lighthouse no los certifica.

Decisiones iniciales: poco JavaScript, imágenes SVG locales con dimensiones reservadas, fuentes limitadas, sin trackers ni anuncios por defecto, componentes interactivos aislados y ningún bloqueo innecesario del render. Cargar diferidamente imágenes fuera de pantalla; no retrasar la imagen principal si resulta crítica para el contenido visible.

Verificar teclado, foco, contraste, lectura de feedback, controles táctiles y reflujo a 360 px. Los colores de corrección siempre van acompañados de texto. Las imágenes que contienen información deben tener alternativas descriptivas.

Fuente: [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals).

## 6. Medición desde el lanzamiento

Con dominio confirmado: verificar Search Console, enviar sitemap y revisar cobertura, consultas, CTR, páginas de destino y rendimiento. Google agrupa el tráfico de sus funciones de IA dentro de los informes web correspondientes; no prometer un panel que lo separa con precisión si la herramienta no lo ofrece.

Preparar eventos desactivados hasta configurar una herramienta real: `practice_started`, `practice_completed`, `wrong_answers_reviewed`. Solo dimensiones agregadas como jurisdicción, modo y cantidad; sin texto de respuestas, nombres, emails ni identificadores personales. No instalar seguimiento por adelantado.

Las visitas referidas por asistentes pueden medirse cuando el referente está disponible, pero no equivalen a todas las citas. Para observar AEO se puede llevar un registro manual de consultas, fecha, respuesta y enlace citado, reconociendo la variabilidad. No crear métricas ficticias.

## 7. Criterios para aprobar el build

- El HTML recibido sin ejecutar JavaScript contiene las 20 preguntas de cada página local, sus respuestas y fuentes.
- Todas las preguntas tienen ancla estable; las fuentes son enlaces utilizables.
- Titles y descripciones son distintos; el canonical usa el dominio real en producción.
- Staging y prácticas llevan noindex; el sitemap excluye prácticas y errores.
- Un crawler no recibe contenido diferente del usuario; robots/CDN no bloquean accidentalmente páginas públicas.
- JSON-LD es válido y coincide con lo visible; no hay datos inventados.
- Redirecciones y 404 devuelven estados correctos.
- Un intento completo funciona en móvil y escritorio, con teclado y sin imágenes rotas.
- Se documentan resultados del build, pruebas del motor y auditoría de laboratorio sin confundirlos con rendimiento real.

Para lanzar públicamente faltan marca/dominio definitivos, revisión editorial humana del banco y la ejecución de estas comprobaciones sobre la aplicación construida. Estos pasos no impiden el desarrollo local.
