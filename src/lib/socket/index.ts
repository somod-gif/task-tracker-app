import { Server as IOServer } from "socket.io";
import type { SocketNotificationPayload } from "@/types";

declare global {
  // eslint-disable-next-line no-var
  var ioServer: IOServer | undefined;
}

export function setIO(io: IOServer) {
  global.ioServer = io;
}

export function getIO() {
  return global.ioServer;
}

export function emitNotificationToUser(userId: string, payload: SocketNotificationPayload) {
  global.ioServer?.to(`user:${userId}`).emit("notification:new", payload);
}

/** Convenience alias used in server actions */
export async function emitNotification(userId: string, payload: SocketNotificationPayload) {
  emitNotificationToUser(userId, payload);
}
