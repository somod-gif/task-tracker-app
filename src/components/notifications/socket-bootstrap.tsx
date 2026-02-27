"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

import { getSocket } from "@/lib/socket/client";

export function SocketBootstrap() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    void getSocket(session.user.id);
  }, [session?.user?.id]);

  return null;
}
