import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import { BASE_URL } from "./system";
import { getAuthData } from "../localStorage/access-token-repository";

// O back autentica o STOMP no frame CONNECT (WebSocketAuthChannelInterceptor),
// então enviamos o Bearer nos connectHeaders. Endpoint é SockJS em /ws.
function createStompClient(): Client {
  return new Client({
    webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
    connectHeaders: { Authorization: "Bearer " + (getAuthData().access_token ?? "") },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });
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
