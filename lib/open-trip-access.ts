import { cache } from "react";
import { getServerSession } from "next-auth/next";
import { prisma } from "./prisma";
import { authOptions } from "./auth";
import { resolveActor, hasPermission } from "./rbac";
import { isPublishedOpenTrip } from "./open-trip-card";

// Metadata, halaman detail, dan API harus memakai aturan pratinjau yang sama.
// React cache hanya untuk deduplikasi dalam satu render, bukan lintas pengguna.
export const getOpenTripForViewer = cache(async (slug: string) => {
  const trip = await prisma.openTrip.findUnique({
    where: { slug }, include: { destinasi: true },
  });
  if (!trip || isPublishedOpenTrip(trip.status)) return trip;
  const actor = await resolveActor(await getServerSession(authOptions));
  return hasPermission(actor, "paket_view", "paket_edit") ? trip : null;
});
