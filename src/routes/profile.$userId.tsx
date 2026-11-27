import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UserProfileView } from "@/mansa/components/common/UserProfileView";

export const Route = createFileRoute("/profile/$userId")({
  component: PublicProfileRoute,
});

function PublicProfileRoute() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-[#101114]">
      <UserProfileView
        userId={userId}
        onBack={() => void navigate({ to: "/" })}
      />
    </main>
  );
}
