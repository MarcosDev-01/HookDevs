import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="card" style="max-width:420px; margin:20px auto;">
      <h2>Ingresar</h2>
      <p class="muted">
        Esta sesión es local: solo funciona en este mismo navegador donde
        creaste el apodo.
      </p>
      <form (ngSubmit)="submit()">
        <input placeholder="Apodo" [(ngModel)]="username" name="username" required />
        <input placeholder="Contraseña" type="password" [(ngModel)]="password" name="password" required />
        @if (error) {
          <p class="error-text">{{ error }}</p>
        }
        <button class="btn" type="submit" [disabled]="loading" style="width:100%">
          {{ loading ? 'Entrando...' : 'Ingresar' }}
        </button>
      </form>
      <p class="muted" style="margin-top:12px">
        ¿No tenés apodo todavía? <a routerLink="/register">Creá uno</a>.
      </p>
    </div>
  `,
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    this.error = '';
    this.loading = true;
    const err = await this.auth.login(this.username, this.password);
    this.loading = false;
    if (err) {
      this.error = err;
      return;
    }
    this.router.navigate(['/profile']);
  }
}
