import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { Landing } from "./Landing";

const renderLanding = () =>
  render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>,
  );

afterEach(() => sessionStorage.clear());

describe("Landing", () => {
  it("renders the hero value proposition and primary actions", () => {
    renderLanding();
    expect(screen.getByRole("button", { name: /create a room/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /join with a code/i })).toBeInTheDocument();
  });

  it("opens the create dialog with a suggested room code", async () => {
    renderLanding();
    await userEvent.click(screen.getByRole("button", { name: /create a room/i }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText("Room code")).not.toHaveValue("");
  });

  it("validates an empty name before entering a room", async () => {
    renderLanding();
    await userEvent.click(screen.getByRole("button", { name: /create a room/i }));
    const dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: /start the room/i }));
    expect(screen.getByText("Please enter your name.")).toBeInTheDocument();
  });
});
