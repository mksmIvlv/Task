import { Component, inject, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
  private http = inject(HttpClient);
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

    this.http.post<TextDto>(this.apiUrl, body).subscribe({
      next: (response) => {
        console.log('Ответ от сервера:', response.text);

        this.messages.pop();
        this.messages.push({
          text: response.text,
          type: 'incoming',
        });
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Произошла ошибка при отправке:', error);

        this.messages.pop();
        this.messages.push({
          text: 'Ошибка связи с сервером. Попробуйте позже.',
          type: 'incoming',
        });
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
    });
  }

  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }, 0);
    } catch (err) {}
  }
}
