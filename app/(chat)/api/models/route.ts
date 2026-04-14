import {
  getAllGatewayModels,
  getCapabilities,
  getConfiguredChatModels,
  shouldExposeAllGatewayModels,
} from "@/lib/ai/runtime-config";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };

  const curatedCapabilities = await getCapabilities();
  if (await shouldExposeAllGatewayModels()) {
    const models = await getAllGatewayModels();
    const capabilities = Object.fromEntries(
      models.map((m) => [m.id, curatedCapabilities[m.id] ?? m.capabilities])
    );

    return Response.json({ capabilities, models }, { headers });
  }

  return Response.json(
    {
      capabilities: curatedCapabilities,
      models: await getConfiguredChatModels(),
    },
    { headers }
  );
}
