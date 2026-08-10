"use client";

import { useActionState } from "react";
import { submitKyc, type KycActionState } from "@/lib/kyc/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: KycActionState = {};

export function KycUploadForm() {
  const [state, action, pending] = useActionState(submitKyc, initial);

  return (
    <form action={action} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="document">Contract or receipt</Label>
        <Input
          id="document"
          name="document"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          required
        />
        <p className="text-xs text-muted-foreground">
          PDF or image, max 10MB. Stored privately for admin review only.
        </p>
      </div>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-foreground" role="status">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Uploading…" : "Submit for verification"}
      </Button>
    </form>
  );
}
