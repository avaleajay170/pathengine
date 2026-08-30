import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { GraduationCap, Menu, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

const links = [
  { to: "/explore", label: "Explore Courses" },
  { to: "/paths", label: "Paths" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/assistant", label: "Assistant" },
  { to: "/about", label: "About" },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(localStorage.getItem("lumina-theme") === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("lumina-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle color theme"
      onClick={() => setDark((current) => !current)}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

function UserBadge({ name, email }: { name: string; email: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="hidden items-center gap-3 rounded-full border border-border bg-card px-3 py-1.5 sm:flex">
      <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
        {initials}
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-xs text-muted-foreground">{email}</p>
      </div>
    </div>
  );
}

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="gradient-ai flex size-9 items-center justify-center rounded-xl">
            <GraduationCap className="size-5 text-primary-foreground" />
          </span>
          <span className="text-lg font-bold tracking-tight">Lumina</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "text-primary bg-accent" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {isLoading ? null : isAuthenticated && user ? (
            <>
              <UserBadge name={user.name} email={user.email} />
              <Button variant="ghost" className="hidden sm:inline-flex" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="hidden sm:inline-flex" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Create account</Link>
              </Button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-6">
              <nav className="mt-8 flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-accent"
                  >
                    {link.label}
                  </Link>
                ))}

                {isLoading ? null : isAuthenticated && user ? (
                  <>
                    <div className="mt-4 rounded-xl border border-border bg-secondary/60 px-3 py-3">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Button variant="outline" className="mt-3 justify-start" onClick={logout}>
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="mt-4 justify-start" asChild>
                      <Link to="/login">Sign in</Link>
                    </Button>
                    <Button className="justify-start" asChild>
                      <Link to="/signup">Create account</Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
