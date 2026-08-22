import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import { BASE_URL } from "./system";
import { ensureFreshToken } from "./requests";

// O back autentica o STOMP no frame CONNECT (WebSocketAuthChannelInterceptor),
// então enviamos o Bearer nos connectHeaders. Endpoint é SockJS em /ws.
function createStompClient(): Client {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });

  // Resolvido a cada tentativa de CONNECT, não uma vez na criação: num reconnect
  // depois dos 15 min o token anterior já expirou e o back recusa o frame.
  client.beforeConnect = async () => {
    const token = await ensureFreshToken();
    client.connectHeaders = { Authorization: "Bearer " + token };
  };

  return client;
}

/**
 * Assina um tópico STOMP e chama onMessage a cada evento. Retorna um dispose()
 * para encerrar a conexão (usar no cleanup do useEffect).
 */
export function subscribeTopic<T = unknown>(
  destination: string,
  onMessage: (payload: T) => void,
): () => void {
  const client = createStompClient();

  client.onConnect = () => {
    client.subscribe(destination, (message) => {
      try {
        onMessage(JSON.parse(message.body) as T);
      } catch {
        // frame não-JSON: ignora
      }
    });
  };

  client.activate();

  return () => {
    void client.deactivate();
  };
}

/**
 * Assina um tópico STOMP PRIVADO e chama onMessage a cada evento.
 * O Spring Security (via Principal UUID) intercepta e roteia a fila /user/{uuid}/...
 */
export function subscribeUser<T = unknown>(
  destination: string,
  onMessage: (payload: T) => void,
): () => void {
  const client = createStompClient();

  client.onConnect = () => {
    client.subscribe(`/user${destination}`, (message) => {
      try {
        onMessage(JSON.parse(message.body) as T);
      } catch {
        // frame não-JSON: ignora
      }
    });
  };

  client.activate();

  return () => {
    void client.deactivate();
  };
}