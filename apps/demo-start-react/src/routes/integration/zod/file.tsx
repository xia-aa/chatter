import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/integration/zod/file')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/integration/zod/file"!</div>
}
