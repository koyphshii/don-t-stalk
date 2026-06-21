"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createBoxAction, type BoxActionResult } from "@/app/actions/box-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NewBoxPage() {
  const [state, formAction, isPending] = useActionState<BoxActionResult, FormData>(
    createBoxAction,
    {}
  );

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/boxes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to boxes
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create a New Box
          </CardTitle>
          <CardDescription>
            Set up a &quot;Most Likely To&quot; voting box for your group
          </CardDescription>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="space-y-6">
            {state.error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                {state.error}
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="box-title">Box Title</Label>
              <Input
                id="box-title"
                name="title"
                placeholder='e.g., "Most Likely To — Summer 2025"'
                required
                maxLength={100}
                disabled={isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Box"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
