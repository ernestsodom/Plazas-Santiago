# Condominio Vista Victoria — Presentación

Rediseño de la presentación comercial del **Condominio Vista Victoria** (La Reina,
Santiago). Estilo **minimalista arquitectónico**: neutros piedra, retícula estricta,
líneas finas, renders a sangre completa y tipografía de nivel editorial.

Se entrega en **dos formatos** a partir de un mismo lenguaje visual:

| Formato | Archivo | Uso |
|---|---|---|
| **Web** (scroll inmersivo, responsive) | `index.html` | Compartir el link, publicar en `vistavictoria.cl` |
| **PDF** (19 páginas, landscape) | `Vista-Victoria-Brochure.pdf` | Enviar por correo / WhatsApp, imprimir |
| Fuente del PDF | `brochure.html` | Editar el brochure y regenerar el PDF |

---

## Cómo ver la presentación web

La web es **autocontenida** (tipografías e imágenes incluidas, sin dependencias
externas). Para evitar restricciones del navegador con archivos locales, conviene
servirla:

```bash
cd presentacion
python3 -m http.server 8099
# abrir http://localhost:8099/index.html
```

(También funciona abriendo `index.html` directamente, aunque algunos navegadores
limitan la carga de fuentes vía `file://`.)

### Características
- Navegación fija con barra de progreso y resaltado de sección activa.
- Animaciones de aparición al hacer scroll (respetan `prefers-reduced-motion`).
- Galería con *lightbox* (clic para ampliar renders y planos).
- Pestañas de superficies por unidad (Casa 1 · Casa Tipo 2-5 · Casa 6).
- 100 % responsive (escritorio, tablet y móvil con menú desplegable).

---

## Sistema de diseño

- **Tipografías** (autoalojadas en `assets/fonts/`):
  *Space Grotesk* para titulares y datos · *Inter* para texto.
- **Paleta:** papel `#F4F2EC`, tinta `#16150F`, grises piedra. Sin color de acento:
  el color lo aportan los renders.
- **Marca:** monograma "VV" recreado como SVG vectorial (nítido a cualquier tamaño)
  + wordmark tipográfico.

---

## Regenerar el PDF

El PDF se genera desde `brochure.html` con un Chromium headless (Playwright),
a tamaño `1079 × 654 pt` (la misma proporción del brochure original).

```bash
# requisitos: node + playwright con chromium
npm install playwright && npx playwright install chromium

# con la web servida en http://localhost:8099
node - <<'JS'
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('http://localhost:8099/brochure.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: 'Vista-Victoria-Brochure.pdf', printBackground: true, preferCSSPageSize: true });
  await b.close();
})();
JS
```

---

## Despliegue

Es un sitio **estático**: puede publicarse en GitHub Pages, Vercel, Netlify o
cualquier hosting. Para servirlo desde la app Next.js de este repositorio, basta
copiar la carpeta a `public/presentacion/` y quedará disponible en
`/presentacion/`.

---

## Notas sobre las imágenes

- Los **renders arquitectónicos** son los originales del proyecto, reprocesados en
  alta resolución y presentados a sangre completa.
- Las **fotos de contexto** del brochure original eran banco de imágenes genérico;
  una de ellas (feria) tenía **marca de agua "Unsplash+"** y fue **eliminada**. Se
  curó el set a 5 imágenes auténticas y limpias del entorno (parque, calle de La
  Reina con cordillera, cumbre andina, colegios y metro).
- Para un resultado aún más distintivo, se recomienda sustituir las fotos de
  contexto por **fotografía local con licencia comercial** o material propio.

*Imágenes y renders referenciales.*
