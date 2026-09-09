import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>💬 {{ otherName }}</h2>
    <div class="chat-window" #chatWindow>
      @for (m of messages; track m.id) {
        <div class="message" [class.mine]="m.sender_id === myId" [class.theirs]="m.sender_id !== myId">
          {{ m.content }}
        </div>
      }
    </div>
    <form (ngSubmit)="send()" class="row">
      <input placeholder="Escribí un mensaje..." [(ngModel)]="text" name="text" style="flex:1" />
      <button class="btn" type="submit">Enviar</button>
    </form>
  `,
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  @ViewChild('chatWindow') chatWindow?: ElementRef<HTMLDivElement>;

  conversationId = '';
  myId = '';
  otherName = 'Conversación';
  messages: any[] = [];
  text = '';
  private unsubscribe?: () => void;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private chat: ChatService
  ) {}

  async ngOnInit() {
    const session = this.auth.session();
    if (!session) {
      this.router.navigate(['/login']);
      return;
    }
    this.myId = session.id;
    this.conversationId = this.route.snapshot.paramMap.get('id') || '';

    this.otherName = await this.chat.otherMemberName(this.conversationId, this.myId);
    this.messages = await this.chat.loadMessages(this.conversationId);
    this.scrollDown();

    this.unsubscribe = this.chat.subscribeToMessages(this.conversationId, (msg) => {
      this.messages = [...this.messages, msg];
      this.scrollDown();
    });
  }

  ngOnDestroy() {
    this.unsubscribe?.();
  }

  async send() {
    if (!this.text.trim()) return;
    const content = this.text;
    this.text = '';
    await this.chat.sendMessage(this.conversationId, this.myId, content);
  }

  private scrollDown() {
    setTimeout(() => {
      const el = this.chatWindow?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}
