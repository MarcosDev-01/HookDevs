# HookDevs

HookDevs es una aplicación de visualización de datos para explorar el mercado laboral argentino y las oportunidades de empleo en tecnología.

## Qué hace la app

- Muestra el contexto laboral oficial de Argentina (INDEC · EPH): actividad, empleo, desocupación y subocupación, a nivel nacional y por región.
- Permite elegir una región (GBA, Centro, Cuyo, NOA, NEA, Patagonia) y ver su evolución reciente y las tecnologías que más aparecen en sus oportunidades de empleo.
- Compara dos regiones lado a lado (indicadores y tecnologías).
- Muestra un mapa interactivo de Argentina: al pasar el cursor por una provincia se ve cuántos empleos nuevos hay para el período elegido (24 horas, 3, 7 o 14 días); si no hay ninguno, lo indica en vez de inventar un resultado.
- Permite filtrar oportunidades por región, provincia, partido/departamento, rol o tecnología y fecha, y abre la búsqueda ya armada en portales externos (Computrabajo, LinkedIn, Indeed, Bumeran, ZonaJobs, Get on Board, EducaciónIT Empleos).
- Si una zona y período no tienen coincidencias, la app lo informa explícitamente y ofrece ampliar la búsqueda, en vez de mostrar datos inexistentes.

Los indicadores oficiales describen el contexto laboral general. Las oportunidades de empleo son señales dinámicas de búsqueda y deben verificarse siempre en el portal original.

## Ejecutar

```bash
npm install
npm start
```

Para generar la versión de producción:

```bash
npm run build
```
