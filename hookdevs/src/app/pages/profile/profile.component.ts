import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (session) {
      <div class="card">
        <div class="row between">
          <h2 style="margin:0">@{{ session.username }}</h2>
          <button class="btn danger" (click)="logout()">Salir</button>
        </div>
        <p class="muted">
          Esta cuenta es anónima y local a este navegador — no hay email ni
          datos personales asociados.
        </p>
      </div>

      <div class="card">
        <h3 style="margin-top:0">Mis marcadores</h3>
        <div class="row">
          <button class="btn" [class.secondary]="tab !== 'empleo'" (click)="tab = 'empleo'">
            Trabajos guardados
          </button>
        </div>

        @for (item of saved; track item.id) {
          <div class="card" style="margin-top:10px; background:#0b0e13">
            <div class="row between">
              <a [href]="item.url" target="_blank" rel="noreferrer"><b>{{ item.title }}</b></a>
              <button class="btn danger" (click)="borrar(item.id)">Borrar</button>
            </div>
            @if (item.description) {
              <p class="muted">{{ item.description }}</p>
            }
          </div>
        }
        @if (saved.length === 0) {
          <p class="muted" style="margin-top:10px">Todavía no guardaste nada.</p>
        }
      </div>
    }
  `,
})
export class ProfileComponent implements OnInit {
  session = this.auth.session();
  saved: any[] = [];
  tab: 'empleo' = 'empleo';

  constructor(
    private auth: AuthService,
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    if (!this.session) {
      this.router.navigate(['/login']);
      return;
    }
    await this.load();
  }

  async load() {
    if (!this.session) return;
    const { data } = await this.supabase.client
      .from('saved_items')
      .select('*')
      .eq('profile_id', this.session.id)
      .order('created_at', { ascending: false });
    this.saved = data || [];
  }

  async borrar(id: string) {
    await this.supabase.client.from('saved_items').delete().eq('id', id);
    await this.load();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
