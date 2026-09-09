import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RegionStat { name: string; employment: number; unemployment: number; }
interface QuarterStat { label: string; employment: number; unemployment: number; }
interface MarketPayload {
  updatedAt: string;
  period: string;
  source: string;
  indicators: { activity: number; employment: number; unemployment: number; informality: number; occupiedDemand: number; };
  regions: RegionStat[];
  quarters: QuarterStat[];
}

@Component({
  selector: 'app-labor-market',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="story-shell" id="datos">
      <div class="story-intro">
        <div>
          <div class="section-kicker">CONTEXTO OFICIAL AMPLIADO</div>
          <h2>Primero, el contexto: ¿cómo está el trabajo en Argentina?</h2>
          <p class="lead muted">
            HookDevs parte de una fuente oficial y verificable. La EPH del INDEC permite mirar empleo,
            desempleo, presión sobre el mercado y diferencias territoriales sin inventar un índice de “saturación tecnológica”.
          </p>
        </div>
        <div class="data-status">
          <span class="source-chip">INDEC · EPH · {{ period }}</span>
          <button class="refresh-data" type="button" (click)="loadData()">↻ Actualizar</button>
        </div>
      </div>

      <div class="metric-grid">
        <article class="stat-card featured"><span>Tasa de empleo</span><strong>{{ indicators.employment.toFixed(1).replace('.', ',') }}%</strong><small>Personas ocupadas sobre la población total</small></article>
        <article class="stat-card"><span>Tasa de desocupación</span><strong>{{ indicators.unemployment.toFixed(1).replace('.', ',') }}%</strong><small>Sobre la población económicamente activa</small></article>
        <article class="stat-card"><span>Informalidad laboral</span><strong>{{ indicators.informality.toFixed(1).replace('.', ',') }}%</strong><small>Indicador de informalidad de la EPH</small></article>
        <article class="stat-card"><span>Ocupados demandantes</span><strong>{{ indicators.occupiedDemand.toFixed(1).replace('.', ',') }}%</strong><small>Ocupados que buscan otro empleo</small></article>
      </div>

      <div class="data-update-line">
        <span><i></i> Datos cargados desde un archivo de datos de HookDevs</span>
        <span>Fuente: {{ source }} · actualización {{ updatedAt | date:'dd/MM/yyyy' }}</span>
      </div>

      <div class="visual-grid">
        <article class="viz-card">
          <div class="viz-heading"><div><div class="section-kicker">TERRITORIO</div><h3>La situación cambia según la región</h3></div><span class="legend-pill">% de la población activa</span></div>
          <p class="muted compact">La desocupación va de 4,9% en el Noroeste a 8,7% en Gran Buenos Aires. No hay un único “mercado laboral argentino”.</p>
          <div class="region-chart">
            @for (r of regions; track r.name) {
              <div class="region-row"><div class="region-label">{{ r.name }}</div><div class="region-bars"><div class="bar-line employment" [style.width.%]="r.employment * 2"></div><div class="bar-line unemployment" [style.width.%]="r.unemployment * 10"></div></div><div class="region-values"><span>{{ r.employment.toFixed(1) }} empleo</span><span>{{ r.unemployment.toFixed(1) }} desempleo</span></div></div>
            }
          </div>
          <div class="chart-legend"><span><i class="legend-dot employment-dot"></i>Empleo</span><span><i class="legend-dot unemployment-dot"></i>Desocupación</span></div>
        </article>

        <article class="viz-card">
          <div class="viz-heading"><div><div class="section-kicker">EVOLUCIÓN</div><h3>El último año no fue lineal</h3></div></div>
          <p class="muted compact">Serie reciente publicada por INDEC para los 31 aglomerados urbanos.</p>
          <div class="trend-list">
            @for (q of quarters; track q.label) {
              <div class="trend-row"><span>{{ q.label }}</span><div class="trend-track"><div class="trend-employment" [style.width.%]="q.employment * 2"></div><div class="trend-unemployment" [style.width.%]="q.unemployment * 10"></div></div><b>{{ q.unemployment.toFixed(1) }}%</b></div>
            }
          </div>
          <div class="callout"><strong>Dato clave</strong><span>La desocupación fue 6,6% en el 3.º trimestre de 2025 y volvió a 7,8% en el 1.º trimestre de 2026.</span></div>
        </article>
      </div>

      <div class="method-card"><div><div class="section-kicker">QUÉ SÍ Y QUÉ NO DECIMOS</div><h3>Rigor antes que una cifra llamativa</h3></div><p class="muted">La EPH mide el mercado laboral general y no equivale a “demanda de programadores”. Por eso HookDevs separa dos señales: <b>estadística oficial</b> para describir el contexto laboral y <b>portales de empleo</b> para explorar oportunidades concretas.</p></div>
    </section>
  `,
})
export class LaborMarketComponent implements OnInit, OnDestroy {
  period = '1T 2026';
  source = 'INDEC · EPH';
  updatedAt = new Date('2026-06-22T00:00:00-03:00');
  indicators = { activity: 48.6, employment: 44.8, unemployment: 7.8, informality: 44.2, occupiedDemand: 15.8 };
  regions: RegionStat[] = [];
  quarters: QuarterStat[] = [];
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.loadData();
    this.timer = setInterval(() => this.loadData(), 15 * 60 * 1000);
  }

  ngOnDestroy() { if (this.timer) clearInterval(this.timer); }

  async loadData() {
    try {
      const response = await fetch(`assets/data/market-data.json?ts=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('No se pudo cargar market-data.json');
      const data = await response.json() as MarketPayload;
      this.period = data.period;
      this.source = data.source;
      this.updatedAt = new Date(data.updatedAt);
      this.indicators = data.indicators;
      this.regions = data.regions;
      this.quarters = data.quarters;
    } catch {
      // Keep the last known official snapshot if the network/server is unavailable.
    }
  }
}
