import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalMedia } from "./useLocalMedia";

interface FakeTrack {
  kind: "audio" | "video";
  enabled: boolean;
  stop: ReturnType<typeof vi.fn>;
}

function fakeStream() {
  const audio: FakeTrack = { kind: "audio", enabled: true, stop: vi.fn() };
  const video: FakeTrack = { kind: "video", enabled: true, stop: vi.fn() };
  const stream = {
    getTracks: () => [audio, video],
    getAudioTracks: () => [audio],
    getVideoTracks: () => [video],
  } as unknown as MediaStream;
  return { stream, audio, video };
}

const getUserMedia = vi.fn();

beforeEach(() => {
  Object.defineProperty(navigator, "mediaDevices", {
    value: { getUserMedia },
    configurable: true,
  });
});

afterEach(() => vi.clearAllMocks());

describe("useLocalMedia", () => {
  it("exposes the acquired stream", async () => {
    const { stream } = fakeStream();
    getUserMedia.mockResolvedValue(stream);

    const { result } = renderHook(() => useLocalMedia());
    await waitFor(() => expect(result.current.stream).toBe(stream));
    expect(result.current.error).toBeNull();
  });

  it("starts with the microphone muted", async () => {
    const { stream, audio } = fakeStream();
    getUserMedia.mockResolvedValue(stream);

    const { result } = renderHook(() => useLocalMedia());
    await waitFor(() => expect(result.current.stream).toBe(stream));

    expect(result.current.audioEnabled).toBe(false);
    expect(audio.enabled).toBe(false);
  });

  it("toggles audio by flipping the track enabled flag", async () => {
    const { stream, audio } = fakeStream();
    getUserMedia.mockResolvedValue(stream);

    const { result } = renderHook(() => useLocalMedia());
    await waitFor(() => expect(result.current.stream).toBe(stream));

    // Joins muted, so the first toggle unmutes.
    act(() => result.current.toggleAudio());
    expect(result.current.audioEnabled).toBe(true);
    expect(audio.enabled).toBe(true);

    act(() => result.current.toggleAudio());
    expect(result.current.audioEnabled).toBe(false);
    expect(audio.enabled).toBe(false);
  });

  it("stops all tracks on unmount", async () => {
    const { stream, audio, video } = fakeStream();
    getUserMedia.mockResolvedValue(stream);

    const { result, unmount } = renderHook(() => useLocalMedia());
    await waitFor(() => expect(result.current.stream).toBe(stream));

    unmount();
    expect(audio.stop).toHaveBeenCalled();
    expect(video.stop).toHaveBeenCalled();
  });

  it("surfaces an error when access is denied", async () => {
    getUserMedia.mockRejectedValue(new Error("Permission denied"));

    const { result } = renderHook(() => useLocalMedia());
    await waitFor(() => expect(result.current.error).toBe("Permission denied"));
    expect(result.current.stream).toBeNull();
  });
});
