import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout for unauthenticated pages: login, register, onboarding.
 * No sidebar, centered card.
 */
export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
