import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChatPanel } from "./ChatPanel";
import type { ChatMessage } from "../../lib/signaling/events";

const msg = (sender: string, text: string): ChatMessage => ({ sender, text, sentAt: Date.now() });

describe("ChatPanel", () => {
  it("shows an empty state with no messages", () => {
    render(<ChatPanel messages={[]} selfName="Ann" onSend={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText(/No messages yet/i)).toBeInTheDocument();
  });

  it("labels the current user's messages as 'You'", () => {
    render(
      <ChatPanel
        messages={[msg("Ann", "hi"), msg("Bob", "hey")]}
        selfName="Ann"
        onSend={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("sends and clears the draft on submit", async () => {
    const onSend = vi.fn();
    render(<ChatPanel messages={[]} selfName="Ann" onSend={onSend} onClose={vi.fn()} />);
    const input = screen.getByLabelText("Message");
    await userEvent.type(input, "hello there");
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(onSend).toHaveBeenCalledWith("hello there");
    expect(input).toHaveValue("");
  });
});
