import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in - Lumina" },
      {
        name: "description",
        content: "Sign in to continue your Lumina learning path and saved progress.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login({ email, password });
      void navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isAuthenticated && user) {
    return (
      <AuthShell
        badge="Account active"
        title={`Welcome back, ${user.name}`}
        description="Your account is already active on this device. You can jump straight back into your dashboard or continue building your roadmap."
        asideTitle="Session restored"
        asideBody="Lumina found your saved session and kept it separate from the learner profile data, so your current setup stays intact."
        footerPrompt="Need a different account?"
        footerLinkLabel="Create one here"
        footerLinkTo="/signup"
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/onboarding">Open onboarding</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      badge="Sign in"
      title="Continue your learning journey"
      description="Sign in to reconnect with your saved roadmap, dashboard progress, and recommendations."
      asideTitle="Pick up where you left off"
      asideBody="This login layer is isolated from the learner profile object, so account state can grow independently without forcing schema changes across the rest of the app."
      footerPrompt="Don't have an account?"
      footerLinkLabel="Create one"
      footerLinkTo="/signup"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            minLength={8}
          />
        </div>
        {error ? (
          <p className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/onboarding">Continue as guest</Link>
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
