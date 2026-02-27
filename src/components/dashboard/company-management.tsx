"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCompanyAction } from "@/server/actions/admin-actions";

const initialState = { success: false, error: "" };

export function CompanyManagement() {
  const [state, action, isPending] = useActionState(createCompanyAction, initialState);

  return (
    <Card id="companies">
      <CardHeader>
        <CardTitle>Create Company (Super Admin)</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" name="name" required />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Company"}
          </Button>
        </form>
        {state.error ? <p className="mt-2 text-xs text-destructive">{state.error}</p> : null}
      </CardContent>
    </Card>
  );
}
