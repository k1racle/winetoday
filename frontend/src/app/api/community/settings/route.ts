import { getCommunitySettings } from "@/lib/strapi";

export async function GET() {
  try {
    const settings = await getCommunitySettings();
    return Response.json(settings);
  } catch (error) {
    console.error("[community] settings", error);
    return Response.json(
      {
        allowGuestComments: true,
        commentModerationEnabled: true,
        commentBlockedMessage: null,
        commentMaxLength: 3000,
        shareNetworks: [],
      },
      { status: 200 },
    );
  }
}
