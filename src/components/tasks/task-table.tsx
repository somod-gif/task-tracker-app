"use client";

import { useState, useTransition } from "react";
import { CalendarClock, Link2, ListChecks, MessageSquareText, Tag, UserRound, UsersRound } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { appToast } from "@/lib/toast";
import { softDeleteTaskAction, updateTaskStatusAction } from "@/server/actions/task-actions";
import type { TaskPriority, TaskStatus } from "@/types/domain";

const TaskStatusValues = {
  TODO: "TODO" as TaskStatus,
  IN_PROGRESS: "IN_PROGRESS" as TaskStatus,
  DONE: "DONE" as TaskStatus,
};

type TaskRow = {
  id: string;
  title: string;
  summary?: string | null;
  description: string;
  richContent?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  workType?: "GENERAL" | "BACKLOG" | "SPRINT";
  sprintName?: string | null;
  labels?: string[];
  referenceLinks?: string[];
  assignedAt?: Date | string;
  deadline: Date | string;
  assignedTo?: { id: string; name: string } | null;
  assignments?: Array<{ id?: string; user: { id: string; name: string } }>;
  createdBy: { id: string; name: string };
  comments: Array<{ id: string; content: string; user: { name: string } }>;
};

function priorityVariant(priority: TaskPriority): "default" | "secondary" | "destructive" {
  if (priority === "HIGH") return "destructive";
  if (priority === "MEDIUM") return "secondary";
  return "default";
}

function statusVariant(status: TaskStatus): "default" | "secondary" | "outline" {
  if (status === TaskStatusValues.DONE) return "default";
  if (status === TaskStatusValues.IN_PROGRESS) return "secondary";
  return "outline";
}

export function TaskTable({
  tasks,
  canDelete,
  canUpdate,
}: {
  tasks: TaskRow[];
  canDelete?: boolean;
  canUpdate?: boolean;
}) {
  const [rows, setRows] = useState(tasks);
  const [isPending, startTransition] = useTransition();

  function updateStatus(taskId: string, status: TaskStatus, comment?: string) {
    setRows((current) => current.map((task) => (task.id === taskId ? { ...task, status } : task)));

    startTransition(async () => {
      try {
        await updateTaskStatusAction({ taskId, status, comment });
        appToast.success("Task updated");
      } catch {
        appToast.error("Could not update task");
      }
    });
  }

  function deleteTask(taskId: string) {
    const previous = rows;
    setRows((current) => current.filter((task) => task.id !== taskId));

    startTransition(async () => {
      try {
        await softDeleteTaskAction(taskId);
        appToast.success("Task archived");
      } catch {
        setRows(previous);
        appToast.error("Could not archive task");
      }
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Timeline</TableHead>
          <TableHead>Assignees</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((task) => {
          const overdue = new Date(task.deadline) < new Date() && task.status !== TaskStatusValues.DONE;
          return (
            <TableRow key={task.id}>
              <TableCell>
                <p className="font-medium">{task.title}</p>
                {task.summary ? <p className="text-xs text-muted-foreground">{task.summary}</p> : null}
                <p className="mt-1 text-xs text-muted-foreground">{task.description}</p>
                {task.richContent ? <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.richContent}</p> : null}
                {task.labels?.length ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    <Tag className="size-3 text-muted-foreground" />
                    {task.labels.map((label) => (
                      <Badge key={`${task.id}-${label}`} variant="outline">
                        {label}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <UserRound className="size-3" />
                    Owner: {task.createdBy.name}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquareText className="size-3" />
                    {task.comments.length} updates
                  </span>
                </div>
                {task.referenceLinks?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {task.referenceLinks.slice(0, 2).map((link) => (
                      <a
                        key={`${task.id}-${link}`}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
                      >
                        <Link2 className="size-3" />
                        Resource
                      </a>
                    ))}
                  </div>
                ) : null}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{(task.workType ?? "GENERAL").replace("_", " ")}</Badge>
                {task.sprintName ? <p className="mt-1 text-xs text-muted-foreground">{task.sprintName}</p> : null}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(task.status)}>{task.status.replace("_", " ")}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={priorityVariant(task.priority)}>{task.priority}</Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CalendarClock className="size-3" />
                    Assigned {new Date(task.assignedAt ?? task.deadline).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <ListChecks className="size-3 text-muted-foreground" />
                    Due {new Date(task.deadline).toLocaleString()}
                  </div>
                  {overdue ? <Badge variant="destructive" className="ml-2">Overdue</Badge> : null}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {(task.assignments ?? []).slice(0, 3).map((assignment) => (
                    <div key={`${task.id}-${assignment.user.id}`} className="flex items-center gap-1 text-xs">
                      <UserRound className="size-3 text-muted-foreground" />
                      {assignment.user.name}
                    </div>
                  ))}
                  {(task.assignments ?? []).length > 3 ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <UsersRound className="size-3" />+{(task.assignments ?? []).length - 3} more
                    </div>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {canUpdate ? (
                    <StatusDialog taskId={task.id} onUpdate={updateStatus} disabled={isPending} />
                  ) : null}
                  {canDelete ? (
                    <Button variant="destructive" size="sm" onClick={() => deleteTask(task.id)} disabled={isPending}>
                      Archive
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function StatusDialog({
  taskId,
  onUpdate,
  disabled,
}: {
  taskId: string;
  onUpdate: (taskId: string, status: TaskStatus, comment?: string) => void;
  disabled?: boolean;
}) {
  const [status, setStatus] = useState<TaskStatus>(TaskStatusValues.IN_PROGRESS);
  const [comment, setComment] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled}>
          Update
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update task status</DialogTitle>
          <DialogDescription>Set progress and add an optional comment.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
          >
            <option value={TaskStatusValues.TODO}>To Do</option>
            <option value={TaskStatusValues.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatusValues.DONE}>Done</option>
          </select>
          <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Optional comment" />
          <Button onClick={() => onUpdate(taskId, status, comment)}>Save update</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
