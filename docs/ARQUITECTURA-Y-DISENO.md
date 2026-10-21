# Arquitectura y diseño del primer build

## Alcance y decisión técnica

Propuesta para proyecto nuevo: Astro + TypeScript; HTML estático para estudio y un componente interactivo para las prácticas. Es una decisión de implementación orientada a un sitio pequeño, rápido y fácil de ampliar. Si ya hay un proyecto SSR adecuado en Cursor, conservar su stack.

Los JSON serán el origen del contenido. El motor de preguntas no debe depender del HTML ni de posiciones de respuestas. El catálogo puede crecer por jurisdicción, clase y tema sin duplicar el motor.

Separar explícitamente `licenseClasses`, `jurisdictionId`, `bankId` y, en el futuro, `examProfileId`. Una clase de licencia no define por sí sola el formato de examen ni su jurisdicción.

## Rutas iniciales

Indexación indicada para producción; en preview todas llevan noindex.

| Ruta | Función | Indexar |
|---|---|---|
| `/` | Presentación y elección de jurisdicción | Sí |
| `/test-de-conducir/` | Directorio de bancos; explicar sus alcances y cómo elegir | Sí, con contenido distinto de inicio |
| `/test-de-conducir/caba/` | Estudio y práctica de autos en CABA; ~50 preguntas en HTML | Sí |
| `/test-de-conducir/cordoba-capital/` | Estudio y práctica de autos en la ciudad de Córdoba; ~50 preguntas en HTML | Sí |
| `/fuentes-y-metodologia/` | Procedencia, revisión, alcance y correcciones | Sí |
| `/practicar/caba/` | Sesión interactiva de CABA | No |
| `/practicar/cordoba-capital/` | Sesión interactiva de Córdoba Capital | No |
| `/404` y rutas inexistentes | Error real con estado HTTP 404 | No |

Los resultados se muestran dentro de la sesión local: no crear una URL indexable por intento. Los parámetros de configuración no generan páginas de catálogo diferentes. Elegir una convención de barra final y redirigir la alternativa.

No generar aún páginas provinciales, por municipio, por año, por clase vacía ni por cada pregunta. `/senales-de-transito/` y guías temáticas quedan para una ampliación con contenido propio suficiente; no crear navegación a páginas vacías. La navegación inicial puede usar “Tests”, “Cómo practicar” (ancla) y “Fuentes”.

## Dirección visual

La referencia HTML conserva el concepto anterior. Su alcance era más amplio: las opciones no disponibles deben desaparecer del primer build. No copiar sus etiquetas nacionales ni su botón de simulacro oficial.

| Elemento | Decisión |
|---|---|
| Fondo | `#F5F7FB` |
| Tarjetas | Blanco, borde `#DCE3EF`, radio 12–16 px |
| Texto principal | `#14233E` |
| Texto secundario | `#53647D` |
| Acción principal | `#234FE4`, texto blanco |
| Contenedor | Máximo aproximado 1120 px; lectura de explicaciones más estrecha |
| Tipografía | Sistema al principio; mínimo 16 px para contenido y controles |
| Interacción | Foco visible, estados seleccionados y feedback con texto |

Inicio sugerido: “Prepará tu examen teórico de conducir”. Bajada: “Practicá para autos con preguntas explicadas. Elegí CABA o Córdoba Capital y empezá a repasar.” Aclarar cerca del selector que es una ampliación intermedia, con el conteo calculado del banco.

Dos tarjetas de jurisdicción permiten elegir de inmediato. Autos es el alcance activo; no pedir al usuario elegir entre categorías vacías. CTA: “Empezar a practicar”. Acceso secundario: “Estudiar las preguntas”.

El diseño de las señales se mantiene fiel a sus formas y colores; la identidad de marca no debe recolorearlas. La intermitencia se describe con texto, sin parpadeos. Nunca usar una imagen generada al azar para representar una regla vial precisa.

## Orden de implementación

1. Validar e importar datos; definir tipos y resolución de fuentes/imágenes.
2. Construir layout, home, directorio y páginas de jurisdicción con contenido HTML.
3. Implementar selección, respuesta, corrección y repaso.
4. Integrar metadata, sitemap, robots y JSON-LD desde los componentes centrales.
5. Verificar navegación, accesibilidad, un intento completo por banco y build de producción.

No hacen falta cuentas, pagos ni backend para este primer recorrido. Guardar historial solo en el dispositivo con una opción de borrado. Preparar futuras integraciones como módulos optativos, no como dependencias del aprendizaje.
