import { Injectable, OnDestroy, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { apiConfig } from '../../config/api';
import { TextDto } from '../dtos/TextDto'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  private hubUrl: string = apiConfig.signalrHubUrl;
  private hubConnection!: signalR.HubConnection;

  public isConnected = signal(false);

  constructor() {
    this.initSignalR();
  }

  private initSignalR() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR подключен');
        this.isConnected.set(true);
      })
      .catch((err) => {
        console.error('SignalR не подключен:', err);
        this.isConnected.set(false);
      });

    this.hubConnection.onreconnecting(() => this.isConnected.set(false));
    this.hubConnection.onreconnected(() => this.isConnected.set(true));
    this.hubConnection.onclose(() => this.isConnected.set(false));
  }

  public streamTextQuery(body: TextDto): Observable<any> {
    return new Observable((observer) => {
      const stream = this.hubConnection.stream<any>('SendTextQueryAsync', body);

      const subscription = stream.subscribe({
        next: (data) => observer.next(data),
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      });

      return () => subscription.dispose();
    });
  }

  ngOnDestroy() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}
