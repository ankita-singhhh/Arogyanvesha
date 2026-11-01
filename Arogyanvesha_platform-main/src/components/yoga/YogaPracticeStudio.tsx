"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button/Button";
import type { YogaPose } from "@/components/yoga/YogaPoseCoach";
import { advanceBreath, advanceSession, appendPracticeHistory, formatCountdown, PRACTICE_HISTORY_KEY, readPracticeHistory, skipSessionStep } from "@/lib/yogaPractice.mjs";

type HistoryEntry = { id: string; title: string; durationSeconds: number; completedAt: string };
type SessionState = { stepIndex: number; phase: "pose" | "rest"; secondsRemaining: number; completed: boolean };
const EMPTY_HISTORY: HistoryEntry[] = [];

const BREATH_BASE = [{ name: "Inhale", seconds: 4, cue: "Breathe in gently through your nose." }, { name: "Exhale", seconds: 6, cue: "Let the breath leave slowly and comfortably." }];

export function YogaPracticeStudio({ poses }: { poses: YogaPose[] }) {
  const sequence = React.useMemo(() => poses.map((pose, index) => ({ ...pose, durationSeconds: index === 1 ? 30 : 40, restSeconds: index === poses.length - 1 ? 0 : 10 })), [poses]);
  const [session, setSession] = React.useState<SessionState>({ stepIndex: 0, phase: "pose", secondsRemaining: sequence[0]?.durationSeconds ?? 0, completed: false });
  const [sessionRunning, setSessionRunning] = React.useState(false);
  const [sessionElapsed, setSessionElapsed] = React.useState(0);
  const historyCache = React.useRef<{ raw: string | null; entries: HistoryEntry[] }>({ raw: null, entries: EMPTY_HISTORY });
  const subscribeHistory = React.useCallback((notify: () => void) => { window.addEventListener("arogya-yoga-history", notify); window.addEventListener("storage", notify); return () => { window.removeEventListener("arogya-yoga-history", notify); window.removeEventListener("storage", notify); }; }, []);
  const getHistorySnapshot = React.useCallback(() => { const raw = window.localStorage.getItem(PRACTICE_HISTORY_KEY); if (historyCache.current.raw === raw) return historyCache.current.entries; const entries = readPracticeHistory(window.localStorage) as HistoryEntry[]; historyCache.current = { raw, entries }; return entries; }, []);
  const history = React.useSyncExternalStore(subscribeHistory, getHistorySnapshot, () => EMPTY_HISTORY);
  const [withNaturalPause, setWithNaturalPause] = React.useState(false);
  const phases = React.useMemo(() => withNaturalPause ? [...BREATH_BASE, { name: "Natural pause", seconds: 2, cue: "Only if comfortable, allow a relaxed pause; never strain or hold your breath." }] : BREATH_BASE, [withNaturalPause]);
  const [breath, setBreath] = React.useState({ phaseIndex: 0, secondsRemaining: phases[0]!.seconds, cycles: 0 });
  const [breathRunning, setBreathRunning] = React.useState(false);

  React.useEffect(() => {
    if (!sessionRunning) return;
    const timer = window.setInterval(() => {
      setSessionElapsed((value) => value + 1);
      setSession((current) => {
        const next = advanceSession(current, sequence) as SessionState;
        if (next.completed && !current.completed) {
          setSessionRunning(false);
          const entry: HistoryEntry = { id: crypto.randomUUID(), title: "Beginner grounding flow", durationSeconds: sessionElapsed + 1, completedAt: new Date().toISOString() };
          const updated = appendPracticeHistory(history, entry) as HistoryEntry[];
          window.localStorage.setItem(PRACTICE_HISTORY_KEY, JSON.stringify(updated));
          window.dispatchEvent(new Event("arogya-yoga-history"));
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [history, sequence, sessionElapsed, sessionRunning]);
  React.useEffect(() => {
    if (!breathRunning) return;
    const timer = window.setInterval(() => setBreath((current) => advanceBreath(current, phases)), 1000);
    return () => window.clearInterval(timer);
  }, [breathRunning, phases]);

  const resetSession = () => { setSession({ stepIndex: 0, phase: "pose", secondsRemaining: sequence[0]?.durationSeconds ?? 0, completed: false }); setSessionElapsed(0); setSessionRunning(false); };
  const current = sequence[session.stepIndex];
  const breathPhase = phases[breath.phaseIndex]!;
  return <section className="mt-8 grid gap-6 xl:grid-cols-2" aria-label="Guided yoga and pranayama practice">
    <article className="rounded-3xl border border-border-default bg-surface-card p-5 sm:p-6"><p className="text-label font-semibold uppercase tracking-wider text-brand-burgundy">Guided yoga session</p><h2 className="mt-1 text-h3 font-display font-bold text-text-heading">Beginner grounding flow</h2><p className="mt-2 text-body-sm text-text-muted">Three gentle poses with short rests. Move at a comfortable range and skip anything that does not feel right.</p>
      <ol className="mt-5 space-y-2" aria-label="Pose order">{sequence.map((pose, index) => <li key={pose.id} className={`flex items-center justify-between rounded-xl px-3 py-2 text-body-sm ${index === session.stepIndex ? "bg-sage-bg font-semibold text-text-heading" : "bg-bg-subtle text-text-muted"}`}><span>{index + 1}. {pose.sanskrit} · {pose.durationSeconds}s</span>{pose.restSeconds > 0 && <span>Rest {pose.restSeconds}s</span>}</li>)}</ol>
      <div className="mt-5 rounded-2xl bg-bg-subtle p-4" aria-live="polite"><p className="text-label uppercase tracking-wider text-text-muted">{session.completed ? "Session complete" : session.phase === "rest" ? "Rest" : current?.sanskrit}</p><p className="mt-1 text-4xl font-display font-bold text-text-heading">{formatCountdown(session.secondsRemaining)}</p><p className="mt-2 text-body-sm text-text-body">{session.completed ? "Well done. Your completed practice is saved on this device." : session.phase === "rest" ? "Rest, release effort, and take an easy breath." : "Breathe steadily—do not force the shape or your breath."}</p></div>
      <div className="mt-4 flex flex-wrap gap-2">{session.completed ? <Button type="button" onClick={resetSession}>Practice again</Button> : <><Button type="button" onClick={() => setSessionRunning((value) => !value)}>{sessionRunning ? "Pause" : sessionElapsed > 0 ? "Resume" : "Start session"}</Button><Button type="button" variant="secondary" onClick={() => setSession((value) => skipSessionStep(value, sequence) as SessionState)}>Skip pose</Button><Button type="button" variant="ghost" onClick={resetSession}>End session</Button></>}</div>
    </article>
    <article className="rounded-3xl border border-border-default bg-surface-card p-5 sm:p-6"><p className="text-label font-semibold uppercase tracking-wider text-brand-burgundy">Pranayama coach</p><h2 className="mt-1 text-h3 font-display font-bold text-text-heading">Easy breathing rhythm</h2><p className="mt-2 text-body-sm text-text-muted">A gentle 4-in / 6-out rhythm. Sit supported if helpful; this is not a test of lung capacity.</p><div className={`mx-auto mt-6 flex h-44 w-44 items-center justify-center rounded-full border-8 border-brand-gold/50 bg-[#fff9e7] text-center transition-all duration-1000 ${breathRunning && breathPhase.name === "Inhale" ? "scale-110" : "scale-100"}`} aria-live="polite"><div><p className="text-h3 font-display font-bold text-text-heading">{breathPhase.name}</p><p className="text-3xl font-bold text-brand-burgundy">{formatCountdown(breath.secondsRemaining)}</p></div></div><p className="mt-5 text-center text-body-sm text-text-body">{breathPhase.cue} Completed cycles: {breath.cycles}</p>
      <label className="mt-4 flex items-start gap-2 text-body-sm text-text-body"><input type="checkbox" checked={withNaturalPause} onChange={(event) => { setWithNaturalPause(event.target.checked); setBreath({ phaseIndex: 0, secondsRemaining: 4, cycles: 0 }); }} className="mt-1 h-4 w-4 accent-[#7A1F3D]" />Include an optional, natural pause after exhaling (never forced breath retention).</label><div className="mt-4 flex flex-wrap gap-2"><Button type="button" onClick={() => setBreathRunning((value) => !value)}>{breathRunning ? "Pause" : "Start"}</Button><Button type="button" variant="secondary" onClick={() => { setBreathRunning(false); setBreath({ phaseIndex: 0, secondsRemaining: 4, cycles: 0 }); }}>Stop</Button></div>
    </article>
    <article className="rounded-3xl border border-border-default bg-surface-card p-5 sm:p-6 xl:col-span-2"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-label font-semibold uppercase tracking-wider text-brand-burgundy">Practice history</p><h2 className="mt-1 text-h3 font-display font-bold text-text-heading">This device</h2></div><p className="max-w-xl text-body-sm text-text-muted">Completed practice time is stored only in this browser. It records activity, not health outcomes or medical progress.</p></div>{history.length === 0 ? <p className="mt-4 text-body-sm text-text-muted">No completed guided sessions on this device yet.</p> : <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{history.slice(0, 6).map((entry) => <li key={entry.id} className="rounded-xl bg-bg-subtle p-4"><p className="font-semibold text-text-heading">{entry.title}</p><p className="mt-1 text-body-sm text-text-muted">{formatCountdown(entry.durationSeconds)} · {new Date(entry.completedAt).toLocaleDateString("en-IN")}</p></li>)}</ul>}</article>
    <p className="rounded-2xl border border-brand-gold/40 bg-[#fff9e7] p-4 text-body-sm text-text-body xl:col-span-2"><strong>Safety reminder:</strong> Stop and rest if you have pain, dizziness, or unusual breathlessness. Use a wall, a chair, or a smaller range of motion as needed, and seek qualified guidance for injuries, pregnancy, or health concerns.</p>
  </section>;
}
