# Condominio Vista Victoria — Presentación

Presentación comercial del **Condominio Vista Victoria** (La Reina, Santiago) con
estilo **minimalista arquitectónico**. El contenido está organizado en **varias
páginas / vistas**: Inicio · El Entorno · El Proyecto · La Casa · Programa ·
Contacto.

## Cómo verla

| Quiero… | Abre | Notas |
|---|---|---|
| **Verla rápido, con doble clic** | **`Vista-Victoria.html`** | Un solo archivo con todo embebido (estilos, fuentes e imágenes). Funciona **sin internet ni servidor**. Las "páginas" se cambian con el menú. |
| Publicarla en un sitio web | `index.html` (+ `entorno.html`, `proyecto.html`, `la-casa.html`, `programa.html`, `contacto.html`) | Sitio multipágina clásico, optimizado para hosting. |
| Enviar por correo / WhatsApp / imprimir | `Vista-Victoria-Brochure.pdf` | Brochure de 19 páginas en formato landscape. |

> **`Vista-Victoria.html` es el archivo recomendado para revisar y compartir.**
> Es autocontenido: ábrelo en cualquier navegador y navega entre las vistas con el
> menú superior. En el sitio multipágina cada vista es un archivo `.html`
> independiente que carga los recursos desde la carpeta `assets/`.

## Estructura

```
presentacion/
├─ Vista-Victoria.html          ← un solo archivo (recomendado para ver/compartir)
├─ index.html                   ← Home (sitio multipágina)
├─ entorno.html · proyecto.html · la-casa.html · programa.html · contacto.html
├─ Vista-Victoria-Brochure.pdf  ← versión PDF
├─ brochure.html                ← fuente del PDF
└─ assets/
   ├─ css/  (app.css · fonts.css · brochure.css)
   ├─ js/   (app.js)
   ├─ img/  (renders, planos y mapa)
   └─ fonts/(Space Grotesk · Inter)
```

## Navegación y diseño

- **Páginas/vistas** con menú superior, breadcrumbs y navegación anterior/siguiente.
- **Home** sintética que funciona como hub, con tarjetas-botón hacia cada vista.
- **Galerías en carrusel** deslizable (swipe en móvil, flechas y puntos en escritorio).
- **Plantas y superficies** por unidad en pestañas; planos ampliables (lightbox).
- **Terminaciones** resumidas, con "ver especificaciones completas" desplegable.
- Tipografías **Space Grotesk + Inter** (autoalojadas), paleta neutra piedra,
  monograma "VV" vectorial. 100 % responsive.

## Regenerar el archivo único o el PDF

```bash
# Archivo único (Vista-Victoria.html) — vuelve a empaquetar las 6 páginas
python3 /tmp/build/bundle.py     # (script incluido en el historial del proyecto)

# PDF — desde brochure.html con Chromium headless (Playwright), 1079×654 pt
node pdf.js
```

## Despliegue

Sitio **estático**: publica la carpeta en GitHub Pages, Vercel o Netlify. Para
servirlo desde la app Next.js del repositorio, copia la carpeta a
`public/presentacion/`.

## Notas sobre las imágenes

- Los **renders** son los originales del proyecto, reprocesados en alta resolución.
- Las fotos de contexto se curaron a imágenes auténticas y limpias; se eliminó una
  imagen de banco con marca de agua. El **mapa** es el exacto del brochure, con
  todas sus etiquetas de puntos de interés.

*Imágenes y renders referenciales.*
