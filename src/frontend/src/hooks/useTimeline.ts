import { useCallback, useRef, useState } from "react";
import { MOCK_TIMELINE_CLIPS, type TimelineClip } from "../data/mockData";

export interface TimelineState {
  clips: TimelineClip[];
  playheadPosition: number; // in seconds
  totalDuration: number;
  zoom: number;
  isPlaying: boolean;
}

const SNAP_THRESHOLD = 0.3; // seconds

function snapToSecond(value: number): number {
  const rounded = Math.round(value);
  return Math.abs(value - rounded) < SNAP_THRESHOLD ? rounded : value;
}

export function useTimeline() {
  const [state, setState] = useState<TimelineState>({
    clips: MOCK_TIMELINE_CLIPS,
    playheadPosition: 4.25,
    totalDuration: 24,
    zoom: 1,
    isPlaying: false,
  });

  // Undo/redo stacks store previous clip arrays
  const undoStack = useRef<TimelineClip[][]>([]);
  const redoStack = useRef<TimelineClip[][]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushUndo = useCallback((prevClips: TimelineClip[]) => {
    undoStack.current.push(prevClips);
    if (undoStack.current.length > 50) undoStack.current.shift();
    redoStack.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    setState((s) => {
      redoStack.current.push(s.clips);
      setCanUndo(undoStack.current.length > 0);
      setCanRedo(true);
      return { ...s, clips: prev };
    });
  }, []);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    setState((s) => {
      undoStack.current.push(s.clips);
      setCanUndo(true);
      setCanRedo(redoStack.current.length > 0);
      return { ...s, clips: next };
    });
  }, []);

  const setPlayheadPosition = useCallback((pos: number) => {
    setState((prev) => ({
      ...prev,
      playheadPosition: Math.max(0, Math.min(pos, prev.totalDuration)),
    }));
  }, []);

  const togglePlay = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({ ...prev, zoom: Math.max(0.5, Math.min(zoom, 4)) }));
  }, []);

  const updateClipPosition = useCallback(
    (clipId: string, newStart: number) => {
      setState((prev) => {
        pushUndo(prev.clips);
        const snapped = snapToSecond(Math.max(0, newStart));
        return {
          ...prev,
          clips: prev.clips.map((c) =>
            c.id === clipId ? { ...c, start: snapped } : c,
          ),
        };
      });
    },
    [pushUndo],
  );

  const trimClip = useCallback(
    (clipId: string, newStart: number, newDuration: number) => {
      setState((prev) => {
        pushUndo(prev.clips);
        return {
          ...prev,
          clips: prev.clips.map((c) =>
            c.id === clipId
              ? {
                  ...c,
                  start: Math.max(0, newStart),
                  duration: Math.max(0.1, newDuration),
                }
              : c,
          ),
        };
      });
    },
    [pushUndo],
  );

  const deleteClip = useCallback(
    (clipId: string) => {
      setState((prev) => {
        pushUndo(prev.clips);
        return {
          ...prev,
          clips: prev.clips.filter((c) => c.id !== clipId),
        };
      });
    },
    [pushUndo],
  );

  const splitClip = useCallback(
    (clipId: string) => {
      setState((prev) => {
        const clip = prev.clips.find((c) => c.id === clipId);
        if (!clip) return prev;
        const splitPoint = prev.playheadPosition - clip.start;
        if (splitPoint <= 0 || splitPoint >= clip.duration) return prev;
        pushUndo(prev.clips);
        const clip1: TimelineClip = { ...clip, duration: splitPoint };
        const clip2: TimelineClip = {
          ...clip,
          id: `${clipId}_split_${Date.now()}`,
          start: clip.start + splitPoint,
          duration: clip.duration - splitPoint,
          label: `${clip.label} (2)`,
        };
        return {
          ...prev,
          clips: prev.clips
            .filter((c) => c.id !== clipId)
            .concat([clip1, clip2]),
        };
      });
    },
    [pushUndo],
  );

  const duplicateClip = useCallback(
    (clipId: string) => {
      setState((prev) => {
        const clip = prev.clips.find((c) => c.id === clipId);
        if (!clip) return prev;
        pushUndo(prev.clips);
        const copy: TimelineClip = {
          ...clip,
          id: `${clipId}_dup_${Date.now()}`,
          start: clip.start + clip.duration + 0.1,
          label: `${clip.label} (Copy)`,
        };
        return { ...prev, clips: [...prev.clips, copy] };
      });
    },
    [pushUndo],
  );

  return {
    state,
    setPlayheadPosition,
    togglePlay,
    setZoom,
    updateClipPosition,
    trimClip,
    deleteClip,
    splitClip,
    duplicateClip,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
