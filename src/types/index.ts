import type { WorkspaceRole, NotificationType } from "@/types/domain";

export type WorkspaceWithRole = {
  id: string;
  name: string;
  logo?: string | null;
  description?: string | null;
  ownerId: string;
  role: WorkspaceRole;
  memberCount: number;
  createdAt: Date;
};

export type BoardSummary = {
  id: string;
  workspaceId: string;
  title: string;
  description?: string | null;
  visibility: "PRIVATE" | "WORKSPACE";
  coverColor?: string | null;
  createdById: string;
  createdAt: Date;
  cardCount?: number;
};

export type ListWithCards = {
  id: string;
  boardId: string;
  title: string;
  order: number;
  cards: CardSummary[];
};

export type CardSummary = {
  id: string;
  listId: string;
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  order: number;
  coverColor?: string | null;
  assignees: { id: string; name: string; avatar?: string | null }[];
  commentCount: number;
};

export type MemberSummary = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: WorkspaceRole;
  joinedAt: Date;
};

export type SocketNotificationPayload = {
  id: string;
  userId: string;
  workspaceId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
};
