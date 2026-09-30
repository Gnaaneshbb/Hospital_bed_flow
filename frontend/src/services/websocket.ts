import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function createWebSocketClient(onMessageReceived: (data: any) => void) {
  const client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws/hospital'),
    debug: () => {
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  client.onConnect = () => {
    // console.log('[STOMP Connected]: Subscribing to /topic/hospital-state');
    client.subscribe('/topic/hospital-state', (message) => {
      if (message.body) {
        try {
          const data = JSON.parse(message.body);
          onMessageReceived(data);
        } catch (e) {
          console.error('WebSocket JSON parse error:', e);
        }
      }
    });
  };

  client.onStompError = (frame) => {
    console.warn('STOMP error:', frame.headers['message']);
  };

  return client;
}
