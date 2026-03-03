export type DashboardMetric = {
  title: string;
  value: number;
  subtitle?: string;
};

export type SocketNotificationPayload = {
  id: string;
  userId: string;
  companyId?: string | null;
  type: "TASK_ASSIGNED" | "TASK_UPDATED" | "TASK_OVERDUE" | "SPRINT_ASSIGNED" | "COMPANY_APPROVED" | "SYSTEM";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};
