# Rediseño del sitio web de la Ilustre Municipalidad de Combarbalá

Proyecto final del curso **Diseño desde el código** (PUCV, 2026). Rediseño del sitio [municombarbala.cl](https://www.municombarbala.cl/) con foco en la navegación, la claridad de los contenidos, la accesibilidad y el rendimiento.

## Objetivo

Que vecinas, vecinos y visitantes encuentren rápido lo que buscan: hacer un trámite, contactar a un departamento, informarse de la comuna o revisar la información pública del municipio, desde el celular o el computador.

## Arquitectura de contenidos

```
Inicio (index.html)
├── Comuna (comuna.html)
│   └── Cultura y turismo (cultura-turismo.html)
├── Autoridades (autoridades.html)
├── Departamentos (departamentos.html) ─ directorio + ficha de cada departamento (#desam, #daem, #dideco, #daf, #dom, #secpla, #deportes, #transito, #jpl)
├── Trámites y servicios (tramites.html) ─ 22 trámites en 7 categorías (#permiso, #licencias, #patentes, #pagos…)
├── Noticias (noticias.html)
│   └── Noticia (noticia.html)
├── Transparencia y participación (transparencia.html)
├── Contacto y agenda telefónica (contacto.html) ─ #horario, #telefonos, #formulario
├── Buscar en el sitio (buscar.html)
├── Política de privacidad (privacidad.html)
└── Página no encontrada (404.html)
```

Las páginas con muchas secciones (trámites, departamentos, contacto) reúnen todo en un solo HTML, ordenado por categorías y con un buscador que filtra el contenido de esa página.

## Estructura de archivos

```
├── *.html            13 páginas
├── css/styles.css    única hoja de estilos para todo el sitio
├── js/main.js        interacciones (menú, carrusel, filtros, búsqueda, fichas, formulario)
├── fonts/            tipografía Inter (woff2)
├── img/              imágenes en WebP (y versiones de 600, 900 y 1000 px para pantallas pequeñas)
├── sitemap.xml
└── robots.txt
```

## Cómo cumple la pauta de evaluación

| Punto | Implementación |
|---|---|
| Validación HTML y CSS | Las páginas pasan el [validador W3C](https://validator.w3.org/nu/) sin errores; el CSS pasa el [validador de CSS](https://jigsaw.w3.org/css-validator/) sin errores. |
| Semántica | `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `figure`, `details`, `dialog`, tablas con `caption` y `th scope`. |
| Accesibilidad | Idioma `es`, enlace «Saltar al contenido», foco visible, `alt` descriptivos, `aria-*` en menús y filtros, contraste AA, controles de 44 px, formularios con `label` y errores junto al campo, respeto de `prefers-reduced-motion`. |
| Responsividad | Diseño mobile-first con media queries; tablas que se apilan en móvil; imágenes con `srcset`/`sizes` y `loading="lazy"`. |
| Core Web Vitals | Imágenes WebP optimizadas, dimensiones `width`/`height` para evitar saltos (CLS), JavaScript diferido, video con `preload="none"`. |
| Metadatos y SEO | `title` y `description` por página, Open Graph, `theme-color`, `robots`, `sitemap.xml` y `robots.txt`. |
| Microdatos (schema.org) | `BreadcrumbList` en las migas de pan, `NewsArticle` en las noticias y `GovernmentOrganization` en el footer. |
| Formularios y privacidad | Búsqueda con `method="get"`; formulario de contacto con validación nativa, consentimiento explícito y desmarcado, finalidades separadas y enlace a la política de privacidad (Ley 21.719). |
| Tipografía web embebida | Inter (fuente variable, licencia SIL OFL) alojada en `fonts/` y cargada con `@font-face` y `font-display: swap`. |
| Una hoja de estilos | `css/styles.css` para todas las páginas. |

## Fuentes de contenido

Textos, documentos, enlaces y fotografías provienen del sitio oficial de la municipalidad y de portales del Estado (Portal de Transparencia, Ley de Lobby, Mercado Público, SEM, TGR). Los requisitos de los trámites son referenciales.

## Declaración de uso de inteligencia artificial

En este proyecto se usó un asistente de IA (Claude, de Anthropic) como apoyo para escribir y revisar código HTML, CSS y JavaScript, optimizar imágenes, buscar información pública del municipio y redactar textos. Las decisiones de diseño, la arquitectura de contenidos y la revisión final son del equipo. Los datos se verificaron contra fuentes oficiales y el formulario de contacto no recolecta ni envía datos personales.
