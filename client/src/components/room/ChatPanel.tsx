import { useEffect, useRef, useState, type FormEvent } from "react";
import { PaperPlaneRight, X } from "@phosphor-icons/react";
import type { ChatMessage } from "../../lib/signaling/events";
import { Button } from "../ui/Button";

interface ChatPanelProps {
  messages: ChatMessage[];
  selfName: string;
  onSend: (text: string) => void;
  onClose: () => void;
}

const time = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function ChatPanel({ messages, selfName, onSend, onClose }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSend(draft);
    setDraft("");
  };

  return (
    <aside className="glass flex h-full w-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Chat</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-ring lg:hidden"
        >
          <X size={16} weight="bold" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-slate-500">
            No messages yet. Say hello to the room.
          </p>
        ) : (
          messages.map((m, i) => {
            const mine = m.sender === selfName;
            return (
              <div key={i} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="text-xs font-medium text-slate-300">{mine ? "You" : m.sender}</span>
                  <span className="text-[10px] text-slate-500">{time(m.sentAt)}</span>
                </div>
                <p
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-aurora/90 text-white" : "bg-white/[0.06] text-slate-200"
                  }`}
                >
                  {m.text}
                </p>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/10 p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message the room"
          aria-label="Message"
          maxLength={2000}
          className="h-10 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-white placeholder:text-slate-500 focus-ring focus-visible:border-aurora/50"
        />
        <Button type="submit" size="sm" aria-label="Send message" disabled={!draft.trim()} className="h-10 w-10 px-0">
          <PaperPlaneRight size={18} weight="fill" />
        </Button>
      </form>
    </aside>
  );
}
