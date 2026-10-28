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
      <div className="app-shell text-[var(--ink)] antialiased">
        <header className="app-header">
          <div className="app-header-inner">
            <div className="brand">
              <div className="brand-mark">LQ</div>
              <div>
                <div className="brand-title">LI.FI Swap Quotes</div>
                <div className="brand-subtitle">Routes across chains, quotes only</div>
              </div>
            </div>
          </div>
        </header>
        <main className="app-main">
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
