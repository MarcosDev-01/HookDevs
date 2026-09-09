import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="card" style="max-width:420px; margin:20px auto;">
      <h2>Crear apodo</h2>
      <p class="muted">
        No pedimos email ni datos personales: elegí un apodo y una
        contraseña. Se guardan en este navegador, así que si cambiás de
        dispositivo vas a tener que crear el apodo de nuevo ahí.
      </p>
      <form (ngSubmit)="submit()">
        <input placeholder="Apodo (sin datos reales)" [(ngModel)]="username" name="username" required />
        <input placeholder="Contraseña" type="password" [(ngModel)]="password" name="password" required />
        @if (error) {
          <p class="error-text">{{ error }}</p>
        }
        <button class="btn" type="submit" [disabled]="loading" style="width:100%">
          {{ loading ? 'Creando...' : 'Crear apodo' }}
        </button>
      </form>
      <p class="muted" style="margin-top:12px">
        ¿Ya tenés uno en este navegador? <a routerLink="/login">Ingresá</a>.
      </p>
    </div>
  `,
})
export class RegisterComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    this.error = '';
    this.loading = true;
    const err = await this.auth.register(this.username, this.password);
    this.loading = false;
    if (err) {
      this.error = err;
      return;
    }
    this.router.navigate(['/profile']);
  }
}
