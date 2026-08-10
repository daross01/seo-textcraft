# Wallpaper Wizard

Crear una web para generar contenido SEO y Pinterest a partir de una carpeta de wallpapers

Quiero que construyas una aplicación web completa para generar automáticamente contenido a partir de una carpeta de imágenes de wallpapers/fondos de pantalla.

La aplicación tendrá dos herramientas principales, ambas utilizando como entrada la misma carpeta de imágenes:

Wallpaper Content CSV Generator

Pinterest Collection Generator

La aplicación debe tener una interfaz moderna, limpia, profesional y muy sencilla de utilizar.

CONCEPTO GENERAL

El usuario sube una carpeta que contiene un conjunto de imágenes de wallpapers.

La aplicación debe analizar visualmente las imágenes mediante IA y utilizar ese análisis para generar contenido escrito.

No quiero que el usuario tenga que subir ningún CSV de referencia.

La estructura del CSV de salida de la primera herramienta está definida internamente y es siempre la misma.

El usuario solamente proporciona:

una carpeta de imágenes

y, opcionalmente, información adicional sobre la colección si decidimos añadirla posteriormente.

La aplicación se encarga de analizar las imágenes y generar los textos.

HERRAMIENTA A — WALLPAPER CONTENT CSV GENERATOR

Objetivo

Esta herramienta recibe una carpeta de imágenes y devuelve un archivo CSV preparado para utilizar en una web de wallpapers.

La estructura del CSV está predefinida dentro de la aplicación.

El CSV siempre tiene exactamente dos columnas:

key
text


La columna key contiene identificadores internos.

La columna text contiene el contenido generado por la IA.

El usuario no debe poder modificar la columna key.

La aplicación solamente debe generar/rellenar los valores de la columna text.

ESTRUCTURA FIJA DEL CSV

Las filas fijas que siempre deben existir son:

title
subtitle
intro
image_N
conclusion
seo_title
seo_description


Donde image_N es dinámico según el número de imágenes de la carpeta.

Por ejemplo, si el usuario sube 10 imágenes, el CSV debe contener:

key,text
title,...
subtitle,...
intro,...
image_1,...
image_2,...
image_3,...
image_4,...
image_5,...
image_6,...
image_7,...
image_8,...
image_9,...
image_10,...
conclusion,...
seo_title,...
seo_description,...


Si sube 25 imágenes:

title
subtitle
intro
image_1
image_2
...
image_25
conclusion
seo_title
seo_description


Si sube 6 imágenes:

title
subtitle
intro
image_1
image_2
image_3
image_4
image_5
image_6
conclusion
seo_title
seo_description


Por tanto:

NUNCA debe haber un número fijo de imágenes.

El número de filas image_N debe adaptarse automáticamente al número de imágenes existentes en la carpeta subida.

ORDEN DE LAS FILAS

El orden debe ser siempre:

title

subtitle

intro

image_1

image_2

image_3

...

image_N

conclusion

seo_title

seo_description

No cambiar este orden.

EJEMPLO REAL DE ESTRUCTURA

El CSV de referencia que he proporcionado contiene actualmente estas keys:

title
subtitle
intro
image_1
image_2
image_3
image_4
image_5
image_6
image_7
image_8
image_9
image_10
conclusion
seo_title
seo_description


Pero quiero enfatizar que image_1 a image_10 solamente representan que ese CSV concreto tenía 10 imágenes.

La aplicación NO debe limitarse a 10.

Debe funcionar con cualquier cantidad razonable de imágenes.

ANÁLISIS DE LAS IMÁGENES

La IA debe analizar cada imagen individualmente.

Para cada wallpaper debe identificar, cuando sea relevante:

colores predominantes

paleta de colores

tonalidad

estilo visual

elementos principales

objetos presentes

composición

textura

ambiente

estética

temática

sensación visual

nivel de minimalismo

tipo de fondo

detalles distintivos

relación entre los elementos

posibles referencias estacionales

características que hagan que ese wallpaper sea diferente de los demás

La IA debe describir realmente lo que ve.

No debe inventar elementos que no aparecen en la imagen.

GENERACIÓN DEL CONTENIDO

La IA debe generar contenido natural y de calidad editorial.

No quiero textos que parezcan una simple salida técnica de un modelo de visión.

Los textos deben estar escritos como contenido real para una página web de wallpapers.

La IA debe utilizar el análisis visual para producir textos diferentes y específicos para cada imagen.

No debe repetir exactamente las mismas estructuras para todas las imágenes.

Debe evitar:

frases genéricas repetidas

contenido artificial

keyword stuffing

enumeraciones mecánicas

descripciones excesivamente técnicas

repetir constantemente los mismos adjetivos

afirmar características que no se pueden observar

CAMPO title

Debe generar el título principal de la colección.

Debe representar el conjunto de wallpapers.

Debe tener un estilo atractivo y adecuado para SEO, pero sin parecer spam.

Debe estar relacionado con la temática visual de la colección.

CAMPO subtitle

Debe generar un subtítulo que complemente el título.

Debe explicar brevemente el carácter o estética de la colección.

Debe ser diferente del title y no limitarse a repetirlo.

CAMPO intro

Debe generar una introducción para la colección.

Debe hablar del conjunto de wallpapers como una colección coherente.

Debe utilizar las características visuales que aparecen realmente en las imágenes.

La introducción debe sentirse editorial, natural y atractiva.

No debe describir individualmente cada imagen.

CAMPOS image_N

Debe generarse exactamente un texto para cada imagen.

Por ejemplo:

image_1


corresponde exclusivamente a la primera imagen.

image_2


corresponde exclusivamente a la segunda imagen.

Y así sucesivamente.

Cada texto debe describir y contextualizar el wallpaper correspondiente.

Los textos deben ser:

específicos para esa imagen

naturales

diferentes entre sí

visualmente descriptivos

atractivos para una persona interesada en descargar/utilizar wallpapers

La IA debe evitar comenzar todas las descripciones de la misma manera.

También debe evitar repetir constantemente palabras como:

wallpaper

aesthetic

beautiful

perfect

stunning

cuando no sea necesario.

Debe existir variedad lingüística.

IMPORTANTE: CORRESPONDENCIA IMAGEN / IMAGE_N

La correspondencia debe ser estricta.

Si la carpeta contiene:

01.jpg
02.jpg
03.jpg


entonces:

image_1 → 01.jpg
image_2 → 02.jpg
image_3 → 03.jpg


La aplicación debe mantener un orden determinista de las imágenes.

No se debe cambiar aleatoriamente el orden.

Antes de generar el contenido, la aplicación debe mostrar al usuario las imágenes detectadas y su posición.

Por ejemplo:

1 — wallpaper01.jpg
2 — wallpaper02.jpg
3 — wallpaper03.jpg
...


CAMPO conclusion

Debe generar una conclusión para la colección completa.

Debe cerrar el contenido de forma natural y hacer referencia a la estética o carácter general de los wallpapers.

No debe convertirse en una repetición del intro.

CAMPO seo_title

Debe generar un título SEO para la página.

Debe ser atractivo y descriptivo.

Debe incluir términos relevantes relacionados con wallpapers/fondos de pantalla y la temática real de la colección.

No utilizar keyword stuffing.

CAMPO seo_description

Debe generar una meta descripción SEO.

Debe resumir de forma natural qué encontrará el usuario en la colección.

Debe estar orientada a conseguir clics desde buscadores.

Debe utilizar las características reales de los wallpapers.

GENERACIÓN POR LOTES

Si la carpeta contiene muchas imágenes, la aplicación debe procesarlas de forma segura.

No asumir que solamente habrá 5 o 10 imágenes.

Debe soportar colecciones de tamaño variable.

La aplicación debe evitar perder imágenes o mezclar la correspondencia entre imágenes y textos.

Si la API de IA tiene límites de procesamiento, implementar procesamiento por lotes o concurrencia controlada.

Mostrar progreso:

Analizando imágenes...
7 / 25


Después:

Generando contenido...
12 / 25


Y finalmente:

CSV ready


PREVISUALIZACIÓN

Antes de descargar el CSV, mostrar una previsualización.

Por ejemplo:

keytexttitle...subtitle...intro...image_1...image_2...image_3.........conclusion...seo_title...seo_description...

La tabla debe permitir revisar el contenido antes de descargar.

No es necesario permitir editar las keys.

Si es sencillo de implementar, permitir editar manualmente el contenido de text antes de descargar el CSV.

DESCARGA DEL CSV

Debe existir un botón claro:

Download CSV

El archivo descargado debe ser un CSV válido.

Debe conservar exactamente las columnas:

key,text


Debe escaparse correctamente cualquier coma, comillas o salto de línea existente dentro de text.

No debe romperse el CSV si la IA genera una coma dentro de una frase.

HERRAMIENTA B — PINTEREST COLLECTION GENERATOR

La segunda herramienta utiliza la misma idea de entrada:

una carpeta de wallpapers.

Pero el objetivo es completamente diferente.

Aquí NO queremos generar un título y una descripción para cada imagen.

Queremos generar:

1 TITLE
1 DESCRIPTION


que funcionen para toda la colección de wallpapers.

FUNCIONAMIENTO DE PINTEREST

El usuario sube una carpeta.

La IA analiza el conjunto completo de imágenes.

Debe identificar:

temática común

estética

colores predominantes

estilo

elementos recurrentes

estación o contexto si existe

características diferenciales de la colección

sensación general

posibles keywords relevantes para Pinterest

Después genera un único:

Title

Un título atractivo para una publicación/colección de Pinterest.

Description

Una descripción que represente toda la colección.

La descripción debe ser útil para Pinterest y contener keywords relevantes de forma natural.

MUY IMPORTANTE

El título y descripción de Pinterest deben funcionar para todos los wallpapers de la carpeta.

NO crear:

Pinterest title image 1
Pinterest title image 2
Pinterest title image 3


Debe crear solamente:

Title
Description


para toda la colección.

PINTEREST TITLE

El título debe:

ser atractivo

describir la colección

ser natural

incluir términos relevantes

estar pensado para Pinterest

evitar keyword stuffing

no depender de una única imagen

PINTEREST DESCRIPTION

La descripción debe:

describir la colección completa

mencionar características visuales comunes

incluir keywords relevantes de Pinterest de manera natural

resultar atractiva

incentivar a descubrir/guardar/descargar los wallpapers

funcionar independientemente de cuál de las imágenes vea primero el usuario

INTERFAZ DE LA WEB

Crear una aplicación con una interfaz moderna y minimalista.

La página principal debe tener un dashboard sencillo.

Por ejemplo:

Header

Nombre de la aplicación.

Navegación:

Wallpaper CSV

Pinterest

PÁGINA WALLPAPER CSV

Mostrar:

Upload your wallpaper folder

Una zona grande de drag & drop.

Texto:

Drop your wallpaper folder here

y un botón:

Choose folder

La aplicación debe permitir seleccionar múltiples imágenes de una carpeta.

Formatos soportados inicialmente:

JPG

JPEG

PNG

WEBP

Después de subirlas:

Mostrar:

25 images detected


y una cuadrícula con thumbnails.

Cada thumbnail debe mostrar:

#1
#2
#3
...


para dejar clara la correspondencia con image_N.

Botón:

Generate CSV

ESTADO DE PROCESAMIENTO

Durante el procesamiento mostrar un estado visual claro.

Por ejemplo:

Analyzing your wallpapers

████████░░░░░░░░ 12 / 25

Analyzing image 12...


Después:

Generating collection content


Y después:

Generating individual wallpaper descriptions


Finalmente:

Your CSV is ready


RESULTADO

Mostrar la tabla de resultados.

Botones:

Download CSV

y opcionalmente:

Regenerate

para volver a generar el contenido si el usuario no está satisfecho.

PÁGINA PINTEREST

Debe permitir reutilizar las imágenes ya subidas o subir una nueva carpeta.

Mostrar:

Upload your wallpaper collection

Después:

25 images detected


Botón:

Generate Pinterest Content

Mostrar progreso mientras la IA analiza la colección.

Después mostrar:

Pinterest Title

[texto generado]

Pinterest Description

[texto generado]

Y botones:

Copy Title

Copy Description

Generate Again

ARQUITECTURA TÉCNICA

Construir la aplicación de manera que la API key de IA nunca esté expuesta en el frontend.

Utilizar backend/serverless functions para realizar las llamadas a la API de IA.

La arquitectura debe separar:

Frontend

Responsable de:

upload

preview

progreso

resultados

descarga

navegación

Backend

Responsable de:

recibir las imágenes

procesarlas

llamar al modelo de IA con visión

generar los textos

devolver resultados estructurados

IA / VISION

La aplicación debe utilizar un modelo capaz de analizar imágenes.

No utilizar únicamente nombres de archivos para decidir qué escribir.

El contenido debe basarse principalmente en el contenido visual real de las imágenes.

Si es necesario, utilizar procesamiento en dos fases:

Fase 1

Analizar cada imagen y crear información estructurada sobre ella.

Por ejemplo:

{
  "image_number": 1,
  "visual_description": "...",
  "colors": ["..."],
  "style": "...",
  "mood": "...",
  "elements": ["..."],
  "theme": "..."
}


Fase 2

Utilizar esos análisis para generar el contenido editorial.

Esto ayudará a mantener coherencia entre las descripciones individuales y el contenido general de la colección.

JSON ESTRUCTURADO

La IA no debe devolver texto sin estructura para el backend.

Para la herramienta A, el backend debe construir un objeto equivalente a:

{
  "title": "...",
  "subtitle": "...",
  "intro": "...",
  "images": [
    {
      "image_number": 1,
      "text": "..."
    },
    {
      "image_number": 2,
      "text": "..."
    }
  ],
  "conclusion": "...",
  "seo_title": "...",
  "seo_description": "..."
}


Después el backend convierte ese resultado al CSV:

key,text


generando dinámicamente las filas image_1 ... image_N.

REGLA FUNDAMENTAL DEL CSV

No generar las keys mediante IA.

Las keys deben ser generadas por código.

El código debe crear siempre:

title
subtitle
intro


después:

image_1
image_2
...
image_N


y finalmente:

conclusion
seo_title
seo_description


La IA solamente genera los valores de text.

Esto es MUY IMPORTANTE para garantizar que el formato del CSV sea siempre correcto.

MANEJO DE ERRORES

Implementar mensajes claros para:

carpeta vacía

formato de imagen no soportado

error al procesar una imagen

error de API

timeout

CSV inválido

generación incompleta

Si una imagen falla, mostrar cuál ha fallado.

No cambiar silenciosamente el orden de las imágenes.

EXPERIENCIA DE USUARIO

La aplicación debe sentirse como una herramienta interna profesional para crear contenido en grandes cantidades.

Priorizar:

simplicidad

velocidad

claridad

feedback visual

drag & drop

progreso

resultados fáciles de revisar

descarga rápida

No crear una interfaz excesivamente compleja.

DISEÑO

Utilizar un diseño moderno tipo SaaS.

Preferencias:

fondo limpio

tipografía moderna

cards

bordes suaves

buena separación visual

botones claros

estados de loading elegantes

grid de imágenes

responsive

desktop-first pero usable en tablet/móvil

La interfaz debe dar prioridad absoluta a las imágenes y al contenido generado.

ESTRUCTURA FINAL DE LA APLICACIÓN

La aplicación debe tener como mínimo:

Dashboard
│
├── Wallpaper CSV Generator
│   ├── Upload folder
│   ├── Image preview
│   ├── Image count
│   ├── Generate
│   ├── Processing progress
│   ├── CSV preview
│   ├── Regenerate
│   └── Download CSV
│
└── Pinterest Generator
    ├── Upload folder
    ├── Image preview
    ├── Image count
    ├── Generate
    ├── Processing progress
    ├── Pinterest title
    ├── Pinterest description
    ├── Copy buttons
    └── Regenerate


REQUISITO CRÍTICO

No quiero una demo estática.

Quiero una aplicación funcional de extremo a extremo.

El usuario debe poder:

abrir la web

seleccionar una carpeta con wallpapers

ver las imágenes detectadas

generar contenido mediante IA

ver los resultados

descargar el CSV válido en la herramienta A

copiar el título y descripción de Pinterest en la herramienta B

La aplicación debe estar preparada para trabajar con diferentes cantidades de imágenes.

Especialmente:

El número de image_N debe depender siempre del número real de imágenes subidas.

No utilizar nunca una plantilla fija de 10 imágenes.

VARIABLES DE CONFIGURACIÓN

Mantener separadas las instrucciones/prompt de generación de IA del código de interfaz.

Quiero poder modificar posteriormente fácilmente:

estilo de escritura

idioma

longitud

reglas SEO

reglas de Pinterest

keywords

tono

sin tener que reconstruir la aplicación completa.

Por ahora, la generación debe estar orientada a contenido en inglés, ya que los wallpapers y el contenido de ejemplo están destinados a una web en inglés.

RESULTADO ESPERADO

Construye la aplicación completa siguiendo estas especificaciones.

Primero crea la estructura visual y funcional de las dos herramientas.

Después implementa el procesamiento real de imágenes y la generación mediante IA.

Finalmente implementa la generación del CSV dinámico y la descarga.

Asegúrate de que la herramienta A produzca siempre un CSV con exactamente dos columnas:

key,text


y que las únicas keys sean:

title
subtitle
intro
image_1 ... image_N
conclusion
seo_title
seo_description


donde N corresponde exactamente al número de imágenes procesadas.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1b4f3054-4336-454f-953d-2f277f2e72d5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
