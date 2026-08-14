# SEO TextCraft — Informe del proyecto

## 1. Qué es

SEO TextCraft es una aplicación web que convierte **una carpeta de imágenes** en contenido
editorial listo para publicar: texto de blog optimizado para SEO y metadatos para Pinterest.
Todo el contenido se genera a partir de un **análisis visual real de cada imagen**, no de
suposiciones ni de los nombres de archivo.

## 2. Herramientas

### BlogText Generator (ruta `/`)
1. El usuario sube una carpeta de imágenes (drag & drop o selector de carpeta).
2. Cada imagen se redimensiona en el navegador y se analiza individualmente con IA
   (descripción visual, colores, paleta, estilo, mood, elementos, composición, textura,
   tema, minimalismo, fondo, rasgo distintivo, estacionalidad).
3. Con todos los análisis se genera el contenido de la colección: título, subtítulo,
   introducción, un texto por imagen, conclusión, `seo_title` y `seo_description`.
4. Se construye por código un CSV determinista de dos columnas `key,text` con las filas
   `title`, `subtitle`, `intro`, `image_1 … image_N`, `conclusion`, `seo_title`,
   `seo_description`.
5. La tabla es **editable** antes de descargar el CSV.

### PinText Generator (ruta `/pinterest`)
Reutiliza la misma carpeta ya cargada (estado compartido entre herramientas) y produce
**un único** título (máx. ~95 caracteres), una descripción de la colección completa y una
lista de palabras clave de Pinterest. Cada bloque se copia al portapapeles con un clic.

## 3. Arquitectura técnica

- **Framework**: TanStack Start v1 (React 19 + Vite 7), rutas en `src/routes`.
- **Estilos**: Tailwind CSS v4 con tokens semánticos en `src/styles.css`.
- **IA**: Lovable AI Gateway, modelo `google/gemini-3.6-flash`, llamado siempre en servidor
  (`src/lib/gateway.server.ts`), nunca desde el navegador.

### Archivos clave

| Archivo | Rol |
| --- | --- |
| `src/lib/ai-config.ts` | Configuración central: modelo, idioma, tono, longitudes, límites SEO/Pinterest, concurrencia y **todos los prompts**. |
| `src/lib/gateway.server.ts` | Cliente servidor del gateway de IA. |
| `src/lib/images.ts` | Carga de carpeta, orden natural (`image_2` antes que `image_10`), redimensionado y store compartido entre las dos herramientas. |
| `src/lib/analyze.ts` | Orquestador: lanza los análisis con concurrencia limitada, reporta progreso y recoge fallos. |
| `src/lib/csv.ts` | Construcción determinista de las filas y descarga del CSV. |
| `src/routes/api/analyze-image.ts` | Endpoint de análisis visual por imagen. |
| `src/routes/api/generate-collection.ts` | Endpoint del contenido editorial + SEO. |
| `src/routes/api/generate-pinterest.ts` | Endpoint del título/descripción/keywords de Pinterest. |
| `src/components/UploadPanel.tsx` | Subida de carpeta y previsualización en rejilla. |
| `src/components/ProgressPanel.tsx` | Barra de progreso de las fases de IA. |

### Flujo de datos

```text
Carpeta → resize en navegador → /api/analyze-image (xN, concurrencia 4)
        → análisis JSON → /api/generate-collection  → CSV editable → descarga
                        → /api/generate-pinterest   → título + descripción + keywords
```

## 4. Reglas editoriales

Definidas en `SHARED_RULES` (`src/lib/ai-config.ts`):
tono cálido y editorial; solo se describe lo realmente visible; variedad en las aperturas de
frase; sin palabras sobreexplotadas ("aesthetic", "stunning", "perfect"…); sin keyword
stuffing, emojis, hashtags ni markdown. Cambiar tono, idioma o longitudes solo requiere
editar ese archivo, sin tocar la interfaz.

## 5. Robustez

- Concurrencia limitada (4) para no saturar el gateway.
- Las imágenes que fallan se listan como aviso y no bloquean la generación.
- El número de filas del CSV siempre coincide con el número de imágenes, porque la
  estructura la construye el código y no el modelo.

## 6. Estado y siguientes pasos

Funciona de extremo a extremo. Pendiente (solicitado anteriormente): un selector de **modo
de contenido** (wallpapers / outfits / diseños de uñas) que adapte los prompts de análisis y
de redacción en ambas herramientas.
