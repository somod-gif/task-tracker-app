"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export async function getSocket(userId: string) {
  if (socket) {
    return socket;
  }

  await fetch("/api/socket");
  socket = io({ path: "/api/socket_io" });

  socket.on("connect", () => {
    socket?.emit("user:join", userId);
  });

  return socket;
}
