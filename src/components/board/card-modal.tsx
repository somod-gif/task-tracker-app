"use client";

import { useEffect, useState, useTransition } from "react";
import { X, Calendar, Flag, Loader2, Trash2, UserPlus, UserMinus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  getCardDetailAction,
  updateCardAction,
  deleteCardAction,
  assignMemberToCardAction,
  unassignMemberFromCardAction,
  addCardCommentAction,
} from "@/server/actions/card-actions";
import { appToast } from "@/lib/toast";

type Member = { id: string; name: string; email: string; avatar: string | null; role: string };

type Comment = { id: string; content: string; createdAt: Date; user: { id: string; name: string; avatar: string | null } };

type CardDetail = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  coverColor: string | null;
  createdAt: Date;
  list: { title: string };
  assignments: { user: { id: string; name: string; email: string; avatar: string | null } }[];
  comments: Comment[];
  activityLogs: { id: string; message: string; createdAt: Date; user: { name: string } }[];
};

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-amber-100 text-amber-700",
  URGENT: "bg-red-100 text-red-700",
};

type Props = {
  cardId: string;
  workspaceId: string;
  workspaceMembers: Member[];
  currentUserId: string;
  canManage: boolean;
  onClose: () => void;
  onCardDeleted?: () => void;
};

export function CardModal({ cardId, workspaceId, workspaceMembers, currentUserId, canManage, onClose, onCardDeleted }: Props) {
  const [card, setCard] = useState<CardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<string>("MEDIUM");
  const [comment, setComment] = useState("");
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId]);

  async function load() {
    setLoading(true);
    try {
      const d = await getCardDetailAction(workspaceId, cardId) as unknown as CardDetail;
      setCard(d);
      setTitle(d.title);
      setDescription(d.description ?? "");
      setDueDate(d.dueDate ? new Date(d.dueDate).toISOString().split("T")[0] : "");
      setPriority(d.priority);
    } catch {
      // ignore
    }
    setLoading(false);
  }

  function save(field: Partial<{ title: string; description: string; dueDate: string; priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" }>) {
    startTransition(async () => {
      const res = await updateCardAction({ workspaceId, cardId, ...field });
      if (res.success) {
        await load();
        appToast.success("Card updated");
      } else {
        appToast.error((res as { error?: string }).error ?? "Failed to update");
      }
    });
  }

  function handleDelete() {
    if (!confirm("Delete this card permanently?")) return;
    startTransition(async () => {
      const res = await deleteCardAction(workspaceId, cardId);
      if (res.success) {
        appToast.success("Card deleted");
        onCardDeleted?.();
        onClose();
      } else {
        appToast.error((res as { error?: string }).error ?? "Failed to delete");
      }
    });
  }

  function handleAssign(memberId: string) {
    startTransition(async () => {
      const res = await assignMemberToCardAction(workspaceId, cardId, memberId);
      if (res.success) await load();
      else appToast.error((res as { error?: string }).error ?? "Failed");
    });
  }

  function handleUnassign(memberId: string) {
    startTransition(async () => {
      const res = await unassignMemberFromCardAction(workspaceId, cardId, memberId);
      if (res.success) await load();
      else appToast.error((res as { error?: string }).error ?? "Failed");
    });
  }

  function handleComment() {
    if (!comment.trim()) return;
    const text = comment;
    setComment("");
    startTransition(async () => {
      const res = await addCardCommentAction(workspaceId, cardId, text);
      if (res.success) await load();
      else appToast.error((res as { error?: string }).error ?? "Failed");
    });
  }

  const assignedIds = card?.assignments.map((a) => a.user.id) ?? [];
  const unassignedMembers = workspaceMembers.filter((m) => !assignedIds.includes(m.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative flex w-full max-w-2xl flex-col max-h-[90vh] overflow-hidden rounded-xl bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div className="flex-1">
            {editTitle ? (
              <Input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => { save({ title }); setEditTitle(false); }}
                onKeyDown={(e) => e.key === "Enter" && (save({ title }), setEditTitle(false))}
                className="text-lg font-semibold"
              />
            ) : (
              <h2
                className="cursor-pointer text-lg font-semibold hover:bg-muted/50 rounded px-1 -mx-1 py-0.5 transition-colors"
                onClick={() => canManage && setEditTitle(true)}
              >
                {loading ? "Loading..." : card?.title}
              </h2>
            )}
            {card && (
              <p className="mt-1 text-xs text-muted-foreground">in list <span className="font-medium">{card.list.title}</span></p>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : card ? (
          <div className="flex flex-1 overflow-hidden">
            {/* Main */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => save({ description })}
                  placeholder="Add a description..."
                  className="min-h-[80px] resize-none text-sm"
                  disabled={!canManage}
                />
              </div>

              {/* Comments */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Comments ({card.comments.length})
                </label>
                <div className="space-y-3 mb-3 max-h-48 overflow-y-auto pr-1">
                  {card.comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                        {c.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 rounded-lg bg-muted/40 px-3 py-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold">{c.user.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleComment()}
                    placeholder="Write a comment..."
                    className="text-sm"
                  />
                    <Button size="sm" variant="outline" onClick={handleComment} disabled={!comment.trim() || isPending} className="px-2.5">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Activity */}
              {card.activityLogs.length > 0 && (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Activity</label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {card.activityLogs.map((log) => (
                      <div key={log.id} className="flex gap-2 text-xs">
                        <span className="font-medium text-foreground">{log.user.name}</span>
                        <span className="text-muted-foreground">{log.message}</span>
                        <span className="ml-auto shrink-0 text-muted-foreground/60">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-52 shrink-0 border-l overflow-y-auto p-4 space-y-5">
              {/* Priority */}
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Flag className="h-3 w-3" /> Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => { setPriority(e.target.value); save({ priority: e.target.value as "LOW" | "MEDIUM" | "HIGH" | "URGENT" }); }}
                  disabled={!canManage}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Due date */}
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Calendar className="h-3 w-3" /> Due Date
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => { setDueDate(e.target.value); save({ dueDate: e.target.value }); }}
                  disabled={!canManage}
                  className="text-sm"
                />
              </div>

              {/* Members */}
              <div>
                <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Members</span>
                  {canManage && unassignedMembers.length > 0 && (
                    <button
                      onClick={() => setShowMemberPicker(!showMemberPicker)}
                      className="rounded p-0.5 hover:bg-muted"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </label>

                {showMemberPicker && (
                  <div className="mb-2 rounded-lg border bg-background shadow-md">
                    {unassignedMembers.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { handleAssign(m.id); setShowMemberPicker(false); }}
                        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm hover:bg-muted"
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                          {m.name.charAt(0)}
                        </div>
                        <span className="truncate">{m.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-1.5">
                  {card.assignments.map((a) => (
                    <div key={a.user.id} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-muted/50 group">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {a.user.name.charAt(0)}
                      </div>
                      <span className="flex-1 truncate text-xs">{a.user.name}</span>
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => handleUnassign(a.user.id)}
                          className="hidden group-hover:block rounded p-0.5 text-muted-foreground hover:text-destructive"
                        >
                          <UserMinus className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {card.assignments.length === 0 && (
                    <p className="text-xs text-muted-foreground">No members assigned</p>
                  )}
                </div>
              </div>

              {/* Delete */}
              {canManage && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete Card
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center py-16 text-muted-foreground text-sm">
            Card not found
          </div>
        )}
      </div>
    </div>
  );
}
