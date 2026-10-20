# Municipalidad de Combarbalá — Rediseño web

Proyecto final del curso **Diseño desde el código** (PUCV, 2026). Es un ejercicio universitario de rediseño del sitio de la Ilustre Municipalidad de Combarbalá ([municombarbala.cl](https://www.municombarbala.cl/)); no es el sitio oficial.

**Ver el sitio:** https://mmackay7exe.github.io/municombarbala-rework-ddec/

## De qué se trata

Buscamos que cualquier persona encuentre rápido lo que necesita: hacer un trámite, saber a qué departamento acudir, llamar a la municipalidad, informarse de lo que pasa en la comuna o revisar la información pública. Todo debía funcionar bien tanto en el celular como en el computador.

## Cómo lo organizamos

Partimos revisando el sitio oficial: qué contenidos tenía, cómo estaban ordenados y qué cosas costaba encontrar. Con eso definimos qué páginas necesitaba el sitio y cómo se conectaban entre sí.

Después hicimos unos primeros wireframes generales, que funcionaban como plantilla: una página de inicio y una página interior, para acordar la estructura base (encabezado, menú, contenido y pie de página).

Con esa base hicimos una segunda ronda de wireframes, más detallados, para los distintos tipos de página: inicio, autoridades, un departamento (Administración y Finanzas), el listado de noticias y una noticia. Cada uno en versión escritorio y móvil. Así quedaron plantillas más definidas para construir el resto de las páginas.

En paralelo armamos las directrices de diseño: el azul institucional para el encabezado y el pie, el verde para los botones y acciones, la tipografía Inter, una escala de espacios y bordes redondeados, y reglas de contraste para que todo se lea bien. El detalle está en la Wiki del proyecto.

Finalmente construimos el sitio en HTML, CSS y JavaScript, página por página, y lo fuimos probando en distintos tamaños de pantalla y con las herramientas de validación del W3C y Lighthouse.

## Páginas del sitio

Inicio, Comuna, Cultura y turismo, Autoridades, Departamentos, Trámites y servicios, Noticias, Noticia, Transparencia y participación, Contacto (con agenda telefónica), Buscar, Política de privacidad y una página para direcciones que no existen.

Las páginas con mucha información, como trámites, departamentos y contacto, reúnen todo en un solo lugar, ordenado por categorías y con un buscador para filtrar.

## Cómo están ordenados los archivos

- Los archivos `.html` son las páginas.
- `css/styles.css` es la única hoja de estilos, compartida por todas las páginas.
- `js/main.js` tiene las interacciones: menú, carrusel, filtros, búsqueda, fichas emergentes y formulario.
- `img/` guarda las imágenes y `fonts/` la tipografía.

## Fuentes de contenido

Textos, documentos, enlaces y fotografías provienen del sitio oficial de la municipalidad y de portales del Estado (Portal de Transparencia, Ley de Lobby, Mercado Público, SEM, TGR). Los requisitos de los trámites son referenciales.

## Declaración de uso de inteligencia artificial

En este proyecto se usó un asistente de IA (Claude, de Anthropic) como apoyo para escribir y revisar código HTML, CSS y JavaScript, optimizar imágenes, buscar información pública del municipio y redactar textos. Las decisiones de diseño, la arquitectura de contenidos y la revisión final son del equipo. Los datos se verificaron contra fuentes oficiales y el formulario de contacto no recolecta ni envía datos personales.
