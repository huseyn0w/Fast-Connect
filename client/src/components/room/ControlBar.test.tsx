import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ControlBar } from "./ControlBar";

function setup(overrides = {}) {
  const props = {
    audioEnabled: true,
    videoEnabled: true,
    isSharingScreen: false,
    chatOpen: false,
    unreadCount: 0,
    onToggleAudio: vi.fn(),
    onToggleVideo: vi.fn(),
    onToggleScreen: vi.fn(),
    onToggleChat: vi.fn(),
    onLeave: vi.fn(),
    ...overrides,
  };
  render(<ControlBar {...props} />);
  return props;
}

describe("ControlBar", () => {
  it("calls the matching handler for each control", async () => {
    const props = setup();
    await userEvent.click(screen.getByRole("button", { name: "Mute microphone" }));
    await userEvent.click(screen.getByRole("button", { name: "Turn camera off" }));
    await userEvent.click(screen.getByRole("button", { name: "Share screen" }));
    await userEvent.click(screen.getByRole("button", { name: "Leave call" }));
    expect(props.onToggleAudio).toHaveBeenCalledOnce();
    expect(props.onToggleVideo).toHaveBeenCalledOnce();
    expect(props.onToggleScreen).toHaveBeenCalledOnce();
    expect(props.onLeave).toHaveBeenCalledOnce();
  });

  it("reflects muted state in the labels", () => {
    setup({ audioEnabled: false, videoEnabled: false });
    expect(screen.getByRole("button", { name: "Unmute microphone" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Turn camera on" })).toBeInTheDocument();
  });

  it("shows the unread badge when chat is closed", () => {
    setup({ chatOpen: false, unreadCount: 3 });
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows 'Stop sharing' while presenting", () => {
    setup({ isSharingScreen: true });
    expect(screen.getByRole("button", { name: "Stop sharing" })).toBeInTheDocument();
  });
});
