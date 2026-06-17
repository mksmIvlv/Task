import { Component } from '@angular/core';
import { Footer } from './footer/footer';
import { Chat } from './chat/chat';

@Component({
  selector: 'app-root',
  imports: [
    Chat,
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
