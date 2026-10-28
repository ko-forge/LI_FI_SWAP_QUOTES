import { createFileRoute } from '@tanstack/react-router'
import { SwapForm } from '../components/swap-form'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Get a quote</h2>
        <p className="text-zinc-600">
          Compare LI.FI swap routes across chains. Quotes only — no wallet
          connection or swapping.
        </p>
      </div>
      <SwapForm />
    </section>
  )
}
