import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

type EventCallback = (data: unknown) => void;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, EventCallback[]>>(new Map());

  useEffect(() => {
    // Conectar ao servidor WebSocket
    const socket = io({
      path: "/api/socket.io",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[WebSocket] Conectado:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket] Desconectado");
    });

    socket.on("connect_error", (error) => {
      console.error("[WebSocket] Erro de conexão:", error);
    });

    // Registrar listeners existentes
    listenersRef.current.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        socket.on(event, callback);
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("join-calendar", room);
    }
  }, []);

  const leaveRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("leave-calendar", room);
    }
  }, []);

  const on = useCallback((event: string, callback: EventCallback) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, []);
    }
    listenersRef.current.get(event)?.push(callback);

    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }

    return () => {
      const callbacks = listenersRef.current.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
      socketRef.current?.off(event, callback);
    };
  }, []);

  const emit = useCallback((event: string, data: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return {
    socket: socketRef.current,
    joinRoom,
    leaveRoom,
    on,
    emit,
    isConnected: socketRef.current?.connected ?? false,
  };
}
