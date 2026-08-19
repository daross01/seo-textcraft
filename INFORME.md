# SEO TextCraft — Auditoría final

## 1. Estado general
Aplicación coherente y funcional. Dos herramientas (BlogText y PinText) comparten una única
fuente de verdad: colección de imágenes + modo de contenido + caché de análisis visual.
Toda la configuración de IA (modelo, concurrencia, límites, prompts y modos) vive en
`src/lib/ai-config.ts`. Verificado de extremo a extremo en navegador con una carpeta real de 3 imágenes.

## 2. Problemas encontrados
1. Estado duplicado: ambas páginas mantenían copias locales de `images` y del modo, con riesgo de
   desincronización entre herramientas.
2. `setSharedMode` aceptaba cualquier cadena sin normalizar (modo inválido posible).
3. Código muerto en `ai-config.ts` (`MODES`, `ANALYSIS_PROMPT`, `modeLabel`) y en `images.ts`
   (`getSharedMode`).
4. PinText no informaba de imágenes cuyo análisis había fallado y el prompt no indicaba cómo
   tratarlas (riesgo de inventar rasgos).
5. `useMemo` con dependencia sobre un valor mutable en BlogText (aviso de hooks).
6. Formato Prettier inconsistente en los archivos tocados.

## 3. Correcciones realizadas
- Las dos rutas leen ahora `useSharedWallpapers()` y `useSharedMode()` como única fuente de verdad;
  la subida escribe directamente en el store compartido.
- `setSharedMode` normaliza la entrada y el estado está tipado como `ModeId`.
- Eliminado el código muerto de configuración y del store.
- El prompt de Pinterest ignora explícitamente análisis vacíos o fallidos; PinText muestra avisos
  con las imágenes no analizadas.
- Sustituido el `useMemo` por una expresión derivada y limpiado el import.
- Formateados los archivos modificados.

## 4. Archivos modificados
- `src/routes/index.tsx`
- `src/routes/pinterest.tsx`
- `src/lib/images.ts`
- `src/lib/ai-config.ts`

## 5. Pruebas realizadas
Unitarias (Vitest, 8/8 correctas):
- caché por `imagen + modo`, reutilización y clave `modo::imagen`;
- deduplicación de peticiones en vuelo (3 llamadas simultáneas → 1 análisis);
- los fallos nunca se cachean;
- purgado de análisis al cambiar de carpeta;
- recorte de títulos de Pinterest y de descripciones SEO sin cortar palabras;
- saneado y deduplicación de keywords; normalización de modos desconocidos.

End-to-end (navegador, carpeta real de 3 imágenes, modo Outfits):
- BlogText: 3 análisis + 1 generación → CSV con 9 filas y claves exactas
  `title, subtitle, intro, image_1..3, conclusion, seo_title, seo_description`;
- navegación a PinText: misma carpeta y mismo modo visibles, **0 análisis nuevos** (reutilización total);
- cambio de modo a Wallpapers: se re-analiza (3 análisis nuevos), como debe ser;
- persistencia del modo entre herramientas confirmada en navegación cliente.

## 6. Build / typecheck
- `tsgo --noEmit`: sin errores.
- ESLint en los archivos modificados: sin errores ni avisos.
- Servidor de desarrollo y SSR funcionando; no hay errores de runtime en consola.

## 7. Limitaciones actuales
- El estado compartido vive en memoria: al recargar la página se pierden imágenes, modo y análisis.
- Los análisis se cachean por sesión, no en base de datos.
- La calidad del texto depende del modelo; los límites SEO se garantizan con reescritura + recorte seguro.
- Avisos benignos de `react-refresh/only-export-components` en componentes shadcn (no afectan al build).
