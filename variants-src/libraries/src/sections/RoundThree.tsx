import { Ledger } from "@/sections/Ledger"
import { ClientWizard } from "@/sections/ClientWizard"

// Round-3 sections, grouped so every variant can mount them with one line.
export function RoundThree() {
  return (
    <section className="grid gap-4" aria-label="Ledger and new client">
      <Ledger />
      <ClientWizard />
    </section>
  )
}
