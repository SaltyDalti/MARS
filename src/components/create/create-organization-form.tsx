"use client";

import { useActionState } from "react";
import { createOrganization } from "@/lib/reviews/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateOrganizationForm({
  defaultName = "",
}: {
  defaultName?: string;
}) {
  const [state, action, pending] = useActionState(createOrganization, {});

  return (
    <form action={action} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Organization name</Label>
        <Input id="name" name="name" defaultValue={defaultName} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="division">Division (optional)</Label>
        <Input id="division" name="division" placeholder="e.g. DCI World Class" />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Activity type</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="activity_type" value="dci" defaultChecked />
          Drum corps (DCI / outdoor)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="activity_type" value="wgi" />
          Winter guard (WGI)
        </label>
      </fieldset>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create organization"}
      </Button>
    </form>
  );
}
