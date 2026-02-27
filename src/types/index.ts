export type DashboardMetric = {
  title: string;
  value: number;
  subtitle?: string;
};

export type SocketNotificationPayload = {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
};
