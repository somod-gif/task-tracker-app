"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSprintAction } from "@/server/actions/sprint-actions";

const initialState = { success: false, error: "" };

export function SprintManagement({ departments }: { departments: Array<{ id: string; name: string }> }) {
  const [state, action, isPending] = useActionState(createSprintAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sprint / Backlog Assignment</CardTitle>
        <CardDescription>Create sprints/backlogs and assign them to departments.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-3 md:grid-cols-2">
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
          <Button type="submit" disabled={isPending} className="w-fit">
            {isPending ? "Saving..." : "Create Sprint/Backlog"}
          </Button>
        </form>
        {state.error ? <p className="mt-2 text-xs text-destructive">{state.error}</p> : null}
      </CardContent>
    </Card>
  );
}
