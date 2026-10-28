import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <section className="space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight">Get a quote</h2>
      <p className="text-zinc-600">
        Token selection and swap quotes will live here.
      </p>
    </section>
  )
}
