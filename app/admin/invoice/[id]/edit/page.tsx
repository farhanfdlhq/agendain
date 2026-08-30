import InvoiceForm from "../../InvoiceForm"

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <InvoiceForm mode="edit" id={id} />
}
