import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account - Lumina" },
      {
        name: "description",
        content: "Create a Lumina account to save your personalized learning roadmap.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { signup, isAuthenticated, user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await signup({ name, email, password });
      void navigate({ to: "/onboarding" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isAuthenticated && user) {
    return (
      <AuthShell
        badge="Account ready"
        title={`You're signed in as ${user.name}`}
        description="Your account is already set up. You can continue building your learner profile or head straight to the dashboard."
        asideTitle="Everything is connected"
        asideBody="Your auth record is now separate from your learner profile, which keeps the current app data model stable while making room for future account features."
        footerPrompt="Want to switch accounts?"
        footerLinkLabel="Use sign in"
        footerLinkTo="/login"
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/onboarding">Continue onboarding</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      badge="Create account"
      title="Start with a proper Lumina account"
      description="Create your account once, then keep your goal, progress, and roadmap under one identity as the project grows."
      asideTitle="Built for the current app structure"
      asideBody="This account flow is intentionally layered on top of the existing project. It avoids changing the learner profile contract and keeps future backend migration straightforward."
      footerPrompt="Already have an account?"
      footerLinkLabel="Sign in"
      footerLinkTo="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Aarav Sharma"
            required
            minLength={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            required
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your password"
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
            {submitting ? "Creating account..." : "Create account"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/onboarding">Skip for now</Link>
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
