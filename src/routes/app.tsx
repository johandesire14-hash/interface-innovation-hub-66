import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppLoadingScreen } from "@/mansa/components/common/AppLoadingScreen";
import { useAuth } from "@/mansa/context/AuthContext";
import App from "@/mansa/App";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [
    { title: "Mon espace — afhub" },
    { name: "description", content: "Votre espace personnel et vos entreprises sur afhub." },
    { property: "og:title", content: "Mon espace — afhub" },
    { property: "og:description", content: "Votre espace personnel et vos entreprises sur afhub." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AppRoute,
});

function AppRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const locationState = useRouterState({
    select: (state) => state.location.state as { openStudio?: boolean },
  });

  useEffect(() => {
    if (!loading && !user)
      void navigate({ to: "/login", search: { mode: "login", reason: "session" }, replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) return <AppLoadingScreen />;
  return <App openStudioOnMount={Boolean(locationState?.openStudio)} />;
}
