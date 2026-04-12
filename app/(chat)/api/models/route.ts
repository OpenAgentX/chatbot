import {
  getAllGatewayModels,
  getCapabilities,
  getConfiguredChatModels,
  isDemo,
} from "@/lib/ai/models";

export async function GET() {
  const headers = {
    "Cache-Control": "public, max-age=86400, s-maxage=86400",
  };

  const curatedCapabilities = await getCapabilities();
  const isOpenAICompatibleProviderEnabled = Boolean(
    process.env.OPENAI_COMPATIBLE_API_KEY
  );

  if (isOpenAICompatibleProviderEnabled) {
    return Response.json(
      {
        capabilities: curatedCapabilities,
        models: await getConfiguredChatModels(),
      },
      { headers }
    );
  }

  if (isDemo) {
    const models = await getAllGatewayModels();
    const capabilities = Object.fromEntries(
      models.map((m) => [m.id, curatedCapabilities[m.id] ?? m.capabilities])
    );

    return Response.json({ capabilities, models }, { headers });
  }

  return Response.json(curatedCapabilities, { headers });
}
