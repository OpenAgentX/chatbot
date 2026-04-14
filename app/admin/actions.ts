"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { upsertModelProviderConfig } from "@/lib/db/queries";

function isValidAbsoluteUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

const emptyToNull = z
  .string()
  .transform((value) => value.trim())
  .transform((value) => (value.length > 0 ? value : null));

const optionalUrl = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length === 0 || isValidAbsoluteUrl(value), {
    message: "Base URL must be an absolute URL.",
  })
  .transform((value) => (value.length > 0 ? value : null));

const modelProviderSettingsSchema = z.object({
  provider: z.enum(["gateway", "openai-compatible", "google"]),
  baseUrl: optionalUrl,
  apiKey: emptyToNull,
  defaultModel: emptyToNull,
  titleModel: emptyToNull,
  customModels: emptyToNull,
});

export type SaveModelProviderSettingsState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function saveModelProviderSettings(
  _previousState: SaveModelProviderSettingsState,
  formData: FormData
): Promise<SaveModelProviderSettingsState> {
  const session = await auth();

  if (!session?.user?.id || !session.user.isAdmin) {
    return { status: "error", message: "Admin access is required." };
  }

  const parsed = modelProviderSettingsSchema.safeParse({
    provider: formData.get("provider"),
    baseUrl: formData.get("baseUrl"),
    apiKey: formData.get("apiKey"),
    defaultModel: formData.get("defaultModel"),
    titleModel: formData.get("titleModel"),
    customModels: formData.get("customModels"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message || "Invalid settings.",
    };
  }

  await upsertModelProviderConfig({
    ...parsed.data,
    updatedBy: session.user.id,
  });

  revalidatePath("/admin");
  revalidatePath("/");

  return { status: "success", message: "Model provider settings saved." };
}
