import {
  Microphone,
  MicrophoneSlash,
  VideoCamera,
  VideoCameraSlash,
  Monitor,
  PhoneX,
  ChatCircle,
} from "@phosphor-icons/react";

interface ControlBarProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  isSharingScreen: boolean;
  chatOpen: boolean;
  unreadCount: number;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreen: () => void;
  onToggleChat: () => void;
  onLeave: () => void;
}

interface ControlButtonProps {
  label: string;
  active?: boolean;
  danger?: boolean;
  badge?: number;
  onClick: () => void;
  children: React.ReactNode;
}

function ControlButton({ label, active, danger, badge, onClick, children }: ControlButtonProps) {
  const tone = danger
    ? "bg-rose-500/90 text-white hover:bg-rose-500"
    : active
      ? "bg-white/[0.06] text-white hover:bg-white/[0.1]"
      : "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`relative grid h-12 w-12 place-items-center rounded-2xl transition-[transform,background-color,color] duration-150 ease-out-quint focus-ring active:scale-90 ${tone}`}
    >
      {children}
      {badge ? (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-aurora px-1 text-[10px] font-semibold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );
}

/** Bottom control dock for the call: mic, camera, screen, chat, leave. */
export function ControlBar(props: ControlBarProps) {
  const I = 22;
  return (
    <div className="glass flex items-center gap-2 p-2">
      <ControlButton label={props.audioEnabled ? "Mute microphone" : "Unmute microphone"} active={props.audioEnabled} onClick={props.onToggleAudio}>
        {props.audioEnabled ? <Microphone size={I} weight="fill" /> : <MicrophoneSlash size={I} weight="fill" />}
      </ControlButton>
      <ControlButton label={props.videoEnabled ? "Turn camera off" : "Turn camera on"} active={props.videoEnabled} onClick={props.onToggleVideo}>
        {props.videoEnabled ? <VideoCamera size={I} weight="fill" /> : <VideoCameraSlash size={I} weight="fill" />}
      </ControlButton>
      <ControlButton label={props.isSharingScreen ? "Stop sharing" : "Share screen"} active onClick={props.onToggleScreen}>
        <Monitor size={I} weight={props.isSharingScreen ? "fill" : "regular"} />
      </ControlButton>
      <ControlButton label="Toggle chat" active={props.chatOpen} badge={props.chatOpen ? 0 : props.unreadCount} onClick={props.onToggleChat}>
        <ChatCircle size={I} weight="fill" />
      </ControlButton>
      <div className="mx-1 h-8 w-px bg-white/10" />
      <ControlButton label="Leave call" danger onClick={props.onLeave}>
        <PhoneX size={I} weight="fill" />
      </ControlButton>
    </div>
  );
}
