import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import type { RouterContext } from '../router'

import '../styles.css'

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <div className="min-h-dvh bg-zinc-50 text-zinc-900 antialiased">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center px-4 py-4">
            <h1 className="text-lg font-semibold tracking-tight">
              LI.FI Swap Quotes
            </h1>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">
          <Outlet />
        </main>
      </div>
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </>
  )
}
