import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "@/types/socket";
import { Server as IOServer } from "socket.io";

import { setIO } from "@/lib/socket/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(_req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socket_io",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      socket.on("user:join", (userId: string) => {
        socket.join(`user:${userId}`);
      });
    });

    res.socket.server.io = io;
    setIO(io);
  }

  res.end();
}
