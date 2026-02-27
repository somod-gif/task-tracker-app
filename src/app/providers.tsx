"use client";

import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { SocketBootstrap } from "@/components/notifications/socket-bootstrap";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SocketBootstrap />
      {children}
      <ToastContainer position="top-right" autoClose={3000} />
    </SessionProvider>
  );
}
