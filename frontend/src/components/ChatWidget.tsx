import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Bot, Maximize2, MessageCircle, X } from "lucide-react";
import { useAssistant } from "@/lib/assistant";
import { ChatThread } from "@/components/Chat";

export function ChatWidget() {
  const { open, setOpen } = useAssistant();
  const { pathname } = useLocation();

  // The dedicated /assistant view already renders this thread full-page.
  if (pathname === "/assistant") return null;

  return (
    <>
      {open && (
        <div className="surface-card fixed right-4 bottom-4 z-50 flex h-[560px] max-h-[80vh] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border p-3">
            <span className="gradient-ai flex size-8 items-center justify-center rounded-lg">
              <Bot className="size-4 text-primary-foreground" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">Lumi</p>
              <p className="text-xs text-muted-foreground">Your learning strategist</p>
            </div>
            <div className="ml-auto flex">
              <Button variant="ghost" size="icon" asChild aria-label="Open full assistant">
                <Link to="/assistant" onClick={() => setOpen(false)}>
                  <Maximize2 className="size-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
          <ChatThread />
        </div>
      )}

      {!open && (
        <Button
          onClick={() => setOpen(true)}
          className="gradient-ai fixed right-4 bottom-4 z-50 h-14 gap-2 rounded-full px-5 shadow-lg"
          aria-label="Open AI assistant"
        >
          <MessageCircle className="size-5" />
          Ask Lumi
        </Button>
      )}
    </>
  );
}
