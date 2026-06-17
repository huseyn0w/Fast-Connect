import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, LockKey, ShareNetwork, VideoCamera } from "@phosphor-icons/react";
import { SiteHeader } from "../components/SiteHeader";
import { CallPreview } from "../components/CallPreview";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { TextField } from "../components/ui/TextField";
import { generateRoomId, normaliseRoomId } from "../lib/room";
import { session } from "../lib/session";

type Dialog = "create" | "join" | null;

export function Landing() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [name, setName] = useState(session.getName());
  const [roomInput, setRoomInput] = useState("");
  const [error, setError] = useState("");

  const openCreate = () => {
    setRoomInput(generateRoomId());
    setError("");
    setDialog("create");
  };
  const openJoin = () => {
    setRoomInput("");
    setError("");
    setDialog("join");
  };

  const enterRoom = (e: FormEvent) => {
    e.preventDefault();
    const roomId = normaliseRoomId(roomInput);
    if (!name.trim()) return setError("Please enter your name.");
    if (!roomId) return setError("Please enter a valid room name.");
    session.setName(name.trim());
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteHeader />

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-12 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-0">
        {/* Value proposition + actions */}
        <motion.section
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.22em] text-aurora-soft/90">
            <span className="h-1.5 w-1.5 rounded-full bg-aurora-soft shadow-[0_0_10px] shadow-aurora-soft" />
            No app. No sign-up.
          </p>
          <h1 className="mt-5 text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.03em] text-white sm:text-6xl md:text-[4.5rem]">
            Video rooms that
            <br />
            <span className="text-aurora-soft">start instantly.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-400 [text-wrap:pretty]">
            Create a private room, share the link, and talk face to face in seconds. Screen sharing
            and chat included.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={openCreate}>
              Create a room
              <ArrowRight size={18} weight="bold" />
            </Button>
            <Button size="lg" variant="secondary" onClick={openJoin}>
              Join with a code
            </Button>
          </div>
        </motion.section>

        {/* Hero visual: a real miniature of the room UI */}
        <motion.div
          className="flex justify-center lg:justify-end"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <CallPreview />
        </motion.div>
      </main>

      {/* How it works — editorial columns split by faded hairlines, not cards */}
      <section id="how-it-works" className="mx-auto w-full max-w-6xl px-5 py-20 md:py-28">
        <div className="rule mb-14" />
        <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.02em] text-white md:text-[2.5rem]">
          Everything you need,
          <br className="hidden sm:block" /> nothing you don't.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-y-10 sm:grid-cols-3 sm:gap-y-0">
          {[
            {
              icon: <LockKey size={24} weight="light" />,
              title: "Private by default",
              body: "Rooms are ephemeral and media flows peer-to-peer through your own server, never a third party.",
            },
            {
              icon: <ShareNetwork size={24} weight="light" />,
              title: "Just share a link",
              body: "Every room is a URL. Send it and people join straight from the browser, on any device.",
            },
            {
              icon: <VideoCamera size={24} weight="light" />,
              title: "Talk and present",
              body: "Camera, microphone, screen sharing and chat all work out of the box. No setup.",
            },
          ].map((f, i) => (
            <div
              key={f.title}
              className={`px-0 sm:px-8 ${i > 0 ? "sm:border-l sm:border-white/10" : "sm:pl-0"} ${i === 2 ? "sm:pr-0" : ""}`}
            >
              <div className="text-aurora-soft">{f.icon}</div>
              <h3 className="mt-5 text-lg font-medium tracking-tight text-white">{f.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-slate-400">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto w-full max-w-6xl px-5 pb-10">
        <div className="rule mb-6" />
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Fast Connect. Built with WebRTC.
        </p>
      </footer>

      <Modal
        open={dialog !== null}
        onClose={() => setDialog(null)}
        title={dialog === "create" ? "Create a room" : "Join a room"}
        description={
          dialog === "create"
            ? "Name your room and share it, or use the suggested code."
            : "Enter the room code someone shared with you."
        }
      >
        <form onSubmit={enterRoom} className="flex flex-col gap-4">
          <TextField
            label="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mara Lindqvist"
            autoFocus
          />
          <TextField
            label="Room code"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="e.g. swift-otter-4821"
            error={error || undefined}
          />
          <Button type="submit" size="lg" className="mt-1 w-full">
            {dialog === "create" ? "Start the room" : "Join the room"}
            <ArrowRight size={18} weight="bold" />
          </Button>
        </form>
      </Modal>
    </div>
  );
}
