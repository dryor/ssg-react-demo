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
* Ve el contenido del home
* Puede interactuar con el home

### El home llega pre-renderizado
* [Ingeniera](#ingeniera) solicita "/"
* El documento recibido ya contiene el contenido del home

### Página 2 se renderiza en el cliente
* [Ingeniera](#ingeniera) solicita "/pagina-2"
* El documento recibido no contiene el contenido de página 2
* Al cargar la aplicación, ve el contenido de página 2

### Navegar entre páginas no solicita documentos nuevos
* [Ingeniera](#ingeniera) abre "/" y navega a "/pagina-2"
* Luego vuelve a "/"
* No se solicitó ningún documento después del primero

## Constraints
- Toda ruta configurada como pre-renderizada llega con su contenido en el documento.
- Toda ruta no configurada sirve el mismo documento base, con el root vacío.
- La hidratación no produce errores ni discrepancias (hydration mismatch).
- No se genera un HTML por cada ruta CSR: todas comparten un único shell.

## Non goals
- Server Components.
- Datos asíncronos o Suspense en este experimento.
- Generar la configuración de nginx (sí debe ser posible a partir de la tabla de rutas).
