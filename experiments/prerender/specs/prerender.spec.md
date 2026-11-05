# Pre-render configurable por ruta

## Abilities
### Navegar en el browser
Abrir URLs, hacer clic y ver el contenido renderizado.
### Inspeccionar la red
Ver los documentos y recursos que el browser solicita y recibe.

## Actors
### Visitante
Usuario final del sitio.
#### Abilities
- [Navegar en el browser](#navegar-en-el-browser)
### Ingeniera
Ingeniera frontend que verifica la estrategia de renderizado.
#### Abilities
- [Navegar en el browser](#navegar-en-el-browser)
- [Inspeccionar la red](#inspeccionar-la-red)

## Scenarios
### El visitante ve el home de inmediato al entrar
* [Visitante](#visitante) abre "/"
* Ve el texto "pre render"
* Puede interactuar con el home: sigue su link a "/pagina-2"

### El home llega pre-renderizado
* [Ingeniera](#ingeniera) solicita "/"
* El documento recibido ya contiene el texto "pre render"

### Página 2 se renderiza en el cliente
* [Ingeniera](#ingeniera) solicita "/pagina-2"
* El documento recibido no contiene el texto "no prerenderizado"
* Al cargar la aplicación, ve el texto "no prerenderizado"

### Navegar entre páginas no solicita documentos nuevos
* [Ingeniera](#ingeniera) abre "/" y navega a "/pagina-2"
* Luego vuelve a "/"
* No se solicitó ningún documento después del primero

### Una URL desconocida responde 404
* [Ingeniera](#ingeniera) solicita "/ruta-no-configurada"
* Recibe el estado HTTP 404
* El documento recibido ya contiene el texto "404"

### La barra final redirige a la URL canónica
* [Ingeniera](#ingeniera) solicita "/pagina-2/"
* Recibe una redirección 301 a "/pagina-2"
* [Visitante](#visitante) abre "/pagina-2/" y ve el texto "no prerenderizado"

### En desarrollo no hay pre-render
* [Ingeniera](#ingeniera) solicita "/" al servidor de desarrollo
* El documento recibido tiene el root vacío
* Al cargar la aplicación, ve el texto "pre render"

## Constraints
- Toda ruta configurada como pre-renderizada llega con su contenido en el documento.
- Toda ruta configurada como CSR sirve el mismo documento base, con el root vacío.
- Toda URL que no está en la tabla de rutas responde 404 con `404.html` pre-renderizado.
- Toda URL con barra final, salvo "/", redirige con 301 a la misma URL sin la barra.
- La hidratación no produce errores ni discrepancias (hydration mismatch).
- No se genera un HTML por cada ruta CSR: todas comparten un único shell.
- El código de servidor no forma parte de la salida publicada (`dist`).
- En modo desarrollo no hay pre-render: todas las rutas llegan con el root vacío.

## Non goals
- Server Components.
- Datos asíncronos, Suspense o `use(browser())` en este experimento.
- Generar la configuración de nginx. El build solo genera la lista de rutas CSR,
  que el `nginx.conf` escrito a mano incluye.
