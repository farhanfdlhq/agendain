import { revalidatePath } from "next/cache";

export function revalidateOpenTrips(): void {
  revalidatePath("/");
  revalidatePath("/open-trip");
  revalidatePath("/open-trip/[slug]", "page");
  revalidatePath("/sitemap.xml");
}
