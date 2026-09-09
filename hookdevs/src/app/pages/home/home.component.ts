import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobSearchComponent } from '../../components/job-search/job-search.component';
import { LaborMarketComponent } from '../../components/labor-market/labor-market.component';
import { TerritoryService, TerritorialRegion, TechBadge } from '../../services/territory.service';
import { JOB_FEEDS } from '../../lib/job-feed';

interface ProvinceSignal {
  id: string;
  name: string;
  short: string;
  region: string;
  count24: number;
  count3: number;
  count7: number;
  count14: number;
  x: number;
  y: number;
  points: string;
  countFor: (days: number) => number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, JobSearchComponent, LaborMarketComponent],
  template: `
    <section class="home-hero">
      <div class="hero-copy">
        <div class="hero-brandline"><img src="assets/hookdevs-logo.png" alt="HookDevs" /><span>CONTAR CON DATOS · 2026</span></div>
        <div class="hero-breadcrumb">Argentina · 31 aglomerados · {{ territorialRegions.length || 6 }} regiones · oportunidades IT</div>
        <h1>¿Dónde están las oportunidades laborales <em>en Argentina?</em></h1>
        <p>Datos reales del mercado laboral, territorio y tecnología, y oportunidades de empleo, todo en un solo lugar.</p>
        <div class="journey-line">
          <span><b>⌖</b> Datos oficiales<small>INDEC</small></span><i>→</i>
          <span><b>▦</b> Región<small>Provincia / partido</small></span><i>→</i>
          <span><b>⌘</b> Tecnología<small>Señales de búsqueda</small></span><i>→</i>
          <span><b>▣</b> Empleo<small>Portales</small></span>
        </div>
      </div>

      <div class="hero-map-card">
        <div class="map-card-top"><span>SEÑAL DE OPORTUNIDADES</span><strong>{{ rangeLabel }}</strong></div>
        <div class="map-stage" (mouseleave)="hoveredProvince = null">
          <svg viewBox="0 0 360 560" class="argentina-map" role="img" aria-label="Mapa interactivo de Argentina por provincia">
            <defs>
              <linearGradient id="mapFill" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#2b9cff"/><stop offset="1" stop-color="#0a5bbd"/></linearGradient>
              <filter id="mapGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <g class="map-grid"><path d="M32 20H328M32 120H328M32 220H328M32 320H328M32 420H328M32 520H328"/><path d="M80 0V540M160 0V540M240 0V540M320 0V540"/></g>
            @for (p of provinceSignals; track p.id) {
              <polygon class="province-shape" [class.active]="selectedProvince === p.id" [class.hovered]="hoveredProvince === p.id" [class.no-signal]="p.countFor(daysAgo) === 0" [attr.points]="p.points" (mouseenter)="hoveredProvince = p.id" (click)="selectProvince(p.id)" tabindex="0" (focus)="hoveredProvince = p.id" (blur)="hoveredProvince = null"></polygon>
            }
          </svg>
          @if (hoveredProvinceData; as p) {
            <div class="map-tooltip" [class.empty]="p.countFor(daysAgo) === 0" [style.left.%]="tooltipX(p)" [style.top.%]="tooltipY(p)">
              @if (p.countFor(daysAgo) > 0) {
                <strong>{{ p.name }}</strong><span>{{ p.countFor(daysAgo) }} empleos nuevos</span><small>{{ rangeLabel }} · {{ p.region }}</small>
              } @else {
                <strong>{{ p.name }}</strong><span class="radar-empty"><i>◌</i> Sin señal</span><small>No se encontraron ofertas en esta zona según la última fecha disponible.</small>
              }
            </div>
          }
          <div class="map-selected" *ngIf="selectedProvinceData as p">
            <span>Seleccionada</span><strong>{{ p.name }}</strong>
            @if (p.countFor(daysAgo) > 0) { <b>{{ p.countFor(daysAgo) }} empleos nuevos</b> } @else { <b class="dim">Sin ofertas para {{ rangeLabel.toLowerCase() }}</b> }
          </div>
        </div>
        <div class="map-note"><span>Pasá el cursor por una provincia</span><small>El mapa responde al período elegido abajo.</small></div>
      </div>

      <aside class="national-card">
        <div class="national-head"><div><span>RESUMEN NACIONAL</span><strong>1T 2026</strong></div><small>Fuente: INDEC</small></div>
        <div class="national-grid">
          <article><span>♙</span><b>48,6%</b><small>Tasa de actividad</small><em>+0,4 pp. vs 1T 2025</em></article>
          <article><span>▣</span><b>44,8%</b><small>Tasa de empleo</small><em>+0,6 pp. vs 1T 2025</em></article>
          <article><span>⌁</span><b>7,8%</b><small>Tasa de desocupación</small><em>−0,8 pp. vs 1T 2025</em></article>
          <article><span>◷</span><b>11,1%</b><small>Tasa de subocupación</small><em>−0,6 pp. vs 1T 2025</em></article>
        </div>
        <div class="national-refresh"><span><i></i>Los datos se actualizan automáticamente cada 15 minutos.</span><button type="button" class="link-btn" (click)="refreshTerritory()">↻ Actualizar ahora</button></div>
      </aside>
    </section>

    <section class="region-explorer" id="regiones">
      <div class="region-panel">
        <div class="section-kicker">01 · REGIÓN</div>
        <h2>Elegí una región de Argentina</h2>
        <p class="muted compact">Cada región tiene un contexto laboral distinto. Explorá cómo están el empleo, la desocupación y la actividad en cada una.</p>
        <div class="region-tabs" role="tablist" aria-label="Regiones de Argentina">
          @for (r of territorialRegions; track r.id) { <button type="button" role="tab" [class.active]="activeRegion === r.id" (click)="setActiveRegion(r.id)">{{ r.short }}</button> }
        </div>
        @if (activeRegionData; as r) {
          <div class="region-detail">
            <div class="region-detail-head"><span>⌖</span><strong>{{ r.name }}</strong></div>
            <ul class="region-stat-list">
              <li><span>Empleo</span><b>{{ pct(r.employment) }}</b></li>
              <li><span>Desocupación</span><b>{{ pct(r.unemployment) }}</b></li>
              <li><span>Actividad</span><b>{{ pct(r.activity) }}</b></li>
              <li><span>Subocupación</span><b>{{ pct(r.subocupacion) }}</b></li>
            </ul>
            <div class="region-evo">
              <div class="region-evo-head"><span>Evolución del empleo ({{ r.short }})</span><b [class.down]="evoDelta(r) < 0">{{ evoDelta(r) >= 0 ? '+' : '' }}{{ evoDelta(r).toFixed(1).replace('.', ',') }} pp</b></div>
              <svg viewBox="0 0 300 90" class="evo-chart" preserveAspectRatio="none">
                <polyline [attr.points]="evoPoints(r)" fill="none" stroke="#25df9b" stroke-width="2"></polyline>
                @for (pt of evoDots(r); track $index) { <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="2.6" fill="#25df9b"></circle> }
              </svg>
              <div class="region-evo-labels"><span>1T 2024</span><span>3T 2024</span><span>1T 2025</span><span>1T 2026</span></div>
            </div>
            <small class="region-fineprint">Empleo y desocupación: INDEC · EPH, {{ period }}. Actividad y subocupación regional son una estimación de HookDevs a partir de la proporción nacional (INDEC no las publica desagregadas por esta región territorial). Evolución trimestral aproximada.</small>
          </div>
        }
      </div>

      <div class="tech-panel">
        <div class="section-kicker">02 · TECNOLOGÍA</div>
        <h2>Tecnologías más presentes en la región</h2>
        <p class="muted compact">Estas son las tecnologías que aparecen con más frecuencia en las oportunidades de empleo de la región seleccionada.</p>
        @if (activeRegionData; as r) {
          <div class="tech-grid">
            @for (t of visibleTechs(r); track t) {
              <span class="tech-chip" [style.background]="techColor(t)" [style.color]="techInk(t)"><b>{{ techMark(t) }}</b>{{ t }}</span>
            }
            @if (r.techs.length > 6) { <button type="button" class="tech-more" (click)="showAllTechs = !showAllTechs">{{ showAllTechs ? 'Ver menos' : '+ Ver más' }}</button> }
          </div>
        }
        <div class="tech-note"><i>ⓘ</i><span>No es un ranking oficial de INDEC. Estas tecnologías surgen del análisis de las búsquedas y ofertas de empleo disponibles en los portales.</span></div>
      </div>
    </section>

    <section class="comparator-shell">
      <div class="comparator-head">
        <div><div class="section-kicker">03 · COMPARADOR DE REGIONES</div><h2>GBA vs {{ compareRegionData?.short }}</h2><p class="muted compact">Comparás indicadores laborales y tecnologías destacadas entre dos regiones.</p></div>
        <div class="region-toggle" role="group" aria-label="Elegí la región a comparar con GBA">
          @for (r of comparableRegions; track r.id) { <button type="button" [class.active]="compareRegionId === r.id" (click)="compareRegionId = r.id">{{ r.short }}</button> }
        </div>
      </div>
      @if (baseRegionData; as base) { @if (compareRegionData; as comp) {
        <div class="comparator-grid">
          <table class="comparator-table">
            <thead><tr><th>Indicador</th><th>{{ base.short }}</th><th>{{ comp.short }}</th><th></th></tr></thead>
            <tbody>
              <tr><td>Empleo</td><td>{{ pct(base.employment) }}</td><td>{{ pct(comp.employment) }}</td><td [class.up]="comp.employment>base.employment" [class.down]="comp.employment<base.employment">{{ deltaLabel(comp.employment, base.employment) }}</td></tr>
              <tr><td>Desocupación</td><td>{{ pct(base.unemployment) }}</td><td>{{ pct(comp.unemployment) }}</td><td [class.up]="comp.unemployment>base.unemployment" [class.down]="comp.unemployment<base.unemployment">{{ deltaLabel(comp.unemployment, base.unemployment) }}</td></tr>
              <tr><td>Actividad</td><td>{{ pct(base.activity) }}</td><td>{{ pct(comp.activity) }}</td><td [class.up]="comp.activity>base.activity" [class.down]="comp.activity<base.activity">{{ deltaLabel(comp.activity, base.activity) }}</td></tr>
              <tr><td>Subocupación</td><td>{{ pct(base.subocupacion) }}</td><td>{{ pct(comp.subocupacion) }}</td><td [class.up]="comp.subocupacion>base.subocupacion" [class.down]="comp.subocupacion<base.subocupacion">{{ deltaLabel(comp.subocupacion, base.subocupacion) }}</td></tr>
            </tbody>
          </table>

          <div class="comparator-techs">
            <div class="section-kicker">TECNOLOGÍAS EN OPORTUNIDADES</div>
            <div class="comparator-tech-cols">
              <div><span class="col-label">{{ base.short }}</span>@for (t of base.techs.slice(0,5); track t) {<span class="tech-chip small" [style.background]="techColor(t)" [style.color]="techInk(t)"><b>{{ techMark(t) }}</b>{{ t }}</span>}</div>
              <div><span class="col-label">{{ comp.short }}</span>@for (t of comp.techs.slice(0,5); track t) {<span class="tech-chip small" [style.background]="techColor(t)" [style.color]="techInk(t)"><b>{{ techMark(t) }}</b>{{ t }}</span>}</div>
            </div>
          </div>

          <div class="comparator-maps">
            <div class="mini-map-wrap"><svg viewBox="0 0 360 560" class="mini-map"><g>@for (p of provinceSignals; track p.id) {<polygon [class.mini-fill-a]="inRegion(p, base)" [attr.points]="p.points"></polygon>}</g></svg><span><i class="dot dot-a"></i>{{ base.short }}</span></div>
            <div class="mini-map-wrap"><svg viewBox="0 0 360 560" class="mini-map"><g>@for (p of provinceSignals; track p.id) {<polygon [class.mini-fill-b]="inRegion(p, comp)" [attr.points]="p.points"></polygon>}</g></svg><span><i class="dot dot-b"></i>{{ comp.short }}</span></div>
          </div>
        </div>
      } }
    </section>

    <section class="opportunity-map-controls">
      <div class="control-intro"><span class="section-kicker">ANTES DE BUSCAR</span><h2>Elegí tu zona exacta: provincia y partido</h2><p>Podés ir más allá de la región: elegí provincia y partido/departamento puntual. HookDevs combina la consulta con portales externos; los números del mapa son <b>señales de búsqueda de la muestra de la app</b>, no un censo del mercado laboral.</p></div>
      <div class="range-switch" role="group" aria-label="Período de búsqueda">
        @for (range of ranges; track range.days) { <button type="button" [class.active]="daysAgo === range.days" (click)="daysAgo = range.days">{{ range.label }}</button> }
      </div>
      <div class="territory-filters">
        <label>Provincia<select [ngModel]="selectedProvince" (ngModelChange)="selectProvince($event)"><option value="">Toda Argentina</option>@for (p of provinceSignals; track p.id) {<option [value]="p.id">{{ p.name }}</option>}</select></label>
        <label>Partido / departamento<select [(ngModel)]="selectedDepartment"><option value="">Todos</option>@for (d of currentDepartments; track d) {<option [value]="d">{{ d }}</option>}</select></label>
        <button class="btn search-button" type="button" (click)="goToSearch()">Aplicar a oportunidades →</button>
      </div>
      @if (selectedProvinceData; as p) {
        @if (localSampleCount > 0) {
          <div class="selection-result"><div><span>Tu zona</span><strong>{{ p.name }}{{ selectedDepartment ? ' · ' + selectedDepartment : '' }}</strong></div><b>{{ localSampleCount }} ofertas de muestra</b><small>{{ rangeLabel }} · {{ p.region }}</small></div>
        } @else {
          <div class="selection-result empty"><div class="no-results-orb small">◌</div><div><span>Tu zona</span><strong>{{ p.name }}{{ selectedDepartment ? ' · ' + selectedDepartment : '' }}</strong><small>No encontramos ofertas para esta zona según la última fecha disponible ({{ rangeLabel.toLowerCase() }}). Podés ampliar el período, quitar el partido o buscar en toda la provincia.</small></div><button class="btn secondary" type="button" (click)="selectedDepartment=''">Ampliar a provincia →</button></div>
        }
      }
    </section>

    <app-labor-market></app-labor-market>
    <app-job-search></app-job-search>

    <section class="profile-explorer">
      <div class="section-kicker">05 · TU RUTA LABORAL</div><h2>Del dato a la próxima acción</h2><p class="muted lead">Seleccioná territorio, tecnología y antigüedad para contrastar señales entre portales sin convertirlas en una estadística oficial.</p>
      <div class="profile-steps"><article><span>01</span><h3>Elegí dónde</h3><p>Provincia, partido/departamento o Argentina completa.</p></article><article><span>02</span><h3>Elegí qué buscar</h3><p>Rol, tecnología, modalidad y ventana temporal.</p></article><article><span>03</span><h3>Contrastá fuentes</h3><p>Compará resultados y abrí la oferta en el portal original.</p></article></div>
    </section>

    <section class="sources-section"><div class="section-kicker">FUENTES Y METODOLOGÍA</div><h2>Qué hay detrás de HookDevs</h2><div class="source-grid"><a href="https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-31-58" target="_blank" rel="noopener noreferrer"><b>INDEC · Mercado de trabajo</b><span>Indicadores y series de la EPH.</span></a><a href="https://www.indec.gob.ar/Institucional/Indec/BasesDeDatos" target="_blank" rel="noopener noreferrer"><b>INDEC · Bases de datos</b><span>Microdatos y publicaciones oficiales.</span></a><a href="https://www.getonbrd.com.ar/" target="_blank" rel="noopener noreferrer"><b>Get on Board</b><span>Oportunidades de tecnología.</span></a><a href="https://empleos.educacionit.com/" target="_blank" rel="noopener noreferrer"><b>EducaciónIT Empleos</b><span>Bolsa de empleo IT.</span></a></div><p class="method-footer">La EPH describe el contexto laboral. Las oportunidades son señales dinámicas de búsqueda y deben verificarse en el portal original.</p></section>
  `,
})
export class HomeComponent implements OnInit {
  daysAgo = 1;
  selectedProvince = '';
  selectedDepartment = '';
  hoveredProvince: string | null = null;
  activeRegion = 'gba';
  compareRegionId = 'cuyo';
  showAllTechs = false;
  period = '1T 2026';
  territorialRegions: TerritorialRegion[] = [];
  techCatalog: Record<string, TechBadge> = {};
  ranges = [{days: 1, label: 'Últimas 24 horas'}, {days: 3, label: 'Últimos 3 días'}, {days: 7, label: 'Últimos 7 días'}, {days: 14, label: 'Últimos 14 días'}];

  provinceSignals: ProvinceSignal[] = [
    this.p('jujuy','Jujuy','JUJ','NOA',1,3,6,9,180,65,'176,50 205,54 218,79 204,101 181,94 167,77'),
    this.p('salta','Salta','SAL','NOA',2,5,11,17,153,82,'145,48 185,51 198,77 183,105 151,112 132,83'),
    this.p('formosa','Formosa','FOR','NEA',1,4,8,12,240,88,'215,66 285,69 296,94 277,118 228,112 207,91'),
    this.p('chaco','Chaco','CHA','NEA',2,5,12,18,224,124,'206,105 265,111 277,141 254,164 214,154 197,133'),
    this.p('misiones','Misiones','MIS','NEA',1,3,7,10,296,122,'288,104 312,106 319,139 307,169 294,164 286,136'),
    this.p('corrientes','Corrientes','COR','NEA',0,1,3,5,254,150,'238,138 280,142 291,166 274,190 246,182 234,161'),
    this.p('tucuman','Tucumán','TUC','NOA',1,3,7,11,184,116,'171,106 197,107 203,129 188,142 168,133'),
    this.p('catamarca','Catamarca','CAT','NOA',1,3,6,10,154,137,'139,121 174,126 182,154 166,179 138,166'),
    this.p('santiago','Santiago del Estero','SDE','NOA',1,4,9,14,205,158,'178,137 227,141 238,173 218,207 181,195 166,167'),
    this.p('la-rioja','La Rioja','LRJ','CUYO',1,3,7,11,143,184,'130,170 165,176 174,207 157,230 129,217'),
    this.p('cordoba','Córdoba','CBA','CENTRO',2,7,15,23,198,205,'171,189 218,191 244,219 231,259 197,269 174,238'),
    this.p('santa-fe','Santa Fe','SFE','CENTRO',2,7,16,25,249,190,'236,160 270,166 286,200 270,244 245,239 232,205'),
    this.p('entre-rios','Entre Ríos','ERI','CENTRO',2,6,13,20,286,201,'279,178 309,187 313,225 297,257 280,241 287,214'),
    this.p('san-juan','San Juan','SJU','CUYO',1,3,7,10,119,231,'108,212 137,214 148,243 134,267 109,257'),
    this.p('mendoza','Mendoza','MZA','CUYO',2,6,13,20,113,278,'93,253 131,261 142,300 123,327 92,311'),
    this.p('san-luis','San Luis','SLU','CUYO',1,4,8,13,157,279,'139,254 180,262 190,296 172,320 145,309'),
    this.p('la-pampa','La Pampa','LPA','CENTRO',1,4,9,14,176,327,'139,309 194,316 207,350 194,389 150,382 136,349'),
    this.p('buenos-aires','Buenos Aires','BUE','GBA',6,18,39,61,236,337,'196,298 250,305 290,327 302,360 289,407 261,438 220,430 195,394 204,355'),
    this.p('caba','Ciudad Autónoma de Buenos Aires','CABA','GBA',3,9,18,28,295,342,'289,330 305,331 309,348 296,358 286,347'),
    this.p('neuquen','Neuquén','NEU','PATAGONIA',1,4,9,14,120,362,'92,345 143,347 159,378 144,406 106,397 88,370'),
    this.p('rio-negro','Río Negro','RNE','PATAGONIA',1,5,11,17,154,393,'137,379 201,380 215,411 198,439 151,431 132,406'),
    this.p('chubut','Chubut','CHU','PATAGONIA',1,4,9,14,159,440,'133,426 201,431 207,469 187,493 143,482'),
    this.p('santa-cruz','Santa Cruz','SCZ','PATAGONIA',0,1,3,4,146,486,'126,475 186,483 190,512 161,531 129,515'),
    this.p('tierra-del-fuego','Tierra del Fuego','TDF','PATAGONIA',1,2,5,8,159,520,'139,520 176,521 188,535 169,546 143,541')
  ];
  departments: Record<string, string[]> = {
    'buenos-aires': ['La Matanza','General Pueyrredón','La Plata','Quilmes','Morón','San Isidro','Tigre','Pilar','General San Martín'],
    'caba': ['Comunas 1–15'],
    'cordoba': ['Capital','Río Cuarto','Colón','Punilla','San Justo'],
    'santa-fe': ['Rosario','La Capital','Castellanos','General López'],
    'mendoza': ['Capital','Godoy Cruz','Guaymallén','Maipú','Las Heras'],
    'tucuman': ['Capital','Yerba Buena','Tafí Viejo','Cruz Alta'],
    'neuquen': ['Confluencia','Zapala','Lácar'],
    'entre-rios': ['Paraná','Concordia','Uruguay'],
    'corrientes': ['Capital','Goya','Mercedes'],
    'santa-cruz': ['Río Gallegos','Caleta Olivia'],
  };

  constructor(private territory: TerritoryService) {}

  ngOnInit() {
    this.territory.load().then((data) => { this.territorialRegions = data.territorialRegions; this.techCatalog = data.techCatalog; });
    window.addEventListener('hookdevs:refresh', () => this.refreshTerritory());
  }

  private p(id:string,name:string,short:string,region:string,count24:number,count3:number,count7:number,count14:number,x:number,y:number,points:string): ProvinceSignal { return Object.assign({id,name,short,region,count24,count3,count7,count14,x,y,points}, {countFor:(days:number)=> days===1?count24:days===3?count3:days===7?count7:count14}); }
  get rangeLabel(){ return this.ranges.find(r=>r.days===this.daysAgo)?.label ?? 'Últimas 24 horas'; }
  get hoveredProvinceData(){ return this.provinceSignals.find(p=>p.id===this.hoveredProvince) ?? null; }
  get selectedProvinceData(){ return this.provinceSignals.find(p=>p.id===this.selectedProvince) ?? null; }
  get currentDepartments(){ return this.departments[this.selectedProvince] ?? []; }
  get localSampleCount(){ return JOB_FEEDS.flatMap(f=>f.jobs).filter(j=>{ const age=j.publishedDaysAgo ?? 999; return age<=this.daysAgo && (!this.selectedProvince || j.provinceId===this.selectedProvince) && (!this.selectedDepartment || j.department===this.selectedDepartment); }).length; }
  selectProvince(id:string){ this.selectedProvince=id; this.selectedDepartment=''; }
  tooltipX(p:ProvinceSignal){ return Math.min(72, Math.max(8, p.x / 4.1)); }
  tooltipY(p:ProvinceSignal){ return Math.min(76, Math.max(8, p.y / 6.1)); }
  goToSearch(){ document.getElementById('oportunidades')?.scrollIntoView({behavior:'smooth'}); }
  refreshTerritory(){ this.territory.load().then((data) => { this.territorialRegions = data.territorialRegions; this.techCatalog = data.techCatalog; }); }

  get activeRegionData(){ return this.territorialRegions.find(r=>r.id===this.activeRegion) ?? null; }
  get baseRegionData(){ return this.territorialRegions.find(r=>r.id==='gba') ?? null; }
  get compareRegionData(){ return this.territorialRegions.find(r=>r.id===this.compareRegionId) ?? null; }
  get comparableRegions(){ return this.territorialRegions.filter(r=>r.id!=='gba'); }
  setActiveRegion(id:string){ this.activeRegion=id; this.showAllTechs=false; }
  pct(v:number){ return v.toFixed(1).replace('.', ',') + '%'; }
  deltaLabel(a:number,b:number){ const d=a-b; return (d>=0?'↑ +':'↓ ')+Math.abs(d).toFixed(1).replace('.', ',')+' pp'; }
  evoDelta(r:TerritorialRegion){ const e=r.evolution; return e[e.length-1]-e[e.length-2]; }
  evoPoints(r:TerritorialRegion){ const e=r.evolution; const min=Math.min(...e)-1, max=Math.max(...e)+1; return e.map((v,i)=>{ const x=(i/(e.length-1))*300; const y=90-((v-min)/(max-min))*80-5; return `${x},${y}`; }).join(' '); }
  evoDots(r:TerritorialRegion){ const e=r.evolution; const min=Math.min(...e)-1, max=Math.max(...e)+1; return e.map((v,i)=>({x:(i/(e.length-1))*300, y:90-((v-min)/(max-min))*80-5})); }
  visibleTechs(r:TerritorialRegion){ return this.showAllTechs ? r.techs : r.techs.slice(0,6); }
  techMark(name:string){ return this.techCatalog[name]?.mark ?? name.slice(0,2).toUpperCase(); }
  techColor(name:string){ return this.techCatalog[name]?.color ?? '#1e3a50'; }
  techInk(name:string){ return this.techCatalog[name]?.ink ?? '#e4edf5'; }
  inRegion(p:ProvinceSignal, r:TerritorialRegion){ return r.provinces.includes(p.id); }
}
