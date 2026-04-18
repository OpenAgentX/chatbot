import { getAllGatewayModels } from "@/lib/ai/models";

export async function GET() {
  const headers = {
    "Cache-Control": "public, max-age=86400, s-maxage=86400",
  };

  const models = await getAllGatewayModels();
  const capabilities = Object.fromEntries(
    models.map((model) => [model.id, model.capabilities] as const)
  );

  return Response.json({ capabilities, models }, { headers });
}
