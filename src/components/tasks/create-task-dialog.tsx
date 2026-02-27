"use client";

import { useActionState } from "react";
import { Bold, CalendarClock, Link2, ListChecks, Underline, Users } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTaskAction } from "@/server/actions/task-actions";

const initialState = { success: false, error: "" };

export function CreateTaskDialog({ assignees }: { assignees: Array<{ id: string; name: string }> }) {
  const [state, formAction, isPending] = useActionState(createTaskAction, initialState);

  function applyMarker(fieldId: "richContent", marker: "**" | "__") {
    const field = document.getElementById(fieldId) as HTMLTextAreaElement | null;
    if (!field) return;

    const start = field.selectionStart ?? 0;
    const end = field.selectionEnd ?? 0;
    const selected = field.value.slice(start, end) || "text";
    const wrapped = `${marker}${selected}${marker}`;

    field.setRangeText(wrapped, start, end, "end");
    field.focus();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <ListChecks className="size-4" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create and assign team task</DialogTitle>
          <DialogDescription>
            Build backlog or sprint tasks, add context links, and assign to multiple employees in your team.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workType">Task Type</Label>
            <select id="workType" name="workType" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" defaultValue="GENERAL">
              <option value="GENERAL">General Task</option>
              <option value="BACKLOG">General Backlog</option>
              <option value="SPRINT">Sprint</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Input id="summary" name="summary" placeholder="One-line objective" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" required />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="richContent">Detailed Notes</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" className="h-7 px-2" onClick={() => applyMarker("richContent", "**")}>
                  <Bold className="size-3" />
                </Button>
                <Button type="button" variant="outline" size="sm" className="h-7 px-2" onClick={() => applyMarker("richContent", "__")}>
                  <Underline className="size-3" />
                </Button>
              </div>
            </div>
            <Textarea id="richContent" name="richContent" rows={5} placeholder="Use **bold** or __underline__ markers." />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" name="deadline" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select id="priority" name="priority" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprintName">Sprint / Backlog Name</Label>
            <Input id="sprintName" name="sprintName" placeholder="e.g. Sprint 12 / Q1 Backlog" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="label-1">Labels</Label>
              <Input id="label-1" name="labels" placeholder="frontend" />
              <Input name="labels" placeholder="api" />
              <Input name="labels" placeholder="urgent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-1" className="inline-flex items-center gap-1">
                <Link2 className="size-3" />
                Reference Links
              </Label>
              <Input id="link-1" name="referenceLinks" type="url" placeholder="https://docs.example.com" />
              <Input name="referenceLinks" type="url" placeholder="https://figma.com/file/..." />
              <Input name="referenceLinks" type="url" placeholder="https://github.com/..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedToIds" className="inline-flex items-center gap-1">
              <Users className="size-3" />
              Assign Employees
            </Label>
            <select
              id="assignedToIds"
              name="assignedToIds"
              multiple
              className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              {assignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple team members.</p>
          </div>

          <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            <p className="inline-flex items-center gap-1">
              <CalendarClock className="size-3" />
              Assigned time is recorded in real-time when this task is created.
            </p>
          </div>

          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
