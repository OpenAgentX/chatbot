"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  type SaveModelProviderSettingsState,
  saveModelProviderSettings,
} from "@/app/admin/actions";
import type { ResolvedModelProviderConfig } from "@/lib/ai/runtime-config";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? "Saving..." : "Save settings"}
    </Button>
  );
}

export function AdminModelSettingsForm({
  config,
}: {
  config: ResolvedModelProviderConfig;
}) {
  const [state, formAction] = useActionState<
    SaveModelProviderSettingsState,
    FormData
  >(saveModelProviderSettings, {
    status: "idle",
  });

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="provider">Provider</Label>
          <select
            className="h-9 w-full rounded-4xl border border-input bg-input/30 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            defaultValue={config.provider}
            id="provider"
            name="provider"
          >
            <option value="gateway">Vercel AI Gateway</option>
            <option value="openai-compatible">OpenAI-compatible</option>
            <option value="google">Google Gemini</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="baseUrl">Base URL</Label>
          <Input
            defaultValue={config.baseUrl ?? ""}
            id="baseUrl"
            name="baseUrl"
            placeholder="https://api.example.com/v1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apiKey">API key</Label>
          <Input
            defaultValue={config.apiKey ?? ""}
            id="apiKey"
            name="apiKey"
            placeholder="sk-..."
            type="password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="defaultModel">Default model</Label>
          <Input
            defaultValue={config.defaultModel ?? ""}
            id="defaultModel"
            name="defaultModel"
            placeholder="gpt-4o-mini"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="titleModel">Title model</Label>
          <Input
            defaultValue={config.titleModel ?? ""}
            id="titleModel"
            name="titleModel"
            placeholder="gpt-4.1-mini"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customModels">Custom models</Label>
        <Textarea
          defaultValue={config.customModels ?? ""}
          id="customModels"
          name="customModels"
          placeholder={
            "gpt-4o-mini|GPT-4o Mini\ngemini-3-flash-preview|Gemini 3 Flash"
          }
          rows={6}
        />
        <p className="text-sm text-muted-foreground">
          Optional fallback list. Use one model per line in the format{" "}
          <code>id|display name</code>.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton />
        {state.message && (
          <p
            className={
              state.status === "error"
                ? "text-sm text-destructive"
                : "text-sm text-muted-foreground"
            }
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
