import { useState } from "react";
import { ChevronRight, Sparkles, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  type PhdProfile,
  setOnboarded,
  setProfile,
} from "@/lib/usage-tracker";

export const STAGE_OPTIONS = [
  "Year 1 – Foundations",
  "Year 2 – Deep Research",
  "Year 3 – Writing Up",
  "Year 4+ / Submission",
  "Postdoc / Early Career",
  "Academic Staff / Supervisor",
];

export const CHALLENGE_OPTIONS = [
  "Literature Review",
  "Methodology",
  "Academic Writing",
  "Dissertation Chapters",
  "Viva Preparation",
  "Grant Writing",
  "Publishing",
  "Mental Health & Wellbeing",
  "Career & Job Market",
];

const FIELD_SUGGESTIONS = [
  "STEM",
  "Social Sciences",
  "Humanities",
  "Medicine & Health",
  "Business & Management",
  "Law",
  "Education",
  "Engineering",
  "Interdisciplinary",
];

export function OnboardingWizard({
  open,
  onClose,
  onFinish,
  allowSkip,
}: {
  open: boolean;
  onClose: () => void;
  onFinish: (profile: PhdProfile) => void;
  allowSkip: boolean;
}) {
  const [step, setStep] = useState(1);
  const [stage, setStage] = useState("");
  const [challenges, setChallenges] = useState<string[]>([]);
  const [field, setField] = useState("");

  const reset = () => {
    setStep(1);
    setStage("");
    setChallenges([]);
    setField("");
  };

  const skip = () => {
    setOnboarded(true);
    reset();
    onClose();
  };

  const finish = () => {
    const profile: PhdProfile = { stage, challenges, field: field.trim() };
    setProfile(profile);
    setOnboarded(true);
    onFinish(profile);
    reset();
    onClose();
  };

  const toggleChallenge = (c: string) => {
    setChallenges((prev) => {
      if (prev.includes(c)) return prev.filter((x) => x !== c);
      if (prev.length >= 3) return prev;
      return [...prev, c];
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        // not dismissible by clicking outside per spec — only Skip / Finish
        if (!o) return;
      }}
    >
      <DialogContent
        className="max-w-2xl w-[95vw] p-0 gap-0 bg-card"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent z-10"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-wider font-mono">
            <Sparkles className="w-4 h-4" /> PhD Journey · Step {step} of 3
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-1 flex-1 rounded-full ${n <= step ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold">
                Where are you in your PhD journey?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STAGE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStage(s)}
                    className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                      stage === s
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2">
                {allowSkip ? (
                  <button
                    type="button"
                    onClick={skip}
                    className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                  >
                    Skip for now
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  disabled={!stage}
                  onClick={() => setStep(2)}
                  className="btn-gold inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-md disabled:opacity-40"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold">
                What's your biggest challenge right now?
              </h2>
              <p className="text-xs text-muted-foreground">
                Pick up to 3 — we'll tailor your starting prompts.
              </p>
              <div className="flex flex-wrap gap-2">
                {CHALLENGE_OPTIONS.map((c) => {
                  const sel = challenges.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleChallenge(c)}
                      className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
                        sel
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={challenges.length === 0}
                  onClick={() => setStep(3)}
                  className="btn-gold inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-md disabled:opacity-40"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold">
                What's your field?
              </h2>
              <input
                type="text"
                value={field}
                onChange={(e) => setField(e.target.value)}
                placeholder="e.g. Computational Linguistics"
                className="w-full text-sm px-3 py-2 rounded-md bg-background border border-border focus:border-primary focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                {FIELD_SUGGESTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setField(f)}
                    className="px-3 py-1 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!field.trim()}
                  onClick={finish}
                  className="btn-gold inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-md disabled:opacity-40"
                >
                  Finish <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
