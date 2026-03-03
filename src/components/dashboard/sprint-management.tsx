"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSprintAction, deleteSprintAction, updateSprintAction } from "@/server/actions/sprint-actions";

const initialState = { success: false, error: "" };

type SprintItem = {
  id: string;
  name: string;
  description: string | null;
  type: "SPRINT" | "BACKLOG";
  departmentId: string | null;
  startDate: Date | null;
  endDate: Date | null;
};

function formatDateValue(value: Date | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function SprintManagement({
  departments,
  sprints,
}: {
  departments: Array<{ id: string; name: string }>;
  sprints: SprintItem[];
}) {
  const [createState, createAction, createPending] = useActionState(createSprintAction, initialState);
  const [updateState, updateAction, updatePending] = useActionState(updateSprintAction, initialState);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteSprintAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sprint / Backlog Assignment</CardTitle>
        <CardDescription>Create sprints/backlogs and assign them to departments.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createAction} className="grid gap-3 md:grid-cols-2">
          <Input name="name" placeholder="Sprint/Backlog Name" required />
          <select name="type" className="h-9 rounded-md border border-input bg-background px-3 text-sm" defaultValue="SPRINT">
            <option value="SPRINT">SPRINT</option>
            <option value="BACKLOG">BACKLOG</option>
          </select>
          <select name="departmentId" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Assign Department (Optional)</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          <Input name="startDate" type="date" />
          <Input name="endDate" type="date" />
          <Textarea name="description" placeholder="Objective and success criteria" className="md:col-span-2" />
          <Button type="submit" disabled={createPending} className="w-fit">
            {createPending ? "Saving..." : "Create Sprint/Backlog"}
          </Button>
        </form>
        {createState.error ? <p className="mt-2 text-xs text-destructive">{createState.error}</p> : null}

        <div className="mt-6 space-y-4 border-t pt-4">
          <p className="text-sm font-medium">Existing Sprints / Backlogs</p>
          {sprints.length === 0 ? <p className="text-xs text-muted-foreground">No sprints found.</p> : null}

          {sprints.map((sprint) => (
            <div key={sprint.id} className="rounded-lg border p-3">
              <form action={updateAction} className="grid gap-2 md:grid-cols-2">
                <input type="hidden" name="sprintId" value={sprint.id} />
                <Input name="name" defaultValue={sprint.name} required />
                <select name="type" className="h-9 rounded-md border border-input bg-background px-3 text-sm" defaultValue={sprint.type}>
                  <option value="SPRINT">SPRINT</option>
                  <option value="BACKLOG">BACKLOG</option>
                </select>
                <select name="departmentId" className="h-9 rounded-md border border-input bg-background px-3 text-sm" defaultValue={sprint.departmentId ?? ""}>
                  <option value="">Assign Department (Optional)</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
                <Input name="startDate" type="date" defaultValue={formatDateValue(sprint.startDate)} />
                <Input name="endDate" type="date" defaultValue={formatDateValue(sprint.endDate)} />
                <Textarea name="description" defaultValue={sprint.description ?? ""} className="md:col-span-2" />
                <div className="flex gap-2 md:col-span-2">
                  <Button type="submit" size="sm" disabled={updatePending}>
                    {updatePending ? "Updating..." : "Update"}
                  </Button>
                </div>
              </form>

              <form action={deleteAction} className="mt-2">
                <input type="hidden" name="sprintId" value={sprint.id} />
                <Button type="submit" size="sm" variant="destructive" disabled={deletePending}>
                  {deletePending ? "Deleting..." : "Delete"}
                </Button>
              </form>
            </div>
          ))}
          {updateState.error ? <p className="text-xs text-destructive">{updateState.error}</p> : null}
          {deleteState.error ? <p className="text-xs text-destructive">{deleteState.error}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
