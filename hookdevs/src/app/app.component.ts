import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ChatSidebarComponent } from './components/chat-sidebar/chat-sidebar.component';

@Component({
  selector: 'app-root', standalone: true, imports: [RouterOutlet, RouterLink, CommonModule, ChatSidebarComponent],
  template: `
    <header class="topbar">
      <a routerLink="/" class="brand" aria-label="HookDevs inicio"><img src="assets/hookdevs-logo.png" alt="HookDevs" /></a>
      <nav class="main-nav" aria-label="Navegación principal">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">⌂ <span>Inicio</span></a>
        <a href="/#datos">▤ <span>Datos</span></a>
        <a href="/#regiones">◉ <span>Regiones</span></a>
        <a href="/#oportunidades">⌕ <span>Oportunidades</span></a>
        <a routerLink="/profile">♙ <span>Mi perfil</span></a>
      </nav>
      <div class="top-actions">
        <span class="update-pill"><i></i><b>Datos actualizados</b><small>Hace {{ minutesSinceUpdate }} min</small></span>
        <button class="icon-btn" type="button" (click)="refresh()" title="Actualizar datos" aria-label="Actualizar datos">↻</button>
        @if (auth.session(); as session) { <span class="user-pill">&#64;{{ session.username }}</span><button class="icon-btn" type="button" (click)="logout()" title="Salir">↪</button> } @else { <a routerLink="/login" class="icon-btn" title="Ingresar">♙</a> }
        <button class="icon-btn" type="button" title="Preferencias" aria-label="Preferencias">⚙</button>
      </div>
    </header>
    <div class="layout"><app-chat-sidebar></app-chat-sidebar><main class="main"><router-outlet></router-outlet></main></div>
    <footer class="site-footer">
      <div class="footer-top">
        <div class="footer-brand"><img src="assets/hookdevs-logo.png" alt="HookDevs" /><span>Datos que conectan con tu futuro</span></div>
        <nav class="footer-links" aria-label="Enlaces del sitio">
          <a href="/#datos">Fuentes</a>
          <a routerLink="/profile">Privacidad</a>
          <a href="mailto:hola&#64;hookdevs.ar">Contacto</a>
        </nav>
        <div class="footer-social" aria-hidden="true"><span>in</span><span>gh</span><span>x</span></div>
      </div>
      <p class="footer-fine">HookDevs combina estadística oficial (INDEC · EPH) con señales de búsquedas de portales de empleo. Los indicadores oficiales describen el contexto laboral; las oportunidades deben verificarse en la fuente original. Proyecto presentado en el concurso nacional de visualización de datos “Contar con Datos” 2026.</p>
    </footer>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  lastUpdated = new Date();
  private tick?: ReturnType<typeof setInterval>;
  constructor(public auth: AuthService) {}
  ngOnInit() { this.tick = setInterval(() => {}, 30000); }
  ngOnDestroy() { if (this.tick) clearInterval(this.tick); }
  get minutesSinceUpdate() { return Math.max(0, Math.floor((Date.now() - this.lastUpdated.getTime()) / 60000)); }
  refresh() { this.lastUpdated = new Date(); window.dispatchEvent(new CustomEvent('hookdevs:refresh')); }
  logout() { this.auth.logout(); window.location.href = '/'; }
}
