# Fuentes de HookDevs — Contar con Datos 2026

## Estadística oficial

**Fuente primaria:** Instituto Nacional de Estadística y Censos (INDEC), Encuesta Permanente de Hogares (EPH), 31 aglomerados urbanos, primer trimestre de 2026.

Página temática: https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-31-58

Bases de datos: https://www.indec.gob.ar/Institucional/Indec/BasesDeDatos

### Indicadores utilizados

| Indicador | 1T 2026 |
|---|---:|
| Tasa de actividad | 48,6% |
| Tasa de empleo | 44,8% |
| Tasa de desocupación | 7,8% |
| Ocupados demandantes de empleo | 15,8% |
| Tasa de subocupación | 11,1% |
| Tasa de informalidad laboral | 44,2% |

### Desagregación regional utilizada

| Área | Empleo | Desocupación |
|---|---:|---:|
| Noroeste | 44,3% | 4,9% |
| Patagonia | 42,8% | 5,0% |
| Cuyo | 45,1% | 5,5% |
| Noreste | 42,1% | 7,2% |
| Total 31 aglomerados | 44,8% | 7,8% |
| Pampeana | 45,8% | 8,2% |
| Gran Buenos Aires | 44,8% | 8,7% |

### Serie reciente utilizada

| Trimestre | Empleo | Desocupación |
|---|---:|---:|
| 1T 2025 | 44,4% | 7,9% |
| 2T 2025 | 44,5% | 7,6% |
| 3T 2025 | 45,4% | 6,6% |
| 4T 2025 | 45,0% | 7,5% |
| 1T 2026 | 44,8% | 7,8% |

## Exploración de oportunidades

HookDevs no hace scraping. Abre buscadores externos y deja que cada portal mantenga sus resultados y filtros.

- Computrabajo: https://ar.computrabajo.com/
- LinkedIn Jobs: https://www.linkedin.com/jobs/
- Indeed Argentina: https://ar.indeed.com/
- Bumeran: https://www.bumeran.com.ar/
- ZonaJobs: https://www.zonajobs.com.ar/
- Get on Board: https://www.getonbrd.com.ar/
- EducaciónIT Empleos: https://empleos.educacionit.com/

## Criterio metodológico

La EPH es una fuente oficial para caracterizar el mercado laboral, pero no mide directamente la demanda de cada tecnología ni el número de postulantes por stack. Por eso no se calcula ni se presenta como oficial un índice de “demanda menos competencia”.

Las búsquedas en portales se presentan como una capa exploratoria complementaria. Una oferta individual o un contador de resultados de un portal no representa por sí solo el universo del empleo tecnológico argentino.

## Actualización automática
La interfaz vuelve a consultar `assets/data/market-data.json` cada 15 minutos y permite forzar una actualización con el botón “Actualizar”. Esto prepara la app para reemplazar el archivo de datos cuando INDEC publique un nuevo período, sin tener que modificar los componentes visuales. La frecuencia de consulta de la app no implica que INDEC publique datos nuevos cada 15 minutos: los indicadores oficiales se actualizan según el calendario estadístico del organismo.

## Ofertas de empleo
La sección 04 muestra tarjetas de vista previa por fuente y permite desplazarlas horizontalmente. Al elegir una región y una tecnología, las tarjetas se filtran cuando hay una coincidencia en la muestra de ofertas cargada; si no hay una coincidencia verificable, se muestra una tarjeta de búsqueda que lleva al portal con la consulta correspondiente. HookDevs no hace scraping ni republica el contenido completo de los portales: el resultado original es la fuente para confirmar disponibilidad, detalle y postulación. Las fuentes incluyen Computrabajo, LinkedIn, Get on Board, EducaciónIT Empleos, ZonaJobs, Bumeran e Indeed.

## Señal tecnológica por región
La sección 02 no presenta “tecnologías usadas” como un indicador oficial: INDEC no publica en la EPH un ranking nacional de lenguajes o frameworks utilizados por región. HookDevs usa por eso la formulación “tecnologías que aparecen en las oportunidades” y las trata como señales de vacantes/búsquedas de portales. No deben interpretarse como participación de mercado ni como prevalencia tecnológica de toda la región.

## Regiones territoriales del explorador (secciones 01, 02 y 03)
Para el selector de regiones (GBA, Centro, Cuyo, NOA, NEA, Patagonia) HookDevs agrupa las 24 jurisdicciones en 6 regiones territoriales, asociadas a la desagregación regional de la EPH:

| Región del explorador | Región EPH equivalente |
|---|---|
| GBA | Gran Buenos Aires |
| Centro | Pampeana (Córdoba, Santa Fe, Entre Ríos, La Pampa) |
| Cuyo | Cuyo |
| NOA | Noroeste |
| NEA | Noreste |
| Patagonia | Patagonia |

Empleo y desocupación por región provienen de esa desagregación oficial. INDEC no publica actividad ni subocupación desagregadas por esta regionalización; esos dos valores son una **estimación de HookDevs**, calculada aplicando a cada región la misma proporción que existe entre el dato nacional y el de empleo/desocupación regional. La evolución trimestral que se grafica por región es igualmente una aproximación a partir de la serie nacional, no una serie oficial por región. Esto se aclara también en la interfaz, debajo de cada gráfico.

## Mapa interactivo y ofertas por zona
Los números que aparecen al pasar el cursor por una provincia (“X empleos nuevos”) son un conteo de la muestra de ofertas cargada en HookDevs para el período elegido, no una medición censal ni un dato de INDEC. Si una provincia, partido o departamento no tiene ninguna oferta de muestra para el período seleccionado, la app lo dice explícitamente (“no se encontraron ofertas… según la última fecha disponible”) en lugar de mostrar un cero sin contexto o inventar una oferta.
