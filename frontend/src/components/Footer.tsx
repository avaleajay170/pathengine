import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Github, Twitter, Linkedin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="gradient-ai flex size-8 items-center justify-center rounded-lg">
              <GraduationCap className="size-4 text-primary-foreground" />
            </span>
            <span className="font-bold">Lumina</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            AI-personalized learning paths built from your goal, your skill gaps and the hours you
            actually have.
          </p>
          <div className="mt-4 flex gap-2">
            {[
              { Icon: Twitter, label: "Lumina on X", href: "https://x.com" },
              { Icon: Linkedin, label: "Lumina on LinkedIn", href: "https://www.linkedin.com" },
              { Icon: Github, label: "Lumina on GitHub", href: "https://github.com" },
            ].map(({ Icon, label, href }) => (
              <Button key={label} variant="outline" size="icon" asChild>
                <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
                  <Icon className="size-4" />
                </a>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Product</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/explore" className="hover:text-foreground">
                Explore courses
              </Link>
            </li>
            <li>
              <Link to="/paths" className="hover:text-foreground">
                Learning paths
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/assistant" className="hover:text-foreground">
                AI assistant
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-foreground">
                About & pricing
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-foreground">
                Contact & support
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Weekly learning digest</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            One email a week: new paths, skill benchmarks and study tactics.
          </p>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim()) return;
              toast.success("You're on the list", {
                description: "The weekly learning digest will be sent to your inbox.",
              });
              setEmail("");
            }}
          >
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              aria-label="Email address"
              required
            />
            <Button type="submit">Join</Button>
          </form>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © 2026 Lumina Learn. Prototype with simulated recommendations.
      </div>
    </footer>
  );
}
