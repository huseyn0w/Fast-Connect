import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, WarningCircle } from "@phosphor-icons/react";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/Button";
import { VideoTile } from "../components/room/VideoTile";
import { ControlBar } from "../components/room/ControlBar";
import { ChatPanel } from "../components/room/ChatPanel";
import { JoinGate } from "../components/room/JoinGate";
import { ScreenStage } from "../components/room/ScreenStage";
import { useLocalMedia } from "../hooks/useLocalMedia";
import { useConference } from "../hooks/useConference";
import { session } from "../lib/session";

/** Tailwind grid columns tuned to the number of camera tiles. */
function gridCols(count: number): string {
  if (count <= 1) return "grid-cols-1";
  if (count <= 4) return "grid-cols-1 sm:grid-cols-2";
  if (count <= 9) return "grid-cols-2 lg:grid-cols-3";
  return "grid-cols-2 lg:grid-cols-4";
}

export function Room() {
  const { roomId = "" } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState(session.getName());

  if (!name) {
    return (
      <JoinGate
        roomId={roomId}
        onJoin={(n) => {
          session.setName(n);
          setName(n);
        }}
      />
    );
  }

  return <ConnectedRoom roomId={roomId} name={name} onLeave={() => navigate("/")} />;
}

function ConnectedRoom({ roomId, name, onLeave }: { roomId: string; name: string; onLeave: () => void }) {
  const media = useLocalMedia();
  const conf = useConference({ roomId, userName: name, localStream: media.stream });

  const [chatOpen, setChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [unread, setUnread] = useState(0);
  const lastSeenCount = useRef(0);

  // Track unread messages while the chat panel is closed.
  useEffect(() => {
    if (chatOpen) {
      lastSeenCount.current = conf.messages.length;
      setUnread(0);
    } else {
      setUnread(conf.messages.length - lastSeenCount.current);
    }
  }, [conf.messages.length, chatOpen]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  const tileCount = conf.participants.length + 1;
  const cols = useMemo(() => gridCols(tileCount), [tileCount]);

  if (media.error) {
    return (
      <main className="grid min-h-[100dvh] place-items-center px-4 text-center">
        <div className="glass max-w-md animate-fade-up p-8">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/15 text-rose-400">
            <WarningCircle size={26} weight="fill" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-white">Can't access your camera</h1>
          <p className="mt-2 text-sm text-slate-400">{media.error}</p>
          <p className="mt-1 text-sm text-slate-500">
            Allow camera and microphone access in your browser, then reload.
          </p>
          <Button className="mt-6" onClick={onLeave}>
            Back to home
          </Button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <Logo />
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-slate-400 sm:inline">{roomId}</span>
          <Button variant="secondary" size="sm" onClick={copyLink}>
            {copied ? <Check size={16} weight="bold" /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
      </header>

      {/* Stage */}
      <div className="flex min-h-0 flex-1 gap-3 px-3 pb-3">
        <main className="flex min-w-0 flex-1 flex-col gap-3">
          {conf.screenShare && <ScreenStage share={conf.screenShare} />}

          <div className={`grid flex-1 content-center gap-3 overflow-y-auto ${conf.screenShare ? "max-h-40 grid-flow-col auto-cols-[12rem]" : cols}`}>
            {media.stream && (
              <VideoTile stream={media.stream} name={name} muted isLocal audioOff={!media.audioEnabled} />
            )}
            {conf.participants.map((p) => (
              <VideoTile key={p.peerId} stream={p.stream} name={p.userName} />
            ))}
          </div>

          {/* Controls */}
          <div className="flex justify-center">
            <ControlBar
              audioEnabled={media.audioEnabled}
              videoEnabled={media.videoEnabled}
              isSharingScreen={conf.isSharingScreen}
              chatOpen={chatOpen}
              unreadCount={unread}
              onToggleAudio={media.toggleAudio}
              onToggleVideo={media.toggleVideo}
              onToggleScreen={conf.isSharingScreen ? conf.stopScreenShare : conf.startScreenShare}
              onToggleChat={() => setChatOpen((v) => !v)}
              onLeave={onLeave}
            />
          </div>
        </main>

        {/* Chat */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              className="absolute inset-y-3 right-3 z-20 w-[min(22rem,calc(100%-1.5rem))] lg:static lg:inset-auto lg:w-80"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <ChatPanel
                messages={conf.messages}
                selfName={name}
                onSend={conf.sendMessage}
                onClose={() => setChatOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
