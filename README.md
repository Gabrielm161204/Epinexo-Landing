# EpiNexo · Landing page responsive (TB2)

Landing page funcional de **EpiNexo**, solución de salud digital para la vigilancia y gestión del dengue.
Proyecto del curso **HCI for UX Design (1ASI0784) · UPC · 2026-20**.

El proyecto tiene dos partes separadas, con **datos de demostración ficticios** de la región «Valle Claro»:

- **`index.html` · sitio comercial (público):** propuesta de valor, problema, cómo funciona, perfiles y formulario de contacto con aviso de uso de datos. No muestra tableros.
- **`demo.html` · demo con acceso:** pide iniciar sesión con cuenta institucional y un código de verificación (doble factor). Cada perfil ve solo su menú; la sesión se cierra tras 15 minutos sin actividad.
- **`privacidad.html` · aviso de privacidad** (Ley N.° 29733).

Implementa las **30 historias de usuario core** con HTML, CSS y JavaScript puros (sin frameworks).

## Estructura

```
epinexo-landing/
├── index.html          # Sitio comercial: HU-47, HU-05 y HU-48 (con aviso de datos)
├── demo.html           # Acceso (HU-01 a HU-04) y demo por perfil
├── privacidad.html     # Aviso de privacidad
├── css/styles.css      # Guía de estilos y diseño responsive mobile-first
├── js/
│   ├── data.js         # Datos de demostración (zonas, fuentes, camas, stock, brigadas)
│   ├── landing.js      # Interacciones del sitio comercial
│   └── app.js          # Acceso, roles, sesión, demo, modo sin conexión y cifrado en el dispositivo
├── assets/img/         # Logo e ilustraciones SVG
└── tests/acceptance.py # Pruebas de aceptación automatizadas
```

## Cuentas de demostración

| Perfil | Correo | Contraseña |
|---|---|---|
| Analista epidemiológico | ana.torres@diresa-valleclaro.gob.pe | Demo2026! |
| Coordinador de la respuesta | carlos.mendoza@diresa-valleclaro.gob.pe | Demo2026! |
| Brigada de campo | lucia.mendez@diresa-valleclaro.gob.pe | Demo2026! |

El código de verificación se muestra en pantalla como «correo simulado» (no hay servidor). Las cuentas son ficticias.

## HU implementadas

| Página / perfil | HU core | Complementarias |
|---|---|---|
| Acceso (demo.html) | HU-01, HU-02, HU-03, HU-04 | |
| Analista | HU-06, HU-07, HU-08, HU-09, HU-10, HU-12, HU-14, HU-15, HU-16, HU-19 | HU-13, HU-17 |
| Coordinador | HU-23, HU-24, HU-25, HU-26, HU-29, HU-30, HU-31, HU-44, HU-49 | HU-33, HU-46 |
| Brigada de campo | HU-34, HU-35, HU-36, HU-38, HU-39, HU-40, HU-41 | HU-43 |
| Sitio comercial (index.html) | | HU-47, HU-05, HU-48 |

## Seguridad y privacidad (demo)

- **Doble factor:** código de 6 dígitos válido 5 minutos.
- **Inactividad:** aviso con «Seguir conectado» al minuto 14 y cierre a los 15 minutos (`demo.html?inactividad=N` acelera el tiempo solo para las pruebas).
- **Datos en el celular:** los registros pendientes de la brigada se guardan cifrados con AES-GCM de 256 bits; la clave se deriva de la contraseña (PBKDF2) y solo existe durante la sesión.
- **Equipo perdido o robado (HU-49):** el coordinador lo desvincula; al conectarse, la app cierra la sesión y borra los datos guardados.
- **Datos agregados:** los tableros muestran datos por zona, sin pacientes; de 1 a 4 casos se muestra «menos de 5». Las coordenadas son un punto de referencia de la zona, no una vivienda.

## Ejecutar en local

Abre `index.html` en el navegador o, mejor, sirve la carpeta:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Publicar en GitHub Pages

1. Sube el contenido de esta carpeta a la raíz de un repositorio (rama `main`).
2. En el repositorio: **Settings → Pages**.
3. En *Build and deployment* elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`.
4. Espera la publicación y abre la URL `https://<usuario>.github.io/<repositorio>/`.
5. Vuelve a comprobar en esa URL el flujo completo en desktop y en un celular.

## Uso en las pruebas con usuarios

Inicia sesión con la cuenta del perfil del participante. El botón **«Reiniciar demo»** devuelve los datos al estado inicial; úsalo antes de cada participante.
Lo que se registra en la demo se guarda solo en el navegador (localStorage).

## Accesibilidad

Enlace para saltar al contenido, landmarks, etiquetas visibles en formularios, errores con `aria-invalid` y `aria-describedby`,
pestañas ARIA con flechas del teclado, foco visible de 3 px, estados con ícono + texto (no solo color),
alternativa en tabla para el gráfico y lista para el mapa, objetivos táctiles ≥ 44 px y `prefers-reduced-motion`.

Íconos: [Lucide](https://lucide.dev) (licencia ISC). Tipografía: Inter (OFL).

## Pruebas de aceptación automatizadas

`tests/acceptance.py` ejecuta 74 pruebas: los escenarios Gherkin de las HU core, de las HU complementarias implementadas y de los criterios nuevos de seguridad y privacidad, con Playwright.
Ejecútalo contra la URL de GitHub Pages para dejar evidencia sobre la versión desplegada:

```bash
pip install playwright && python -m playwright install chromium
cd tests && python acceptance.py https://<usuario>.github.io/<repositorio>/index.html
```

Genera `resultados_aceptacion.json` y una captura por prueba en `tests/evidencias/`.
