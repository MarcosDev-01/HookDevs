import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="chat-sidebar">
      <h3>Mensajes</h3>

      @if (!auth.session()) {
        <p class="muted">
          Creá un apodo o ingresá para escribirle a la comunidad.
        </p>
      } @else {
        <input
          placeholder="Buscar por apodo..."
          [(ngModel)]="search"
          (ngModelChange)="onSearch($event)"
        />

        @if (results.length > 0) {
          @for (p of results; track p.id) {
            <div class="chat-item" (click)="open(p.id)">🟢 {{ p.username }}</div>
          }
        } @else {
          <p class="muted">Tus conversaciones</p>
          @for (c of conversations; track c.id) {
            <a [routerLink]="['/chat', c.id]">
              <div class="chat-item">💬 {{ c.otherName }}</div>
            </a>
          }
          @if (conversations.length === 0) {
            <p class="muted">Buscá a alguien arriba para arrancar.</p>
          }
        }
      }
    </div>
  `,
})
export class ChatSidebarComponent implements OnInit {
  search = '';
  results: any[] = [];
  conversations: any[] = [];

  constructor(
    public auth: AuthService,
    private chat: ChatService,
    private router: Router
  ) {}

  async ngOnInit() {
    if (this.auth.session()) {
      await this.loadConversations();
    }
  }

  async loadConversations() {
    const session = this.auth.session();
    if (!session) return;
    this.conversations = await this.chat.myConversations(session.id);
  }

  async onSearch(value: string) {
    const session = this.auth.session();
    if (!session) return;
    if (!value.trim()) {
      this.results = [];
      return;
    }
    this.results = await this.chat.searchProfiles(value, session.id);
  }

  async open(otherId: string) {
    const session = this.auth.session();
    if (!session) return;
    const convoId = await this.chat.startConversation(session.id, otherId);
    this.search = '';
    this.results = [];
    if (convoId) this.router.navigate(['/chat', convoId]);
  }
}
