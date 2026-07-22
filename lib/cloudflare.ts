// lib/cloudflare.ts

export async function purgeCloudflareCache() {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken) {
    console.warn(
      "Cloudflare Zone ID or API Token is missing. Skipping cache purge.",
    );
    return false;
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ purge_everything: true }),
      },
    );

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Failed to purge Cloudflare Cache:", error);
    return false;
  }
}
