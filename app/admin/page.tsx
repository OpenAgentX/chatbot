import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { AdminModelSettingsForm } from "@/components/chat/admin-model-settings-form";
import {
  getConfiguredChatModels,
  getResolvedModelProviderConfig,
} from "@/lib/ai/runtime-config";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id || !session.user.isAdmin) {
    redirect("/");
  }

  const [config, models] = await Promise.all([
    getResolvedModelProviderConfig(),
    getConfiguredChatModels(),
  ]);

  return (
    <div className="min-h-dvh overflow-y-auto bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Model Provider Settings
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Manage the active model provider from the database instead of
            environment variables. Changes take effect immediately for new
            requests.
          </p>
        </div>

        <section className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
          <AdminModelSettingsForm config={config} />
        </section>

        <section className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="mb-4 space-y-1">
            <h2 className="text-lg font-medium">Detected models</h2>
            <p className="text-sm text-muted-foreground">
              These are the models currently exposed to the chat UI.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {models.map((model) => (
              <div
                className="rounded-2xl border border-border/50 bg-background/60 p-4"
                key={model.id}
              >
                <p className="text-sm font-medium">{model.name}</p>
                <p className="mt-1 break-all text-xs text-muted-foreground">
                  {model.id}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Provider: {model.provider}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
