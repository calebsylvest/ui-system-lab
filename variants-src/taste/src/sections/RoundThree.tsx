import { Ledger } from "@/sections/Ledger"
import { ClientWizard } from "@/sections/ClientWizard"

// Round-3 sections, grouped so every variant can mount them with one line.
// taste-skill: the style's one 24px gutter between cards, as in rounds 1 and 2.
export function RoundThree() {
  return (
    <section className="grid gap-6" aria-label="Ledger and new client">
      <Ledger />
      <ClientWizard />
    </section>
  )
}
