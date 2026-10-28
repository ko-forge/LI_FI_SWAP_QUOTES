import { createFileRoute } from '@tanstack/react-router'
import { SwapForm } from '../components/swap-form'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <section>
      <div className="hero animate-rise">
        <h2>Find the best swap quote</h2>
        <p>
          Pick a route, set an amount, and compare LI.FI estimates instantly. No
          wallet, no signing, no swap execution.
        </p>
      </div>
      <SwapForm />
    </section>
  )
}
