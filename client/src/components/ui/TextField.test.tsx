import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("associates the label with the input", () => {
    render(<TextField label="Your name" />);
    expect(screen.getByLabelText("Your name")).toBeInTheDocument();
  });

  it("shows an error message and marks the input invalid", () => {
    render(<TextField label="Room code" error="Please enter a valid room name." />);
    expect(screen.getByText("Please enter a valid room name.")).toBeInTheDocument();
    expect(screen.getByLabelText("Room code")).toHaveAttribute("aria-invalid", "true");
  });

  it("renders a hint when there is no error", () => {
    render(<TextField label="Room code" hint="Share this with others" />);
    expect(screen.getByText("Share this with others")).toBeInTheDocument();
  });

  it("forwards typed input", async () => {
    const onChange = vi.fn();
    render(<TextField label="Your name" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Your name"), "Mara");
    expect(onChange).toHaveBeenCalled();
  });
});
