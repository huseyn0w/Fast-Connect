import { useState, type FormEvent } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { Logo } from "../Logo";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";

interface JoinGateProps {
  roomId: string;
  onJoin: (name: string) => void;
}

/** Asks for a display name before connecting when one isn't already remembered. */
export function JoinGate({ roomId, onJoin }: JoinGateProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Please enter your name.");
    onJoin(name.trim());
  };

  return (
    <main className="grid min-h-[100dvh] place-items-center px-4">
      <div className="glass w-full max-w-sm animate-fade-up p-7">
        <Logo />
        <h1 className="mt-6 text-xl font-semibold text-white">Join the room</h1>
        <p className="mt-1 text-sm text-slate-400">
          You're about to join <span className="font-medium text-aurora-soft">{roomId}</span>.
        </p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <TextField
            label="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mara Lindqvist"
            error={error || undefined}
            autoFocus
          />
          <Button type="submit" size="lg" className="w-full">
            Join now
            <ArrowRight size={18} weight="bold" />
          </Button>
        </form>
      </div>
    </main>
  );
}
