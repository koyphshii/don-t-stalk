"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { joinBoxAction, type BoxActionResult } from "@/app/actions/box-actions";

interface JoinFormProps {
  token: string;
}

export function JoinForm({ token }: JoinFormProps) {
  const boundAction = joinBoxAction.bind(null, token);
  const [state, formAction, isPending] = useActionState<BoxActionResult, FormData>(
    async () => {
      return await boundAction();
    },
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 text-center">
          {state.error}
        </div>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? "Joining..." : "Join Box"}
      </Button>
    </form>
  );
}
