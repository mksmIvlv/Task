import { Component, inject, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextDto } from '../core/dtos/TextDto';
import { MarkdownComponent } from 'ngx-markdown';
import { apiConfig } from '../config/api';

export interface Message {
  text: string;
  type: 'incoming' | 'outgoing';
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, MarkdownComponent],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  messageText: string = '';
  messages: Message[] = [];
  apiUrl: string = apiConfig.sendTextQuery;

  sendMessage() {
    if (!this.messageText.trim()) return;

    const userQuery = this.messageText;
    this.messages.push({
      text: userQuery,
      type: 'outgoing',
    });

    const body: TextDto = {
      text: userQuery,
    };

    this.messageText = '';

    this.messages.push({
      text: 'печатает...',
      type: 'incoming',
    });

    this.cdr.detectChanges();
    this.scrollToBottom();

    fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then(async (response) => {
        if (!response.body) {
          throw new Error('Поток данных не поддерживается');
        }

        this.messages.pop();

        // Добавить пустое сообщение
        const aiMessage = {
          text: '',
          type: 'incoming' as const,
        };
        this.messages.push(aiMessage);
        this.cdr.detectChanges();

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        // Читать поток
        while (true) {
          const { value, done } = await reader.read();
          if (done){
            break;
          }

          // Декодировать значения
          buffer += decoder.decode(value, { stream: true });

          // Разбиваем буфер по стандарту SSE
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              // Убираем префикс "data: "
              const jsonString = line.replace('data: ', '').trim();
              if (!jsonString) continue;

              try {
                const parsed = JSON.parse(jsonString);

                if (parsed.error) {
                  console.error('Ошибка от ИИ:', parsed.error);
                  aiMessage.text = 'Произошла ошибка при генерации текста.';
                } else if (parsed.text) {
                  // добавить кусочек текста в UI
                  aiMessage.text += parsed.text;
                  this.cdr.detectChanges();
                  this.scrollToBottom();
                }
              } catch (e) {
                console.error('Ошибка парсинга JSON строки:', line, e);
              }
            }
          }
        }
      })
      .catch((error) => {
        console.error('Произошла ошибка при отправке:', error);

        if (
          this.messages.length > 0 &&
          this.messages[this.messages.length - 1].text === 'печатает...'
        ) {
          this.messages.pop();
        }

        this.messages.push({
          text: 'Ошибка связи с сервером. Попробуйте позже.',
          type: 'incoming',
        });
        this.cdr.detectChanges();
        this.scrollToBottom();
      });
  }

  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.scrollContainer.nativeElement.scrollTop =
          this.scrollContainer.nativeElement.scrollHeight;
      }, 0);
    } catch (err) {}
  }
}
