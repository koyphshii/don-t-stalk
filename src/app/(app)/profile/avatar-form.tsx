"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AvatarFormProps {
  currentAvatar: string | null;
  updateAvatarAction: (formData: FormData) => Promise<string | null>;
}

export function AvatarForm({ currentAvatar, updateAvatarAction }: AvatarFormProps) {
  const [error, formAction, isPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      return updateAvatarAction(formData);
    },
    null
  );

  return (
    <form action={formAction} className="space-y-3 pt-4 border-t border-border">
      <div className="space-y-1.5">
        <Label htmlFor="avatar-url" className="text-sm">
          Profile Picture URL
        </Label>
        <Input
          id="avatar-url"
          name="avatarUrl"
          type="url"
          placeholder={currentAvatar || "https://example.com/avatar.jpg"}
          defaultValue={currentAvatar || ""}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          Paste a direct image URL (must start with https://)
        </p>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Saving..." : "Update Avatar"}
      </Button>
    </form>
  );
}
