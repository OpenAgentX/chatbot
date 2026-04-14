ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "isAdmin" boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "ModelProviderConfig" (
  "id" text PRIMARY KEY NOT NULL DEFAULT 'default',
  "provider" text NOT NULL DEFAULT 'gateway',
  "baseUrl" text,
  "apiKey" text,
  "defaultModel" text,
  "titleModel" text,
  "customModels" text,
  "updatedBy" uuid REFERENCES "User"("id"),
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
