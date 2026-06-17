import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Broadcast,
  Browsers,
  CaretDown,
  CheckCircle,
  Clock,
  Cloud,
  EyeSlash,
  MonitorPlay,
  ShieldCheck,
} from "@phosphor-icons/react";
import { SiteHeader } from "../components/SiteHeader";
import { CallPreview } from "../components/CallPreview";
import { HeroGlobe } from "../components/HeroGlobe";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { TextField } from "../components/ui/TextField";
import { generateRoomId, normaliseRoomId } from "../lib/room";
import { session } from "../lib/session";

type Dialog = "create" | "join" | null;

const CONTACT_EMAIL = "contact@elman.group";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PROBLEMS = [
  {
    title: "Sign-ups and downloads",
    body: "Before you can say hello, the usual tools want an account, an app install, and a cookie banner.",
  },
  {
    title: "Privacy you can't verify",
    body: "Your camera, microphone and messages flow through someone else's cloud, logged and monetised.",
  },
  {
    title: "Limits by design",
    body: "Forty-minute timers, seat caps and paywalls that interrupt the exact moment that matters.",
  },
];

const STEPS = [
  {
    title: "Create a room",
    body: "Click create. You get a private room with a shareable link, instantly. No setup, no account.",
  },
  {
    title: "Share the link",
    body: "Send the URL by chat, email or anywhere else. There are no codes to read out loud.",
  },
  {
    title: "Talk and present",
    body: "Everyone joins right in the browser. Camera, screen sharing and chat are ready to go.",
  },
];

const FEATURES = [
  {
    icon: <Broadcast size={24} weight="light" />,
    title: "Peer-to-peer mesh",
    body: "Media flows directly between participants through your own server, with no platform in the middle.",
  },
  {
    icon: <MonitorPlay size={24} weight="light" />,
    title: "Screen share & chat",
    body: "Present a tab or your whole screen, and keep a side conversation going without leaving the call.",
  },
  {
    icon: <Browsers size={24} weight="light" />,
    title: "Any browser, any device",
    body: "Works in any modern browser on desktop or mobile. Nothing to install, nothing to update.",
  },
];

const GUARANTEES = [
  {
    icon: <ShieldCheck size={20} weight="light" />,
    text: "Media is peer-to-peer and encrypted in transit (WebRTC / DTLS-SRTP).",
  },
  {
    icon: <Cloud size={20} weight="light" />,
    text: "Signaling runs on your own self-hosted server, never a third-party cloud.",
  },
  {
    icon: <Clock size={20} weight="light" />,
    text: "Rooms are ephemeral. Nothing is stored once everyone has left.",
  },
  {
    icon: <EyeSlash size={20} weight="light" />,
    text: "No accounts, no tracking pixels, no analytics. Just the call.",
  },
];

/** Section heading that gently reveals as it scrolls into view. */
function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Landing() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [name, setName] = useState(session.getName());
  const [roomInput, setRoomInput] = useState("");
  const [error, setError] = useState("");

  // Launch-notification capture (delivered via the visitor's mail client).
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadError, setLeadError] = useState("");
  const [leadSent, setLeadSent] = useState(false);

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

  const submitLead = (e: FormEvent) => {
    e.preventDefault();
    if (!leadName.trim()) return setLeadError("Please enter your name.");
    if (!EMAIL_RE.test(leadEmail.trim())) return setLeadError("Please enter a valid email.");
    const subject = encodeURIComponent("Fast Connect — notify me when it's live");
    const body = encodeURIComponent(
      `Name: ${leadName.trim()}\nEmail: ${leadEmail.trim()}\n\nPlease send me the link to try Fast Connect when it goes live.`,
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setLeadError("");
    setLeadSent(true);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteHeader />

      {/* Hero — centered over a slowly rotating dot globe */}
      <main className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden px-5 py-16">
        {/* Globe + glow stack (decorative) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute left-1/2 top-1/2 aspect-square w-[min(86vmin,760px)] -translate-x-1/2 -translate-y-1/2">
            <HeroGlobe />
          </div>
          {/* halo behind the headline so text stays legible over the globe */}
          <div className="absolute left-1/2 top-1/2 h-[42vmax] w-[42vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-aurora/10 blur-[120px]" />
          {/* feather the globe edges into the page */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(7,11,20,0.86)_78%)]" />
        </div>

        <motion.section
          className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-aurora/25 bg-aurora/[0.06] px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.22em] text-aurora-soft/90 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-aurora-soft shadow-[0_0_10px] shadow-aurora-soft" />
            No app. No sign-up.
          </p>
          <h1 className="mt-7 text-[3rem] font-semibold leading-[0.95] tracking-[-0.035em] text-white sm:text-7xl md:text-[5.25rem]">
            Video rooms that
            <br />
            <span className="bg-gradient-to-br from-aurora-soft via-aurora to-aurora-glow bg-clip-text text-transparent">
              start instantly.
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-slate-300/90 [text-wrap:pretty] sm:text-xl">
            Create a private room, share the link, and talk face to face in seconds. Screen sharing
            and chat included — peer-to-peer, with nothing to install.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={openCreate}>
              Create a room
              <ArrowRight size={18} weight="bold" />
            </Button>
            <Button size="lg" variant="secondary" onClick={openJoin}>
              Join with a code
            </Button>
          </div>
        </motion.section>

        {/* Scroll cue */}
        <motion.a
          href="#preview"
          aria-label="Scroll to see Fast Connect in action"
          className="focus-ring absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full p-2 text-slate-500 transition-colors duration-200 ease-out-quint hover:text-aurora-soft"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <CaretDown size={22} weight="bold" className={reduce ? "" : "animate-float"} />
        </motion.a>
      </main>

      {/* Product preview — copy paired with a real miniature of the room UI */}
      <section id="preview" className="mx-auto w-full max-w-6xl px-5 py-12 md:py-16">
        <div className="rule mb-12" />
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
          <Reveal>
            <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-[-0.02em] text-white md:text-[2.5rem]">
              The whole meeting,
              <br className="hidden sm:block" /> right in your browser.
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-400 [text-wrap:pretty]">
              No download, no lobby, no waiting room. Open the link and you're in — camera, mic,
              screen share and chat, exactly like this.
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {[
                "Everyone in a clean, equal grid",
                "One tap to mute, hide video or leave",
                "Speaking participants light up live",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[15px] text-slate-300">
                  <CheckCircle size={20} weight="fill" className="shrink-0 text-aurora-soft" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="flex justify-center md:justify-end">
            <CallPreview />
          </Reveal>
        </div>
      </section>

      {/* Problem — definition-list rows split by hairlines */}
      <section id="why" className="mx-auto w-full max-w-6xl px-5 py-12 md:py-16">
        <div className="rule mb-8" />
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.02em] text-white md:text-[2.5rem]">
            Most video tools get in the way.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-400 [text-wrap:pretty]">
            A quick conversation shouldn't mean installs, logins and fine print. Here's what usually
            stands between you and a simple call.
          </p>
        </Reveal>
        <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {PROBLEMS.map((p) => (
            <Reveal key={p.title}>
              <div className="grid grid-cols-1 gap-2 py-7 sm:grid-cols-[1fr_1.6fr] sm:gap-10">
                <h3 className="text-lg font-medium tracking-tight text-white">{p.title}</h3>
                <p className="text-[15px] leading-relaxed text-slate-400">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works — three sequential steps with a connecting line */}
      <section id="how-it-works" className="mx-auto w-full max-w-6xl px-5 py-12 md:py-16">
        <div className="rule mb-8" />
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.02em] text-white md:text-[2.5rem]">
            From idea to face-to-face
            <br className="hidden sm:block" /> in three steps.
          </h2>
        </Reveal>
        <div className="relative mt-14">
          {/* connector behind the step numbers (desktop only) */}
          <div className="pointer-events-none absolute inset-x-8 top-6 hidden h-px bg-gradient-to-r from-transparent via-white/12 to-transparent md:block" />
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <Reveal key={step.title}>
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-ink font-display text-lg font-semibold text-aurora-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-6 text-lg font-medium tracking-tight text-white">{step.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-slate-400">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features — light-icon columns split by faded hairlines */}
      <section id="features" className="mx-auto w-full max-w-6xl px-5 py-12 md:py-16">
        <div className="rule mb-8" />
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.02em] text-white md:text-[2.5rem]">
            Everything you need,
            <br className="hidden sm:block" /> nothing you don't.
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-y-10 sm:grid-cols-3 sm:gap-y-0">
          {FEATURES.map((f, i) => (
            <Reveal
              key={f.title}
              className={`px-0 sm:px-8 ${i > 0 ? "sm:border-l sm:border-white/10" : "sm:pl-0"} ${i === 2 ? "sm:pr-0" : ""}`}
            >
              <div className="text-aurora-soft">{f.icon}</div>
              <h3 className="mt-5 text-lg font-medium tracking-tight text-white">{f.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-slate-400">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Privacy — a single committed panel, distinct from the column sections */}
      <section id="privacy" className="mx-auto w-full max-w-6xl px-5 py-12 md:py-16">
        <Reveal>
          <div className="glass grid grid-cols-1 gap-10 p-8 md:grid-cols-[0.9fr_1.1fr] md:p-12">
            <div>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] text-white md:text-[2.5rem]">
                Private by design,
                <br /> not by promise.
              </h2>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-slate-400 [text-wrap:pretty]">
                Privacy isn't a setting you have to trust us on. It's how the app is built.
              </p>
            </div>
            <ul className="flex flex-col justify-center gap-5">
              {GUARANTEES.map((g) => (
                <li key={g.text} className="flex items-start gap-3.5">
                  <span className="mt-0.5 shrink-0 text-aurora-soft">{g.icon}</span>
                  <span className="text-[15px] leading-relaxed text-slate-300">{g.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* Launch notification capture */}
      <section id="notify" className="mx-auto w-full max-w-6xl px-5 pb-16 pt-2 md:pb-20">
        <Reveal>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] text-white md:text-[2.5rem]">
              Be the first to try it live.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-slate-400 [text-wrap:pretty]">
              Leave your name and email and we'll send you the link the moment Fast Connect goes
              live. No spam, just the one message.
            </p>

            {leadSent ? (
              <div className="mx-auto mt-10 flex max-w-md items-start gap-3 rounded-2xl border border-aurora/30 bg-aurora/[0.07] p-5 text-left">
                <CheckCircle size={24} weight="fill" className="mt-0.5 shrink-0 text-aurora-soft" />
                <p className="text-[15px] leading-relaxed text-slate-200">
                  Thanks, {leadName.trim().split(" ")[0]}! Your email app should open with a message
                  ready for us. Hit send and you're on the list.
                </p>
              </div>
            ) : (
              <form
                onSubmit={submitLead}
                noValidate
                className="mx-auto mt-10 flex max-w-md flex-col gap-4 text-left"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                    label="Full name"
                    value={leadName}
                    onChange={(e) => {
                      setLeadName(e.target.value);
                      setLeadError("");
                    }}
                    placeholder="John Doe"
                  />
                  <TextField
                    label="Email"
                    type="email"
                    value={leadEmail}
                    onChange={(e) => {
                      setLeadEmail(e.target.value);
                      setLeadError("");
                    }}
                    placeholder="you@example.com"
                    error={leadError || undefined}
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  Notify me at launch
                  <ArrowRight size={18} weight="bold" />
                </Button>
                <p className="text-center text-xs text-slate-500">
                  Opens your email app with a message to {CONTACT_EMAIL}.
                </p>
              </form>
            )}
          </div>
        </Reveal>
      </section>

      <footer className="mx-auto w-full max-w-6xl px-5 pb-10">
        <div className="rule mb-6" />
        <div className="flex flex-col items-start gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Fast Connect. Built with WebRTC.</p>
          <p>
            Crafted by{" "}
            <a
              href="https://elman.group"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-300 underline-offset-4 transition-colors duration-200 ease-out-quint hover:text-aurora-soft hover:underline focus-ring rounded-sm"
            >
              elman.group
            </a>
          </p>
        </div>
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
            placeholder="e.g. John Doe"
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
