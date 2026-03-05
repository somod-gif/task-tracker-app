"use client";

import { CalendarDays, MessageSquare, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CardData = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  coverColor: string | null;
  assignments: { user: { id: string; name: string; avatar: string | null } }[];
  _count: { comments: number };
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  HIGH: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

type Props = {
  card: CardData;
  isDragging?: boolean;
  onClick?: () => void;
};

export function CardItem({ card, isDragging, onClick }: Props) {
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <div
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-lg border border-border/60 bg-card p-3 shadow-sm transition-all",
        "hover:shadow-md hover:border-border",
        isDragging && "shadow-xl ring-2 ring-primary/30 rotate-1 scale-105"
      )}
    >
      {/* Cover color */}
      {card.coverColor && (
        <div
          className="mb-2 h-2 rounded-full"
          style={{ backgroundColor: card.coverColor }}
        />
      )}

      {/* Priority badge */}
      {card.priority !== "MEDIUM" && (
        <div className="mb-1.5">
          <span
            className={cn(
              "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              PRIORITY_COLORS[card.priority]
            )}
          >
            {card.priority}
          </span>
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-3">
        {card.title}
      </p>

      {/* Footer */}
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {card.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 rounded text-[11px]",
                isOverdue ? "text-red-600" : "text-muted-foreground"
              )}
            >
              <CalendarDays className="h-3 w-3" />
              {new Date(card.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          )}
          {card._count.comments > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              {card._count.comments}
            </span>
          )}
        </div>

        {/* Assignees */}
        {card.assignments.length > 0 && (
          <div className="flex -space-x-1.5">
            {card.assignments.slice(0, 3).map((a) => (
              <div
                key={a.user.id}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-card"
                title={a.user.name}
              >
                {a.user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.user.avatar}
                    alt={a.user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  a.user.name.charAt(0).toUpperCase()
                )}
              </div>
            ))}
            {card.assignments.length > 3 && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground ring-2 ring-card">
                +{card.assignments.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
