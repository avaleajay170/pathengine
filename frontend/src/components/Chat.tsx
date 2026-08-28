import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, Bot, Flag, GraduationCap } from "lucide-react";
import { useAssistant, suggestedPrompts, type ChatMessage } from "@/lib/assistant";
import { getCourse } from "@/data/mock";

function MiniCourseCard({ courseId }: { courseId: string }) {
  const course = getCourse(courseId);
  if (!course) return null;
  return (
    <Link
      to="/course/$id"
      params={{ id: course.id }}
      className="surface-card hover-lift mt-3 flex items-center gap-3 p-3"
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `oklch(0.62 0.14 ${course.thumbHue})` }}
      >
        <GraduationCap className="size-5 text-primary-foreground" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{course.title}</span>
        <span className="block text-xs text-muted-foreground">
          {course.provider} · {course.hours} hrs · {course.level}
        </span>
      </span>
    </Link>
  );
}

function MilestoneChip({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mt-3 rounded-xl border border-ai/30 bg-ai-soft p-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-ai-foreground">
        <Flag className="size-4" />
        {title}
      </div>
      <p className="mt-1 text-xs text-ai-foreground/80">{detail}</p>
    </div>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {message.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <span className="gradient-ai mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg">
        <Bot className="size-4 text-primary-foreground" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
          {message.content}
        </p>
        {message.courseId && <MiniCourseCard courseId={message.courseId} />}
        {message.milestone && <MilestoneChip {...message.milestone} />}
      </div>
    </div>
  );
}

export function ChatThread({ className = "" }: { className?: string }) {
  const { messages, thinking, send } = useAssistant();
  const [value, setValue] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const submit = () => {
    send(value);
    setValue("");
  };

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
      <div
        className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4"
        aria-live="polite"
        aria-busy={thinking}
        aria-label="Assistant conversation"
      >
        {messages.map((m) => (
          <Bubble key={m.id} message={m} />
        ))}
        {thinking && (
          <div className="flex items-center gap-3" role="status">
            <span className="gradient-ai flex size-7 items-center justify-center rounded-lg">
              <Bot className="size-4 text-primary-foreground" />
            </span>
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-2 animate-bounce rounded-full bg-ai"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </span>
            <span className="text-xs text-muted-foreground">
              Lumi is reasoning over your path...
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              type="button"
              className="rounded-full border border-ai/40 px-2.5 py-1 text-xs text-ai hover:bg-ai-soft"
              onClick={() => send(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder="Ask about your path, your pace or a recommendation…"
            className="resize-none"
          />
          <Button size="icon" onClick={submit} aria-label="Send message">
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
