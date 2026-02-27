"use client";

import { toast, type ToastOptions } from "react-toastify";

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  pauseOnHover: true,
  theme: "colored",
};

export const appToast = {
  success: (message: string, options?: ToastOptions) => toast.success(message, { ...defaultOptions, ...options }),
  error: (message: string, options?: ToastOptions) => toast.error(message, { ...defaultOptions, ...options }),
  info: (message: string, options?: ToastOptions) => toast.info(message, { ...defaultOptions, ...options }),
};
