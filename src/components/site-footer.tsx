import { Linkedin, Globe, Github } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/60 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-background border border-primary/40 flex items-center justify-center">
              <span className="font-display text-base font-bold text-primary">
                KR
              </span>
            </div>
            <div>
              <div className="font-display text-base font-bold">
                Kalilur Rahman
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Global IT Director · Kaggle Grandmaster · CIO Next100 2022
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A scholar's complete AI prompting companion — 244 expert-grade
            prompts across 40 domains for PhD candidates, postdocs and
            independent researchers.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold text-primary uppercase tracking-wider mb-3">
            Connect
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href="https://kalilurrahman.lovable.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Globe className="w-3.5 h-3.5" /> Portfolio
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/kalilurrahman"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://github.com/kalilurrahman/kalilurrahman.github.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Github className="w-3.5 h-3.5" /> Source guide on GitHub
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-border/80 bg-background/40 p-3 text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">AI Content Notice.</strong>{" "}
            Content here is produced with the assistance of AI including large
            language models. AI can hallucinate. All prompts are a starting
            point and reference only — review and vet with qualified human
            experts before any professional use.
          </div>
          <div className="rounded-lg border border-border/80 bg-background/40 p-3 text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Not Professional Advice.</strong>{" "}
            Nothing here constitutes academic, legal, medical, financial or
            career advice. Apply your own judgement and consult qualified
            advisors in your jurisdiction before acting on AI-generated output.
          </div>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 py-4 text-[11px] text-muted-foreground flex items-center justify-between flex-wrap gap-2">
          <span>
            © {new Date().getFullYear()} Kalilur Rahman · Curated with care.
          </span>
          <span>Built with Lovable · TanStack Start · Tailwind</span>
        </div>
      </div>
    </footer>
  );
}
