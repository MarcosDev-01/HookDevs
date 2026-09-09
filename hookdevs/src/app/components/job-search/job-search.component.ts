import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { buildJobLinks, JobSiteLink } from '../../lib/job-sites';
import { JOB_FEEDS, JobPreview, PortalFeed } from '../../lib/job-feed';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-job-search', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <section class="opportunities-shell" id="oportunidades">
      <div class="section-kicker">04 · OPORTUNIDADES</div>
      <div class="opportunities-heading"><div><h2>Ahora sí: buscá oportunidades concretas</h2><p class="muted lead">Las consultas se adaptan a rol, provincia, partido/departamento y antigüedad. Cada portal mantiene sus propios resultados.</p></div><span class="live-badge"><i></i>Sin scraping</span></div>

      <div class="search-panel">
        <form (ngSubmit)="buscar()" class="search-form search-form-wide">
          <label>Rol o tecnología<input placeholder="Ej.: React, Python, data analyst" [(ngModel)]="keyword" name="keyword" /></label>
          <label>Región<select [(ngModel)]="regionId" name="region" (ngModelChange)="onRegionChange()"><option value="">Todas</option>@for (r of regions; track r.id) {<option [value]="r.id">{{ r.name }}</option>}</select></label>
          <label>Provincia<select [(ngModel)]="provinceId" name="province" (ngModelChange)="onProvinceChange()"><option value="">Toda Argentina</option>@for (p of provincesInRegion(); track p.id) {<option [value]="p.id">{{ p.name }}</option>}</select></label>
          <label>Partido / departamento<select [(ngModel)]="department" name="department" [disabled]="!provinceId"><option value="">Todos</option>@for (d of currentDepartments; track d) {<option [value]="d">{{ d }}</option>}</select></label>
          <label>Fecha<select [(ngModel)]="daysAgo" name="days"><option [ngValue]="1">Últimas 24 horas</option><option [ngValue]="3">Últimos 3 días</option><option [ngValue]="7">Últimos 7 días</option><option [ngValue]="14">Últimos 14 días</option></select></label>
          <button class="btn search-button" type="submit">Actualizar búsqueda</button>
        </form>
        <div class="jobs-meta"><span>{{ selectedLocationLabel }} · {{ dateLabel }}</span><span>Las ofertas se verifican en cada portal</span></div>

        @if (noLocalResults) {
          <div class="no-results-card"><div class="no-results-orb"><i></i>⌁</div><div><span class="section-kicker">RADAR SIN SEÑAL</span><h3>No se encontraron ofertas en esta zona según la última fecha disponible</h3><p>Para <b>{{ selectedLocationLabel }}</b> no hay una oferta de la muestra local dentro de {{ dateLabel.toLowerCase() }}. En vez de inventar resultados, HookDevs te lo dice tal cual: podés ampliar el radio geográfico, el período, o abrir la búsqueda directa en los portales.</p></div><button class="btn secondary" type="button" (click)="expandToProvince()">Ampliar a provincia →</button></div>
        }

        @for (feed of feeds; track feed.name; let i = $index) {
          <section class="portal-shelf"><div class="shelf-heading"><div><div class="portal-name-row"><span class="portal-mark">{{ initials(feed.name) }}</span><div><h3>{{ feed.name }}</h3><span class="portal-kind">{{ feed.kind === 'especializado' ? 'IT / TECH' : 'PORTAL' }}</span></div></div><p class="muted">{{ feed.note }}</p></div><div class="shelf-actions"><button class="carousel-btn" type="button" (click)="scrollShelf(i,-1)" aria-label="Ver anteriores">←</button><button class="carousel-btn" type="button" (click)="scrollShelf(i,1)" aria-label="Ver siguientes">→</button><a class="btn secondary small-btn" [href]="portalSearchUrl(feed)" target="_blank" rel="noopener noreferrer">Abrir búsqueda ↗</a></div></div>
            <div class="job-carousel" [id]="'shelf-' + i">
              @for (job of visibleJobs(feed); track job.title + job.company) {
                <article class="job-preview-card" [class.empty-card]="job.isSearchPreview">
                  @if (job.isSearchPreview) {
                    <div class="empty-card-icon">⌕</div><span class="job-type">Búsqueda externa</span><h4>{{ job.title }}</h4><p class="job-company">{{ job.company }}</p><p class="job-location">⌖ {{ job.location }}</p><p class="empty-copy">La disponibilidad puede cambiar. Abrí el portal para ver el último resultado.</p>
                  } @else {
                    <div class="job-card-brand-row"><span class="job-company-mark">{{ initials(job.company) }}</span><div><span class="job-source">{{ feed.name }}</span><small>{{ job.age }}</small></div><button type="button" class="bookmark" (click)="guardarJob(feed,job)" aria-label="Guardar empleo">♡</button></div>
                    <div class="job-card-body"><span class="job-type">{{ job.mode || 'Empleo' }}</span><h4>{{ job.title }}</h4><p class="job-company">{{ job.company }}</p><p class="job-location">⌖ {{ job.location }}</p><div class="job-tech-tags">@for (tag of (job.techs || []).slice(0,4); track tag) {<span>{{ tag }}</span>}</div></div>
                  }
                  <div class="job-card-footer"><span class="job-region-label">{{ job.provinceId ? provinceName(job.provinceId) : 'Argentina' }}</span><a class="job-open" [href]="job.url" target="_blank" rel="noopener noreferrer">{{ job.isSearchPreview ? 'Ver resultados' : 'Ver oferta' }} ↗</a></div>
                </article>
              }
            </div>
          </section>
        }
      </div>
      <div class="opportunity-note"><strong>Cómo leerlo</strong><span>Las tarjetas no reemplazan al portal original. HookDevs conserva el contexto territorial elegido, construye la consulta y te lleva a la fuente para verificar la oferta.</span></div>
    </section>
  `,
})
export class JobSearchComponent implements OnInit, OnDestroy {
  keyword = 'desarrollador'; daysAgo = 1; regionId = ''; provinceId = ''; department = ''; links: JobSiteLink[] = []; feeds = JOB_FEEDS; lastUpdated = new Date(); private refreshTimer?: ReturnType<typeof setInterval>;
  regions = [
    {id:'gba',name:'Gran Buenos Aires (GBA)',provinces:['caba','buenos-aires']},
    {id:'centro',name:'Centro',provinces:['cordoba','santa-fe','entre-rios','la-pampa']},
    {id:'cuyo',name:'Cuyo',provinces:['mendoza','san-juan','san-luis','la-rioja']},
    {id:'noa',name:'Noroeste (NOA)',provinces:['jujuy','salta','tucuman','catamarca','santiago']},
    {id:'nea',name:'Noreste (NEA)',provinces:['formosa','chaco','misiones','corrientes']},
    {id:'patagonia',name:'Patagonia',provinces:['neuquen','rio-negro','chubut','santa-cruz','tierra-del-fuego']},
  ];
  provinces = [
    {id:'buenos-aires',name:'Buenos Aires'},{id:'caba',name:'Ciudad Autónoma de Buenos Aires'},{id:'catamarca',name:'Catamarca'},{id:'chaco',name:'Chaco'},{id:'chubut',name:'Chubut'},{id:'cordoba',name:'Córdoba'},{id:'corrientes',name:'Corrientes'},{id:'entre-rios',name:'Entre Ríos'},{id:'formosa',name:'Formosa'},{id:'jujuy',name:'Jujuy'},{id:'la-pampa',name:'La Pampa'},{id:'la-rioja',name:'La Rioja'},{id:'mendoza',name:'Mendoza'},{id:'misiones',name:'Misiones'},{id:'neuquen',name:'Neuquén'},{id:'rio-negro',name:'Río Negro'},{id:'salta',name:'Salta'},{id:'san-juan',name:'San Juan'},{id:'san-luis',name:'San Luis'},{id:'santa-cruz',name:'Santa Cruz'},{id:'santa-fe',name:'Santa Fe'},{id:'santiago',name:'Santiago del Estero'},{id:'tierra-del-fuego',name:'Tierra del Fuego'},{id:'tucuman',name:'Tucumán'}
  ];
  departments: Record<string,string[]> = {'buenos-aires':['La Matanza','General Pueyrredón','La Plata','Quilmes','Morón','San Isidro','Tigre','Pilar','General San Martín'],'caba':['Comunas 1–15'],'cordoba':['Capital','Río Cuarto','Colón','Punilla','San Justo'],'santa-fe':['Rosario','La Capital','Castellanos','General López'],'mendoza':['Capital','Godoy Cruz','Guaymallén','Maipú','Las Heras'],'tucuman':['Capital','Yerba Buena','Tafí Viejo','Cruz Alta'],'neuquen':['Confluencia','Zapala','Lácar'],'entre-rios':['Paraná','Concordia','Uruguay']};
  get currentDepartments(){ return this.departments[this.provinceId] ?? []; }
  get selectedLocationLabel(){ const p=this.provinces.find(x=>x.id===this.provinceId)?.name; const r=this.regions.find(x=>x.id===this.regionId)?.name; return this.department && p ? `${this.department}, ${p}` : p || r || 'Toda Argentina'; }
  get dateLabel(){ return this.daysAgo===1?'últimas 24 horas':`últimos ${this.daysAgo} días`; }
  get noLocalResults(){ return (!!this.provinceId || !!this.regionId) && this.filteredSampleJobs().length===0; }
  constructor(private supabase:SupabaseService, private auth:AuthService) {}
  ngOnInit(){ this.buscar(); this.refreshTimer=setInterval(()=>this.refreshPreview(),15*60*1000); }
  ngOnDestroy(){ if(this.refreshTimer) clearInterval(this.refreshTimer); }
  onRegionChange(){ this.provinceId=''; this.department=''; }
  onProvinceChange(){ this.department=''; }
  provincesInRegion(){ if(!this.regionId) return this.provinces; const region=this.regions.find(r=>r.id===this.regionId); return this.provinces.filter(p=>region?.provinces.includes(p.id)); }
  private matchesLocation(job:JobPreview){ if(this.provinceId) return job.provinceId===this.provinceId; if(this.regionId){ const region=this.regions.find(r=>r.id===this.regionId); return !!job.provinceId && !!region?.provinces.includes(job.provinceId); } return true; }
  buscar(){ this.links=buildJobLinks({keyword:this.keyword,province:this.provinceId,department:this.department,daysAgo:this.daysAgo}); this.refreshPreview(); }
  private refreshPreview(){ this.lastUpdated=new Date(); }
  filteredSampleJobs(){ return this.feeds.flatMap(f=>f.jobs).filter(j=>{ const age=j.publishedDaysAgo ?? 999; return age<=this.daysAgo && this.matchesLocation(j) && (!this.department || j.department===this.department) && this.techMatches(j); }); }
  private techMatches(job:JobPreview){ if(!this.keyword.trim()) return true; const q=this.keyword.toLowerCase(); return `${job.title} ${job.company} ${(job.techs||[]).join(' ')}`.toLowerCase().includes(q); }
  visibleJobs(feed:PortalFeed):JobPreview[]{ const matched=feed.jobs.filter(j=>{ const age=j.publishedDaysAgo ?? 999; return age<=this.daysAgo && this.matchesLocation(j) && (!this.department || j.department===this.department) && this.techMatches(j); }); if(matched.length) return matched; return [{title:`Sin coincidencias en ${this.selectedLocationLabel}`,company:`Resultados de ${feed.name}`,location:this.selectedLocationLabel,mode:'Búsqueda externa',age:'Ahora',url:this.portalSearchUrl(feed),techs:[this.keyword||'empleo'],isSearchPreview:true}]; }
  portalSearchUrl(feed:PortalFeed){ const q=encodeURIComponent(this.keyword.trim()||'empleo'); const loc=encodeURIComponent(this.selectedLocationLabel==='Toda Argentina'?'Argentina':this.selectedLocationLabel); switch(feed.name){ case 'Indeed': return `https://ar.indeed.com/jobs?q=${q}&l=${loc}&fromage=${this.daysAgo}`; case 'LinkedIn': return `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${loc}&f_TPR=r${this.daysAgo*86400}`; case 'Computrabajo': return `https://ar.computrabajo.com/trabajo-de-${encodeURIComponent((this.keyword||'empleo').toLowerCase().replace(/\s+/g,'-'))}`; case 'Get on Board': return `https://www.getonbrd.com.ar/?query=${q}`; case 'EducaciónIT Empleos': return `https://empleos.educacionit.com/?s=${q}`; default: return feed.searchUrl; } }
  expandToProvince(){ this.department=''; }
  provinceName(id:string){ return this.provinces.find(p=>p.id===id)?.name ?? id; }
  scrollShelf(index:number,direction:number){ document.getElementById('shelf-'+index)?.scrollBy({left:direction*360,behavior:'smooth'}); }
  initials(name:string){ return name.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase(); }
  async guardarJob(feed:PortalFeed,job:JobPreview){ const session=this.auth.session(); if(!session){alert('Creá un apodo o ingresá para guardar empleos.');return;} await this.supabase.client.from('saved_items').insert({profile_id:session.id,tipo:'empleo',title:`${job.title} — ${feed.name}`,url:job.url,description:`${job.company} · ${job.location}`,meta:{fuente:feed.name,keyword:this.keyword,province:this.provinceId,department:this.department,daysAgo:this.daysAgo}}); alert('Empleo guardado en tu perfil ✅'); }
}
