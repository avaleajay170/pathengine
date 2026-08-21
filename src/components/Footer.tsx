import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
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
            {[Twitter, Linkedin, Github].map((Icon, i) => (
              <Button key={i} variant="outline" size="icon" aria-label="Social link">
                <Icon className="size-4" />
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
            <li>Careers</li>
            <li>Partners</li>
            <li>Privacy</li>
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
            }}
          >
            <Input type="email" placeholder="you@email.com" aria-label="Email address" />
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
