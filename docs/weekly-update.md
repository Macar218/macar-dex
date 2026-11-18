# Macar Dex — procedimiento de actualización de uso

Copia en el repositorio del documento `claude/vgc-actualizacion-uso-procedimiento.md` del proyecto de Claude "MACAR DEX" (18 nov 2026). Si se cambia uno, cambiar el otro.

Se ejecuta todos los lunes (tarea programada `macar-dex-weekly-update` de Claude Code, hacia las 8:47–9:00, Europe/Madrid, con la app de Claude abierta). Versión 3.6: 18 nov 2026.

## Objetivo
Refrescar `meta.js`, `sets.js` y la parte de sets de `items.js` en el repositorio de GitHub `Macar218/macar-dex` (rama `main`), que sirve la app instalable en https://macar218.github.io/macar-dex/ (GitHub Pages). Las apps instaladas (iPhone, ordenador) cogen los archivos nuevos la próxima vez que se abren con conexión.

Desde el 18 nov 2026 ya no se actualiza el antiguo artefacto "Macar Dex" (slug `6fb9c22c-53aa-4189-b00c-cf726cc514ff`).

Hasta el 18 nov 2026 el artefacto era la fuente de verdad. Desde que Arturo edita en Claude Code, la fuente de verdad pasa a ser este repositorio.

## Esquema de meta.js
- `window.SRC` = `{showdown, official, online}` con `label, short, date, sample, merged, n, note`. `official` se rellena en la app a partir de EVENTS.
- `window.USAGES` = `{showdown:{clave:%}, official:{} (vacío, la app lo calcula), online:{clave:%}}`. Clave = nombre en minúsculas sin símbolos (`Charizard-Mega-Y` → `charizardmegay`, `Indeedee-F` → `indeedeef`, `Sirfetch'd` → `sirfetchd`, `Maushold-Three` se suma a `maushold`). Solo claves de `window.KEYS`.
- `window.CURREG` = regulación actual (`regmc`).
- `window.EVENTS` = lista de eventos oficiales: `{id, name, date, reg, type, teams, u:{clave:%}}` con TODOS los Pokémon que lista MunchStats.
- `window.KEYS`: no tocar.
- Ausente = sin dato.

## Uso en la app
- El Daily y los quizzes usan el uso de **showdown** para el pool: +0,3 %, +0,1 % o todos.
- El Top 30 usa los Regionales oficiales (EVENTS).
- En el Dex, ordenar por uso oculta los Pokémon por debajo de 0,1 % (salvo filtro de tier "n").
- La calculadora de daño y el constructor de equipos precargan habilidad y movimientos de `SETS`, y naturaleza, spread y objeto de `CSETS`.

## sets.js
- `window.SETS` = `{clave:{a:[[habilidad,%]…], m:[[movimiento,%]…], t:[[claveCompañero,%]…]}}`. Habilidades (todas, hasta 3), movimientos (top 8) y compañeros (top 6).
- Origen: Smogon moveset del mes, `https://www.smogon.com/stats/<AAAA-MM>/moveset/gen9championsvgc2026regmc-1760.txt` (~613k caracteres). Se leyó con WebFetch en trozos de 100.000 (offset 0, 100000 … 600000) con prompt que devuelva una línea por Pokémon `Nombre|A:…|M:…|T:…`. curl daba 403. El resumidor corta bloques en los límites: el bloque siguiente empieza como "Unknown" y es la continuación del anterior; asignarlo al último Pokémon del bloque anterior.
- Cobertura: 277 de 343 formas. La app muestra aviso si no hay datos.

## items.js
- `window.ITEMS` = 166 objetos de Champions `{n, es, d (EN), dEs (ES), mega, cat, img, u:[[claveUsuario,%]…]}`. **No tocar** salvo el campo `u`.
- `window.CSETS` = `{clave:{i:[[objeto,%]×3], s:[[naturaleza,[hp,atk,def,spa,spd,spe],%]×2]}}`.
- Origen: el mismo archivo moveset, con el prompt: una línea por Pokémon `Name|I:item1 pct,item2 pct,item3 pct|S:spread1 pct;spread2 pct` (top 3 de "Items" sin "Other", top 2 de "Spreads" tal cual, p. ej. `Adamant:2/32/0/0/0/32 25.1`).
- Validar: clave en KEYS; objeto en ITEMS; cada SP ≤32 y suma ≤66. Descartar lo que no cumpla.
- Recalcular `u` de cada objeto: lista de `[clave,%]` de los Pokémon que lo llevan en su top 3, ordenada por % y cortada a 12.

## Fuentes
1. **showdown** — Smogon, solo Reg M-C ladder (NO Bo3), 1760+, mes más reciente. Último mes cargado: oct 2026.
2. **online** — MunchStats Limitless, últimos 30 días, `https://www.munchstats.com/limitless/M-C/25/`. Guardar filas ≥0,1 %.
3. **official (EVENTS)** — MunchStats, necesita navegador. `https://www.munchstats.com/tournaments/`, API `fetch('/tournaments/api/<id>/all/')`. Añadir eventos nuevos de `gen9championsvgc2026reg…`. La app combina los últimos N Regionales de CURREG ponderando por equipos.
4. Descartado: ranked in-game y Bo3 de Showdown.

## Cambio de regulación
Actualizar CURREG, conservar eventos de la regulación actual y los de la anterior de los últimos 30 días; cambiar la URL de Smogon al nuevo formato.

## Pasos de cada ejecución
1. Leer showdown y online; eventos oficiales nuevos.
2. Si hay mes nuevo de Smogon: releer moveset y regenerar `sets.js` y `CSETS` + `u` de `items.js`.
3. Mapear a claves; anotar descartes.
4. Regenerar `meta.js` conservando KEYS y EVENTS previos.
5. Validar que cada archivo parsea como JavaScript y que el top 5 de cada fuente es coherente.
6. (Eliminado: ya no se publica en el artefacto.)
7. Commit en `main` de este repositorio con mensaje `Weekly data update AAAA-MM-DD` y push. Si no hubo cambios, no hacer commit. No tocar `index.html`, `app.js`, `calcui.js`, `smogcalc.js`, `sw.js`, `manifest.webmanifest` ni los iconos.
8. Resumir a Arturo en español.

## Notas
- La meta cambia mucho entre eventos (Salamence-Mega 37 % en Baltimore, 8 % en Nice): por eso la ventana de los últimos 3.
- Un Pokémon con 0 equipos en un evento no aparece en MunchStats: es un 0 real.
- Si Smogon no ha publicado mes nuevo, la ejecución semanal solo revisa online y eventos oficiales.
- Motor de la calculadora: `smogcalc.js` = `@smogon/calc` 0.12.0 (data + calc, gen 0 = Champions). Se actualiza a mano, no en la tarea semanal.
- `sw.js`: red primero (archivos nuevos si hay conexión), caché si no hay. No hace falta subir versión del caché para que lleguen los datos.

## Registro de ejecuciones
- 2026-11-15 (automática): sin cambios en meta.js. Showdown sigue oct 2026; online idéntico; oficial sin eventos nuevos desde Gdansk.
- 2026-11-15 (manual): añadido sets.js.
- 2026-11-17: pasa a ejecución semanal (lunes).
- 2026-11-17 (manual): añadidos items.js, calculadora de daño y pestaña Items.
- 2026-11-18 (manual): app instalable publicada en GitHub (Pages). La tarea semanal sube también los datos al repositorio.
- 2026-11-18 (manual): Top 30 (Regionals) añadido. Arturo pasa a editar en Claude Code; este repositorio es la fuente de verdad.
- 2026-11-18 (manual): la tarea semanal pasa a Claude Code y deja de actualizar el artefacto.
