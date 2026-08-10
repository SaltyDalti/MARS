"use client";

import { useActionState } from "react";
import { createStaff } from "@/lib/reviews/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateStaffForm({
  defaultFirst = "",
  defaultLast = "",
}: {
  defaultFirst?: string;
  defaultLast?: string;
}) {
  const [state, action, pending] = useActionState(createStaff, {});

  return (
    <form action={action} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="first_name">First name</Label>
        <Input
          id="first_name"
          name="first_name"
          defaultValue={defaultFirst}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="last_name">Last name</Label>
        <Input
          id="last_name"
          name="last_name"
          defaultValue={defaultLast}
          required
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create staff profile"}
      </Button>
    </form>
  );
}
