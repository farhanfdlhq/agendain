import ItineraryForm from "../../ItineraryForm"

export default async function EditItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ItineraryForm mode="edit" id={id} />
}
