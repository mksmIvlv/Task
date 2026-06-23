import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  signal,
  ChangeDetectionStrategy,
  effect
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextDto } from '../core/dtos/TextDto';
import { MarkdownComponent } from 'ngx-markdown';
import { ChatService } from '../core/services/chat.service';
import { Message } from '../core/models/message';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, MarkdownComponent],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class Chat {
  private chatService = inject(ChatService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  messageText = '';
  messages = signal<Message[]>([]);
  isTyping = signal(false);

  constructor() {
    effect(() => {
      if (this.messages().length) {
        this.scrollToBottom();
      }
    });
  }

  sendMessage() {
    const text = this.messageText.trim();
    if (!text || !this.chatService.isConnected()) return;

    this.messages.update(prev => [...prev, { text, type: 'outgoing' }]);
    this.messageText = '';
    this.isTyping.set(true);

    const body: TextDto = { text };
    let assistantMessage: Message | null = null;

    this.chatService.streamTextQuery(body).subscribe({
      next: (parsed) => {
        if (this.isTyping()) {
          this.isTyping.set(false);
          assistantMessage = { text: '', type: 'incoming' };
          this.messages.update(prev => [...prev, assistantMessage!]);
        }

        if (parsed.error) {
          this.handleError('Ошибка при ответе бэкенда.');
        } else if (parsed.text && assistantMessage) {
          assistantMessage.text += parsed.text;
          this.messages.update(prev => [...prev]);
        }
      },
      error: () => {
        this.isTyping.set(false);
        this.handleError('Ошибка соединения.');
      },
      complete: () => {
        this.isTyping.set(false);
      }
    });
  }

  private handleError(text: string) {
    this.messages.update(prev => [...prev, { text, type: 'incoming' }]);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        const el = this.scrollContainer.nativeElement;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    }, 50);
  }
}
