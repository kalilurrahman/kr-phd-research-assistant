import rawData from "./phd-prompts.json";

export type PromptBadge = "advanced" | "intermediate" | "foundational";

export interface PhdPrompt {
  num: string;
  title: string;
  badge: PromptBadge;
  useCase: string;
  vars: string[];
  frameworks: string;
  output: string;
  tip: string;
  prompt: string;
}

export interface PhdSection {
  id: string;
  colorHex: string;
  dim: string;
  border: string;
  icon: string;
  label: string;
  meta: string;
  prompts: PhdPrompt[];
}

type RawSection = Omit<PhdSection, "id" | "meta"> & { meta?: string };

export type SectionGroupKey = "general" | "phd" | "methods" | "bonus" | "bonus2";

export interface SectionGroup {
  key: SectionGroupKey;
  label: string;
  accent: string;
  sectionIds: string[];
}

const baseSections: PhdSection[] = Object.entries(
  rawData as unknown as Record<string, RawSection>,
).map(([id, value]) => ({
  id,
  ...value,
  meta: value.meta ?? `${value.prompts.length} prompts`,
}));

// Bonus domain — KR-curated extension prompts on top of the 236 imported ones.
const bonusSection: PhdSection = {
  id: "s40",
  colorHex: "#F59E0B",
  dim: "rgba(245,158,11,0.10)",
  border: "rgba(245,158,11,0.32)",
  icon: "✨",
  label: "AI-Augmented Scholarship (KR Bonus)",
  meta: "8 prompts",
  prompts: [
    {
      num: "237",
      title: "AI Co-Author Disclosure Architect",
      badge: "advanced",
      useCase:
        "Draft a transparent, journal-compliant statement describing how AI tools were used in your research and writing.",
      vars: ["JOURNAL", "AI_TOOLS_USED", "TASKS_PERFORMED", "HUMAN_OVERSIGHT"],
      frameworks:
        "COPE author guidance; ICMJE statements; Nature/Elsevier/Springer AI policies; CRediT taxonomy",
      output:
        "Camera-ready AI-use disclosure paragraph with method-level granularity, oversight description, and reviewer-anticipation notes.",
      tip: "List every AI tool by name and version, and the exact stage it touched — vague disclosures get rejected.",
      prompt:
        "You are an AI Co-Author Disclosure Architect. For journal [JOURNAL], with AI tools [AI_TOOLS_USED] used for tasks [TASKS_PERFORMED] under human oversight [HUMAN_OVERSIGHT], draft a transparent, policy-compliant disclosure section. Specify model versions, prompts saved, decisions made by humans, and how originality and accountability were preserved.",
    },
    {
      num: "238",
      title: "Reproducibility Package Architect",
      badge: "advanced",
      useCase:
        "Design a complete reproducibility bundle (code, data, environment, README) that meets ACM/Nature standards.",
      vars: ["STUDY_TYPE", "ARTIFACTS", "PLATFORM", "TARGET_BADGE"],
      frameworks:
        "ACM Artifact Review badges; Nature Code & Software policy; FAIR principles; Docker/Singularity; Binder",
      output:
        "Reproducibility package blueprint with directory layout, environment lockfile strategy, runbook, validation tests, and badge-application checklist.",
      tip: "Pin every dependency by hash and ship a one-command runner — reviewers will not debug your environment.",
      prompt:
        "You are a Reproducibility Package Architect. For a [STUDY_TYPE] study with artifacts [ARTIFACTS] running on [PLATFORM], targeting badge [TARGET_BADGE], design a full reproducibility bundle: directory layout, dependency lockfile, container recipe, deterministic seeds, validation script, README walk-through, and DOI-minting plan.",
    },
    {
      num: "239",
      title: "Pre-Registration Coach",
      badge: "advanced",
      useCase:
        "Write a tight, OSF-quality pre-registration that locks hypotheses, design and analysis plan before data collection.",
      vars: ["RESEARCH_QUESTION", "DESIGN", "ANALYSIS_PLAN", "STOPPING_RULE"],
      frameworks:
        "OSF pre-registration; AsPredicted; Registered Reports; Bayesian sequential design; Multiverse analysis",
      output:
        "Pre-registration draft with falsifiable hypotheses, exact analysis pipeline, contingency rules, and deviation-reporting protocol.",
      tip: "Specify your stopping rule and how you will report any deviation — that is what reviewers actually scrutinise.",
      prompt:
        "You are a Pre-Registration Coach. For research question [RESEARCH_QUESTION], with design [DESIGN], analysis plan [ANALYSIS_PLAN], and stopping rule [STOPPING_RULE], produce an OSF-grade pre-registration. Lock hypotheses, sampling, exclusion rules, primary and secondary analyses, robustness checks, and a transparent deviation log template.",
    },
    {
      num: "240",
      title: "Responsible AI Research Reviewer",
      badge: "advanced",
      useCase:
        "Audit your study for bias, fairness, dual-use risk and societal impact before submission.",
      vars: ["STUDY", "DATASET", "MODEL_OR_METHOD", "DEPLOYMENT_CONTEXT"],
      frameworks:
        "NIST AI RMF; EU AI Act risk tiers; Datasheets for Datasets; Model Cards; Stochastic parrots critique",
      output:
        "Responsible-AI audit with risk register, fairness metrics, mitigation plan, and a dual-use impact statement ready for ethics review.",
      tip: "Name affected populations explicitly — generic 'users' framing hides the most serious harms.",
      prompt:
        "You are a Responsible AI Research Reviewer. For study [STUDY] using dataset [DATASET] and method [MODEL_OR_METHOD] in deployment context [DEPLOYMENT_CONTEXT], audit for bias, fairness, privacy, dual-use, and societal harm. Produce a risk register, mitigation plan, model card, and an ethics-board-ready impact statement.",
    },
    {
      num: "241",
      title: "Cross-Disciplinary Bridge Builder",
      badge: "intermediate",
      useCase:
        "Translate concepts, methods and notation between fields so collaborators on different teams stay aligned.",
      vars: ["FIELD_A", "FIELD_B", "SHARED_PROBLEM"],
      frameworks:
        "Boundary objects; Trading zones; Concept mapping; Glossary harmonisation",
      output:
        "Bilingual concept map with shared glossary, method-equivalence table, and a one-page brief each side can hand to their PI.",
      tip: "Start by listing the three terms each field uses differently — that is where collaborations actually break.",
      prompt:
        "You are a Cross-Disciplinary Bridge Builder. Between [FIELD_A] and [FIELD_B], working on shared problem [SHARED_PROBLEM], create a bilingual glossary, map equivalent methods, surface conflicting assumptions, and produce a one-page brief each discipline can use to align objectives, terminology, and success criteria.",
    },
    {
      num: "242",
      title: "Conference Talk and Keynote Architect",
      badge: "intermediate",
      useCase:
        "Convert dense research into a memorable 15-minute talk with one big idea, three supporting acts and a clear call to action.",
      vars: ["RESEARCH", "AUDIENCE", "DURATION", "VENUE"],
      frameworks:
        "Three-act structure; Pyramid principle; Assertion-Evidence slides; Story spine; Q&A handling",
      output:
        "Talk outline with hook, narrative arc, slide-by-slide notes, anticipated Q&A and a polished closing call to action.",
      tip: "Open with the single sentence you want the audience to remember tomorrow — then earn it backwards.",
      prompt:
        "You are a Conference Talk Architect. For research [RESEARCH], audience [AUDIENCE], duration [DURATION], venue [VENUE], craft a memorable talk: one-line core message, three-act narrative, assertion-evidence slide outline, transitions, anticipated Q&A, and a closing call to action that drives citations and collaboration.",
    },
    {
      num: "243",
      title: "Academic Brand and Visibility Strategist",
      badge: "intermediate",
      useCase:
        "Build a coherent online scholarly presence across Google Scholar, ORCID, ResearchGate and LinkedIn.",
      vars: ["CAREER_STAGE", "FIELD", "GOALS", "TIME_BUDGET"],
      frameworks:
        "Personal brand canvas; H-index hygiene; Altmetrics; Content cadence; Profile-platform fit",
      output:
        "12-week visibility plan with profile-by-profile checklist, content calendar and metrics to track impact responsibly.",
      tip: "Pick two platforms to do well rather than five mediocre — discoverability beats noise.",
      prompt:
        "You are an Academic Brand Strategist. For a researcher at [CAREER_STAGE] in [FIELD] with goals [GOALS] and weekly time budget [TIME_BUDGET], design a 12-week visibility plan: profile audit (Scholar, ORCID, LinkedIn, ResearchGate), content cadence, talk and review opportunities, network expansion, and ethical impact metrics.",
    },
    {
      num: "244",
      title: "PhD Wellbeing and Sustainable Pace Coach",
      badge: "foundational",
      useCase:
        "Build a humane weekly cadence that protects deep work, recovery and relationships through a multi-year program.",
      vars: ["CURRENT_LOAD", "PEAK_HOURS", "CONSTRAINTS", "SUPPORT_SYSTEM"],
      frameworks:
        "Energy management; Deep Work; Pomodoro and timeboxing; Burnout-prevention checklists; Imposter-syndrome reframing",
      output:
        "Weekly template with deep-work blocks, recovery rituals, social anchors, and a quarterly check-in to recalibrate.",
      tip: "Schedule rest before output — calendars without recovery blocks always overrun.",
      prompt:
        "You are a PhD Wellbeing Coach. For a researcher with current load [CURRENT_LOAD], peak hours [PEAK_HOURS], constraints [CONSTRAINTS], and support [SUPPORT_SYSTEM], design a sustainable weekly cadence with deep-work blocks, recovery rituals, social anchors, burnout early-warning signs, and a quarterly recalibration ritual.",
    },
  ],
};


// KR Bonus II — 50 additional curated prompts (advanced research operations).
const bonusSection2: PhdSection = {
  id: "s41",
  colorHex: "#A78BFA",
  dim: "rgba(167,139,250,0.10)",
  border: "rgba(167,139,250,0.32)",
  icon: "🧭",
  label: "Advanced Research Operations (KR Bonus II)",
  meta: "50 prompts",
  prompts: [
    {
        "num": "245",
        "title": "Theory of Change Architect",
        "badge": "advanced",
        "useCase": "Design a rigorous theory of change linking inputs, activities, outputs, outcomes, and long-term impact for a research program.",
        "vars": [
            "PROGRAM",
            "CONTEXT",
            "STAKEHOLDERS",
            "TIMEFRAME"
        ],
        "frameworks": "Theory of Change; Logic models; Outcome harvesting; Contribution analysis",
        "output": "ToC diagram description, assumption register, indicator set, and risk-adjusted impact pathway.",
        "tip": "Make every causal arrow falsifiable — name the assumption that, if wrong, breaks the chain.",
        "prompt": "You are a Theory of Change Architect. Working with inputs [PROGRAM], [CONTEXT], [STAKEHOLDERS], [TIMEFRAME], deliver: ToC diagram description, assumption register, indicator set, and risk-adjusted impact pathway. Apply Theory of Change; Logic models; Outcome harvesting; Contribution analysis. Make every causal arrow falsifiable — name the assumption that, if wrong, breaks the chain."
    },
    {
        "num": "246",
        "title": "Causal Inference Strategist",
        "badge": "advanced",
        "useCase": "Pick the right causal identification strategy (DAGs, IVs, RDD, DiD, synthetic control) for an observational question.",
        "vars": [
            "QUESTION",
            "DATA",
            "CONFOUNDERS",
            "ASSIGNMENT"
        ],
        "frameworks": "Pearl DAGs; Rubin causal model; DiD; RDD; Synthetic control; Instrumental variables",
        "output": "Identification strategy memo with DAG, threats to validity, robustness checks, and sensitivity bounds.",
        "tip": "Draw the DAG before touching the data — the picture exposes which estimators are even admissible.",
        "prompt": "You are a Causal Inference Strategist. Working with inputs [QUESTION], [DATA], [CONFOUNDERS], [ASSIGNMENT], deliver: Identification strategy memo with DAG, threats to validity, robustness checks, and sensitivity bounds. Apply Pearl DAGs; Rubin causal model; DiD; RDD; Synthetic control; Instrumental variables. Draw the DAG before touching the data — the picture exposes which estimators are even admissible."
    },
    {
        "num": "247",
        "title": "Bayesian Workflow Mentor",
        "badge": "advanced",
        "useCase": "Build a principled Bayesian workflow from prior elicitation through posterior predictive checks.",
        "vars": [
            "MODEL",
            "DATA",
            "PRIORS",
            "DECISION"
        ],
        "frameworks": "Gelman Bayesian workflow; Stan/PyMC; LOO-CV; Posterior predictive checks",
        "output": "End-to-end workflow: prior predictive sims, model fits, diagnostics, model comparison, and decision report.",
        "tip": "Run prior predictive checks before seeing data — it surfaces nonsensical priors cheaply.",
        "prompt": "You are a Bayesian Workflow Mentor. Working with inputs [MODEL], [DATA], [PRIORS], [DECISION], deliver: End-to-end workflow: prior predictive sims, model fits, diagnostics, model comparison, and decision report. Apply Gelman Bayesian workflow; Stan/PyMC; LOO-CV; Posterior predictive checks. Run prior predictive checks before seeing data — it surfaces nonsensical priors cheaply."
    },
    {
        "num": "248",
        "title": "Power and Sample Size Planner",
        "badge": "advanced",
        "useCase": "Plan sample size with power, MDE and design effects for complex studies including clusters and repeated measures.",
        "vars": [
            "DESIGN",
            "EFFECT",
            "ALPHA",
            "CLUSTERING"
        ],
        "frameworks": "G*Power; simr; Optimal design; Cluster-randomized trials; MDE framing",
        "output": "Power analysis report with assumptions table, sensitivity curves, and minimum detectable effect.",
        "tip": "Always report power against the smallest effect of interest, not the effect you hope to find.",
        "prompt": "You are a Power and Sample Size Planner. Working with inputs [DESIGN], [EFFECT], [ALPHA], [CLUSTERING], deliver: Power analysis report with assumptions table, sensitivity curves, and minimum detectable effect. Apply G*Power; simr; Optimal design; Cluster-randomized trials; MDE framing. Always report power against the smallest effect of interest, not the effect you hope to find."
    },
    {
        "num": "249",
        "title": "Measurement and Construct Validation Coach",
        "badge": "advanced",
        "useCase": "Develop and validate a measurement instrument with content, construct, and criterion validity evidence.",
        "vars": [
            "CONSTRUCT",
            "POPULATION",
            "ITEMS",
            "CRITERION"
        ],
        "frameworks": "Messick validity framework; CTT; IRT; CFA; Cognitive interviews",
        "output": "Validation plan with item-development log, pilot results, factor structure, and reliability coefficients.",
        "tip": "Cognitive interviews catch wording problems that no statistic can rescue later.",
        "prompt": "You are a Measurement and Construct Validation Coach. Working with inputs [CONSTRUCT], [POPULATION], [ITEMS], [CRITERION], deliver: Validation plan with item-development log, pilot results, factor structure, and reliability coefficients. Apply Messick validity framework; CTT; IRT; CFA; Cognitive interviews. Cognitive interviews catch wording problems that no statistic can rescue later."
    },
    {
        "num": "250",
        "title": "Mixed-Methods Integration Designer",
        "badge": "advanced",
        "useCase": "Architect convergent, explanatory or exploratory mixed-methods designs with explicit integration points.",
        "vars": [
            "PURPOSE",
            "STRANDS",
            "INTEGRATION",
            "TIMING"
        ],
        "frameworks": "Creswell typology; Joint displays; Pillar integration; Meta-inferences",
        "output": "Design diagram with strand specs, integration matrix, joint-display sketches, and meta-inference plan.",
        "tip": "Decide the integration point before data collection — bolted-on integration almost never convinces reviewers.",
        "prompt": "You are a Mixed-Methods Integration Designer. Working with inputs [PURPOSE], [STRANDS], [INTEGRATION], [TIMING], deliver: Design diagram with strand specs, integration matrix, joint-display sketches, and meta-inference plan. Apply Creswell typology; Joint displays; Pillar integration; Meta-inferences. Decide the integration point before data collection — bolted-on integration almost never convinces reviewers."
    },
    {
        "num": "251",
        "title": "Qualitative Coding Architect",
        "badge": "advanced",
        "useCase": "Build a defensible coding scheme with intercoder reliability and audit trail.",
        "vars": [
            "DATA",
            "RQ",
            "PARADIGM",
            "TEAM"
        ],
        "frameworks": "Saldaña coding methods; Thematic analysis; Reflexive TA; Kappa/Krippendorff; CAQDAS",
        "output": "Codebook v1 with definitions, exemplars, decision rules, IRR plan, and reflexive memos.",
        "tip": "Pilot the codebook on 10% of data and recompute IRR before the full pass — saves weeks.",
        "prompt": "You are a Qualitative Coding Architect. Working with inputs [DATA], [RQ], [PARADIGM], [TEAM], deliver: Codebook v1 with definitions, exemplars, decision rules, IRR plan, and reflexive memos. Apply Saldaña coding methods; Thematic analysis; Reflexive TA; Kappa/Krippendorff; CAQDAS. Pilot the codebook on 10% of data and recompute IRR before the full pass — saves weeks."
    },
    {
        "num": "252",
        "title": "Ethnographic Fieldwork Strategist",
        "badge": "advanced",
        "useCase": "Plan an immersive fieldwork engagement with access, positionality and exit strategy.",
        "vars": [
            "SITE",
            "DURATION",
            "ACCESS",
            "ETHICS"
        ],
        "frameworks": "Spradley; Geertz thick description; Reflexive ethnography; Field-note protocols",
        "output": "Fieldwork plan with access script, positionality memo, observation rubric, and exit strategy.",
        "tip": "Write your positionality memo on day one and revise quarterly — it is data, not paperwork.",
        "prompt": "You are a Ethnographic Fieldwork Strategist. Working with inputs [SITE], [DURATION], [ACCESS], [ETHICS], deliver: Fieldwork plan with access script, positionality memo, observation rubric, and exit strategy. Apply Spradley; Geertz thick description; Reflexive ethnography; Field-note protocols. Write your positionality memo on day one and revise quarterly — it is data, not paperwork."
    },
    {
        "num": "253",
        "title": "Discourse Analysis Specialist",
        "badge": "advanced",
        "useCase": "Apply Foucauldian, CDA or conversation analysis to texts and talk with replicable steps.",
        "vars": [
            "CORPUS",
            "TRADITION",
            "RQ",
            "UNIT"
        ],
        "frameworks": "Fairclough CDA; Foucauldian DA; Conversation analysis; Multimodal DA",
        "output": "Analytic protocol with unit-of-analysis, transcription conventions, coding logic and exemplar reading.",
        "tip": "Pick one tradition and stick to it — eclectic discourse analysis usually reads as undisciplined.",
        "prompt": "You are a Discourse Analysis Specialist. Working with inputs [CORPUS], [TRADITION], [RQ], [UNIT], deliver: Analytic protocol with unit-of-analysis, transcription conventions, coding logic and exemplar reading. Apply Fairclough CDA; Foucauldian DA; Conversation analysis; Multimodal DA. Pick one tradition and stick to it — eclectic discourse analysis usually reads as undisciplined."
    },
    {
        "num": "254",
        "title": "Systematic Review and Meta-Analysis Architect",
        "badge": "advanced",
        "useCase": "Plan a PRISMA-2020 systematic review with meta-analysis or narrative synthesis.",
        "vars": [
            "QUESTION",
            "DATABASES",
            "INCLUSION",
            "OUTCOMES"
        ],
        "frameworks": "PRISMA 2020; PROSPERO; Cochrane handbook; ROBINS; PICO",
        "output": "Protocol with PICO, search strings, screening flow, risk-of-bias plan, and synthesis approach.",
        "tip": "Register on PROSPERO before screening — peer reviewers now check this routinely.",
        "prompt": "You are a Systematic Review and Meta-Analysis Architect. Working with inputs [QUESTION], [DATABASES], [INCLUSION], [OUTCOMES], deliver: Protocol with PICO, search strings, screening flow, risk-of-bias plan, and synthesis approach. Apply PRISMA 2020; PROSPERO; Cochrane handbook; ROBINS; PICO. Register on PROSPERO before screening — peer reviewers now check this routinely."
    },
    {
        "num": "255",
        "title": "Scoping Review Designer",
        "badge": "intermediate",
        "useCase": "Design a JBI-style scoping review to map evidence in an emerging area.",
        "vars": [
            "TOPIC",
            "CONCEPT",
            "CONTEXT",
            "SOURCES"
        ],
        "frameworks": "Arksey & O'Malley; JBI scoping review; PCC framework",
        "output": "Scoping protocol with PCC, charting form, stakeholder consultation, and reporting plan.",
        "tip": "Use a scoping review when you need a map, not a verdict — and say so explicitly in the rationale.",
        "prompt": "You are a Scoping Review Designer. Working with inputs [TOPIC], [CONCEPT], [CONTEXT], [SOURCES], deliver: Scoping protocol with PCC, charting form, stakeholder consultation, and reporting plan. Apply Arksey & O'Malley; JBI scoping review; PCC framework. Use a scoping review when you need a map, not a verdict — and say so explicitly in the rationale."
    },
    {
        "num": "256",
        "title": "Realist Synthesis Coach",
        "badge": "advanced",
        "useCase": "Run a realist review to explain what works for whom, in what circumstances and why.",
        "vars": [
            "INTERVENTION",
            "CONTEXT",
            "MECHANISM",
            "OUTCOME"
        ],
        "frameworks": "Pawson & Tilley; CMO configurations; RAMESES standards",
        "output": "Realist protocol with initial program theory, CMO configurations, and refinement plan.",
        "tip": "Articulate the initial program theory upfront — realist reviews live or die on its quality.",
        "prompt": "You are a Realist Synthesis Coach. Working with inputs [INTERVENTION], [CONTEXT], [MECHANISM], [OUTCOME], deliver: Realist protocol with initial program theory, CMO configurations, and refinement plan. Apply Pawson & Tilley; CMO configurations; RAMESES standards. Articulate the initial program theory upfront — realist reviews live or die on its quality."
    },
    {
        "num": "257",
        "title": "Data Management Plan Architect",
        "badge": "advanced",
        "useCase": "Author a funder-grade DMP covering FAIR, sensitive data, retention and sharing.",
        "vars": [
            "FUNDER",
            "DATA_TYPES",
            "SENSITIVITY",
            "REPOSITORY"
        ],
        "frameworks": "FAIR; DCC DMP; H2020/UKRI templates; ALCOA+",
        "output": "DMP with data inventory, metadata standards, access tiers, retention schedule, and sharing plan.",
        "tip": "Name the repository and DOI strategy explicitly — vague 'available on request' lines fail audits.",
        "prompt": "You are a Data Management Plan Architect. Working with inputs [FUNDER], [DATA_TYPES], [SENSITIVITY], [REPOSITORY], deliver: DMP with data inventory, metadata standards, access tiers, retention schedule, and sharing plan. Apply FAIR; DCC DMP; H2020/UKRI templates; ALCOA+. Name the repository and DOI strategy explicitly — vague 'available on request' lines fail audits."
    },
    {
        "num": "258",
        "title": "Open Science Transition Coach",
        "badge": "intermediate",
        "useCase": "Migrate a closed project to open code, open data and open access without breaching ethics.",
        "vars": [
            "PROJECT",
            "CONSTRAINTS",
            "STAKEHOLDERS",
            "BUDGET"
        ],
        "frameworks": "FAIR; TOP guidelines; OSF; Zenodo; Diamond OA",
        "output": "Migration plan with licence map, anonymisation steps, repository choices, and OA route per output.",
        "tip": "Default to the most open licence the data permits — restrictive licences age badly.",
        "prompt": "You are a Open Science Transition Coach. Working with inputs [PROJECT], [CONSTRAINTS], [STAKEHOLDERS], [BUDGET], deliver: Migration plan with licence map, anonymisation steps, repository choices, and OA route per output. Apply FAIR; TOP guidelines; OSF; Zenodo; Diamond OA. Default to the most open licence the data permits — restrictive licences age badly."
    },
    {
        "num": "259",
        "title": "Research Software Engineering Mentor",
        "badge": "advanced",
        "useCase": "Apply RSE practices: testing, CI, packaging, semantic versioning, and citation.",
        "vars": [
            "LANGUAGE",
            "ARTIFACT",
            "USERS",
            "LIFECYCLE"
        ],
        "frameworks": "Software Sustainability Institute; CITATION.cff; SemVer; CI/CD; Containerisation",
        "output": "Engineering plan with repo layout, test strategy, CI matrix, release flow, and citation file.",
        "tip": "A failing test on day one beats a perfect README on day one hundred.",
        "prompt": "You are a Research Software Engineering Mentor. Working with inputs [LANGUAGE], [ARTIFACT], [USERS], [LIFECYCLE], deliver: Engineering plan with repo layout, test strategy, CI matrix, release flow, and citation file. Apply Software Sustainability Institute; CITATION.cff; SemVer; CI/CD; Containerisation. A failing test on day one beats a perfect README on day one hundred."
    },
    {
        "num": "260",
        "title": "Computational Notebook Hygiene Coach",
        "badge": "intermediate",
        "useCase": "Refactor messy notebooks into reproducible, reviewed analytical artifacts.",
        "vars": [
            "NOTEBOOK",
            "DATA",
            "DEPENDENCIES",
            "AUDIENCE"
        ],
        "frameworks": "Joel Grus critiques; nbdev; Quarto; Papermill; Jupytext",
        "output": "Refactor plan with cell-tagging, parameterisation, environment lock, and review checklist.",
        "tip": "Treat notebooks as drafts — promote stable analyses into modules and tests.",
        "prompt": "You are a Computational Notebook Hygiene Coach. Working with inputs [NOTEBOOK], [DATA], [DEPENDENCIES], [AUDIENCE], deliver: Refactor plan with cell-tagging, parameterisation, environment lock, and review checklist. Apply Joel Grus critiques; nbdev; Quarto; Papermill; Jupytext. Treat notebooks as drafts — promote stable analyses into modules and tests."
    },
    {
        "num": "261",
        "title": "Ethics Application Coach",
        "badge": "advanced",
        "useCase": "Draft an IRB/ethics committee application that anticipates reviewer concerns.",
        "vars": [
            "STUDY",
            "POPULATION",
            "RISKS",
            "CONSENT"
        ],
        "frameworks": "Belmont; Helsinki; GDPR; Common Rule; IRB checklists",
        "output": "Application draft with risk-benefit analysis, consent forms, data-handling plan, and reviewer FAQ.",
        "tip": "Name the worst-case scenario and your mitigation — silence on it is the top reviewer trigger.",
        "prompt": "You are a Ethics Application Coach. Working with inputs [STUDY], [POPULATION], [RISKS], [CONSENT], deliver: Application draft with risk-benefit analysis, consent forms, data-handling plan, and reviewer FAQ. Apply Belmont; Helsinki; GDPR; Common Rule; IRB checklists. Name the worst-case scenario and your mitigation — silence on it is the top reviewer trigger."
    },
    {
        "num": "262",
        "title": "Informed Consent Co-Designer",
        "badge": "intermediate",
        "useCase": "Co-design accessible consent materials with the participant community.",
        "vars": [
            "POPULATION",
            "STUDY",
            "LITERACY",
            "LANGUAGES"
        ],
        "frameworks": "Plain language summaries; Teach-back method; Community advisory boards",
        "output": "Consent suite: short form, long form, oral script, comprehension check, and translation plan.",
        "tip": "Run a teach-back with three participants before submitting — wording fails surface fast.",
        "prompt": "You are a Informed Consent Co-Designer. Working with inputs [POPULATION], [STUDY], [LITERACY], [LANGUAGES], deliver: Consent suite: short form, long form, oral script, comprehension check, and translation plan. Apply Plain language summaries; Teach-back method; Community advisory boards. Run a teach-back with three participants before submitting — wording fails surface fast."
    },
    {
        "num": "263",
        "title": "Vulnerable Populations Research Strategist",
        "badge": "advanced",
        "useCase": "Design ethical, trauma-informed research with vulnerable groups.",
        "vars": [
            "POPULATION",
            "TOPIC",
            "CONTEXT",
            "SAFEGUARDS"
        ],
        "frameworks": "Trauma-informed research; Community-based participatory research; Safeguarding policies",
        "output": "Strategy with risk register, safeguarding protocol, distress pathway, and participant compensation policy.",
        "tip": "Plan distress and disclosure pathways before recruiting — never improvise these in the field.",
        "prompt": "You are a Vulnerable Populations Research Strategist. Working with inputs [POPULATION], [TOPIC], [CONTEXT], [SAFEGUARDS], deliver: Strategy with risk register, safeguarding protocol, distress pathway, and participant compensation policy. Apply Trauma-informed research; Community-based participatory research; Safeguarding policies. Plan distress and disclosure pathways before recruiting — never improvise these in the field."
    },
    {
        "num": "264",
        "title": "Indigenous Research Ethics Companion",
        "badge": "advanced",
        "useCase": "Apply CARE and OCAP principles when working with Indigenous communities and data.",
        "vars": [
            "COMMUNITY",
            "TOPIC",
            "GOVERNANCE",
            "BENEFITS"
        ],
        "frameworks": "CARE Principles; OCAP; FPIC; Two-Eyed Seeing",
        "output": "Engagement plan with governance agreement, data sovereignty terms, and benefit-sharing arrangement.",
        "tip": "Begin with relationship, not recruitment — the timeline must reflect that.",
        "prompt": "You are a Indigenous Research Ethics Companion. Working with inputs [COMMUNITY], [TOPIC], [GOVERNANCE], [BENEFITS], deliver: Engagement plan with governance agreement, data sovereignty terms, and benefit-sharing arrangement. Apply CARE Principles; OCAP; FPIC; Two-Eyed Seeing. Begin with relationship, not recruitment — the timeline must reflect that."
    },
    {
        "num": "265",
        "title": "Grant Proposal Storyteller",
        "badge": "advanced",
        "useCase": "Translate a research idea into a fundable narrative with significance, innovation, approach.",
        "vars": [
            "FUNDER",
            "CALL",
            "PI_PROFILE",
            "BUDGET"
        ],
        "frameworks": "NIH/NSF/UKRI/ERC frameworks; Logic models; Heilmeier catechism",
        "output": "Proposal outline with hook, significance, innovation, approach, milestones, and risk plan.",
        "tip": "Run the Heilmeier questions on draft one — answers reveal which sections need more work.",
        "prompt": "You are a Grant Proposal Storyteller. Working with inputs [FUNDER], [CALL], [PI_PROFILE], [BUDGET], deliver: Proposal outline with hook, significance, innovation, approach, milestones, and risk plan. Apply NIH/NSF/UKRI/ERC frameworks; Logic models; Heilmeier catechism. Run the Heilmeier questions on draft one — answers reveal which sections need more work."
    },
    {
        "num": "266",
        "title": "Fellowship Application Coach",
        "badge": "advanced",
        "useCase": "Craft a Marie Curie/NSF GRFP/Rhodes-grade fellowship application that wins on fit.",
        "vars": [
            "FELLOWSHIP",
            "STAGE",
            "FIELD",
            "TRAJECTORY"
        ],
        "frameworks": "Personal statement frameworks; Two-body problem; Mentorship plan templates",
        "output": "Application kit: research plan, personal statement, mentorship plan, broader impacts, and CV pivots.",
        "tip": "Tell one story across all documents — committees notice when the narrative drifts.",
        "prompt": "You are a Fellowship Application Coach. Working with inputs [FELLOWSHIP], [STAGE], [FIELD], [TRAJECTORY], deliver: Application kit: research plan, personal statement, mentorship plan, broader impacts, and CV pivots. Apply Personal statement frameworks; Two-body problem; Mentorship plan templates. Tell one story across all documents — committees notice when the narrative drifts."
    },
    {
        "num": "267",
        "title": "Industry-Academic Partnership Architect",
        "badge": "intermediate",
        "useCase": "Set up a research collaboration with industry that protects IP, publication and timelines.",
        "vars": [
            "PARTNER",
            "PROJECT",
            "IP",
            "TIMELINE"
        ],
        "frameworks": "NDA / MTA / Sponsored research agreements; Bayh-Dole; Background vs Foreground IP",
        "output": "Partnership plan with governance, milestone schedule, IP terms, and publication-embargo policy.",
        "tip": "Negotiate publication rights before scope — IP terms are useless without the right to publish.",
        "prompt": "You are a Industry-Academic Partnership Architect. Working with inputs [PARTNER], [PROJECT], [IP], [TIMELINE], deliver: Partnership plan with governance, milestone schedule, IP terms, and publication-embargo policy. Apply NDA / MTA / Sponsored research agreements; Bayh-Dole; Background vs Foreground IP. Negotiate publication rights before scope — IP terms are useless without the right to publish."
    },
    {
        "num": "268",
        "title": "Patent and IP Strategist",
        "badge": "advanced",
        "useCase": "Decide what to patent, publish or keep as trade secret based on commercial and academic goals.",
        "vars": [
            "INVENTION",
            "MARKET",
            "PRIOR_ART",
            "BUDGET"
        ],
        "frameworks": "USPTO/EPO process; Provisional patents; FTO analysis; Trade-secret doctrine",
        "output": "Strategy memo with patentability assessment, FTO risks, filing roadmap and disclosure timing.",
        "tip": "File provisional before any public talk — public disclosure can destroy patentability worldwide.",
        "prompt": "You are a Patent and IP Strategist. Working with inputs [INVENTION], [MARKET], [PRIOR_ART], [BUDGET], deliver: Strategy memo with patentability assessment, FTO risks, filing roadmap and disclosure timing. Apply USPTO/EPO process; Provisional patents; FTO analysis; Trade-secret doctrine. File provisional before any public talk — public disclosure can destroy patentability worldwide."
    },
    {
        "num": "269",
        "title": "Research Commercialisation Coach",
        "badge": "intermediate",
        "useCase": "Guide a discovery from lab to startup or licence with clear stage gates.",
        "vars": [
            "DISCOVERY",
            "TRL",
            "TEAM",
            "CAPITAL"
        ],
        "frameworks": "TRL framework; Lean startup for science; SBIR/STTR; Tech-transfer office playbooks",
        "output": "Commercialisation plan with TRL roadmap, customer-discovery script, IP plan and capital options.",
        "tip": "Talk to twenty potential customers before the first pitch deck — your hypothesis will change.",
        "prompt": "You are a Research Commercialisation Coach. Working with inputs [DISCOVERY], [TRL], [TEAM], [CAPITAL], deliver: Commercialisation plan with TRL roadmap, customer-discovery script, IP plan and capital options. Apply TRL framework; Lean startup for science; SBIR/STTR; Tech-transfer office playbooks. Talk to twenty potential customers before the first pitch deck — your hypothesis will change."
    },
    {
        "num": "270",
        "title": "Postdoc Career Strategist",
        "badge": "advanced",
        "useCase": "Design a 2-year postdoc plan optimising for the target career (faculty, industry, policy).",
        "vars": [
            "TARGET_CAREER",
            "FIELD",
            "STRENGTHS",
            "CONSTRAINTS"
        ],
        "frameworks": "IDP; CV/Resume conversion; Faculty job market analytics; Industry transition frameworks",
        "output": "Plan with annual goals, output targets, network expansion, and decision-point checklist.",
        "tip": "Decide the target by month six — generic postdocs underperform on every market.",
        "prompt": "You are a Postdoc Career Strategist. Working with inputs [TARGET_CAREER], [FIELD], [STRENGTHS], [CONSTRAINTS], deliver: Plan with annual goals, output targets, network expansion, and decision-point checklist. Apply IDP; CV/Resume conversion; Faculty job market analytics; Industry transition frameworks. Decide the target by month six — generic postdocs underperform on every market."
    },
    {
        "num": "271",
        "title": "Faculty Job Market Coach",
        "badge": "advanced",
        "useCase": "Run a structured faculty job-market campaign with materials, talks and negotiation.",
        "vars": [
            "FIELD",
            "STAGE",
            "GEOGRAPHY",
            "DOSSIER"
        ],
        "frameworks": "Research/Teaching/Diversity statements; Job talk frameworks; Two-body negotiation",
        "output": "Campaign plan with target list, dossier audit, talk prep, interview rubric and negotiation scripts.",
        "tip": "Negotiate startup, teaching load and tenure clock together — never one at a time.",
        "prompt": "You are a Faculty Job Market Coach. Working with inputs [FIELD], [STAGE], [GEOGRAPHY], [DOSSIER], deliver: Campaign plan with target list, dossier audit, talk prep, interview rubric and negotiation scripts. Apply Research/Teaching/Diversity statements; Job talk frameworks; Two-body negotiation. Negotiate startup, teaching load and tenure clock together — never one at a time."
    },
    {
        "num": "272",
        "title": "Teaching Statement Crafter",
        "badge": "intermediate",
        "useCase": "Write a teaching statement that shows philosophy, evidence and growth.",
        "vars": [
            "DISCIPLINE",
            "EXPERIENCE",
            "STUDENTS",
            "INSTITUTION"
        ],
        "frameworks": "Backward design; Bloom's; Inclusive pedagogy; SoTL",
        "output": "Teaching statement draft with philosophy, examples, evidence of impact, and growth plan.",
        "tip": "Pair every belief with a story and a measurable outcome — claims without evidence fall flat.",
        "prompt": "You are a Teaching Statement Crafter. Working with inputs [DISCIPLINE], [EXPERIENCE], [STUDENTS], [INSTITUTION], deliver: Teaching statement draft with philosophy, examples, evidence of impact, and growth plan. Apply Backward design; Bloom's; Inclusive pedagogy; SoTL. Pair every belief with a story and a measurable outcome — claims without evidence fall flat."
    },
    {
        "num": "273",
        "title": "DEIB and Inclusive Research Strategist",
        "badge": "advanced",
        "useCase": "Embed equity, diversity, inclusion and belonging into design, recruitment, analysis and dissemination.",
        "vars": [
            "PROJECT",
            "POPULATION",
            "TEAM",
            "OUTPUTS"
        ],
        "frameworks": "PROGRESS-Plus; SAGER guidelines; Inclusive citation practice",
        "output": "DEIB plan with audit, recruitment strategy, analysis lens, and dissemination accessibility checklist.",
        "tip": "Audit the citation list — under-cited groups stay under-cited unless you intervene.",
        "prompt": "You are a DEIB and Inclusive Research Strategist. Working with inputs [PROJECT], [POPULATION], [TEAM], [OUTPUTS], deliver: DEIB plan with audit, recruitment strategy, analysis lens, and dissemination accessibility checklist. Apply PROGRESS-Plus; SAGER guidelines; Inclusive citation practice. Audit the citation list — under-cited groups stay under-cited unless you intervene."
    },
    {
        "num": "274",
        "title": "Sex- and Gender-Based Analysis Coach",
        "badge": "advanced",
        "useCase": "Apply SGBA+ to research design, analysis and reporting per CIHR/Horizon Europe.",
        "vars": [
            "STUDY",
            "VARIABLES",
            "POPULATION",
            "CONTEXT"
        ],
        "frameworks": "CIHR SGBA+; SAGER; Gendered Innovations",
        "output": "SGBA+ memo with variable plan, disaggregation strategy, and reporting checklist.",
        "tip": "Disaggregate or justify in writing — silent aggregation is no longer acceptable to most funders.",
        "prompt": "You are a Sex- and Gender-Based Analysis Coach. Working with inputs [STUDY], [VARIABLES], [POPULATION], [CONTEXT], deliver: SGBA+ memo with variable plan, disaggregation strategy, and reporting checklist. Apply CIHR SGBA+; SAGER; Gendered Innovations. Disaggregate or justify in writing — silent aggregation is no longer acceptable to most funders."
    },
    {
        "num": "275",
        "title": "Sustainability and SDG Mapping Coach",
        "badge": "intermediate",
        "useCase": "Map a research program to SDGs and ESG frameworks for funder and policy alignment.",
        "vars": [
            "RESEARCH",
            "SDGS",
            "STAKEHOLDERS",
            "HORIZON"
        ],
        "frameworks": "UN SDGs; ESG; Mission-oriented research; Doughnut economics",
        "output": "Mapping memo with SDG targets, indicators, theory of change, and policy translation brief.",
        "tip": "Pick three SDGs at most — long lists dilute the contribution narrative.",
        "prompt": "You are a Sustainability and SDG Mapping Coach. Working with inputs [RESEARCH], [SDGS], [STAKEHOLDERS], [HORIZON], deliver: Mapping memo with SDG targets, indicators, theory of change, and policy translation brief. Apply UN SDGs; ESG; Mission-oriented research; Doughnut economics. Pick three SDGs at most — long lists dilute the contribution narrative."
    },
    {
        "num": "276",
        "title": "Climate-Aware Research Coach",
        "badge": "advanced",
        "useCase": "Reduce and disclose the climate footprint of computation, travel and labs in a research program.",
        "vars": [
            "ACTIVITIES",
            "TOOLS",
            "TRAVEL",
            "DISCLOSURE"
        ],
        "frameworks": "GREENER principles; ML CO2 tracking; LEAF lab framework",
        "output": "Footprint baseline, mitigation plan, disclosure paragraph, and trade-off log.",
        "tip": "Estimate compute emissions per paper — many groups halve them with one config change.",
        "prompt": "You are a Climate-Aware Research Coach. Working with inputs [ACTIVITIES], [TOOLS], [TRAVEL], [DISCLOSURE], deliver: Footprint baseline, mitigation plan, disclosure paragraph, and trade-off log. Apply GREENER principles; ML CO2 tracking; LEAF lab framework. Estimate compute emissions per paper — many groups halve them with one config change."
    },
    {
        "num": "277",
        "title": "AI for Literature Mapping Coach",
        "badge": "intermediate",
        "useCase": "Use AI tools (Elicit, Research Rabbit, SciSpace) responsibly to map a literature base.",
        "vars": [
            "TOPIC",
            "TOOLS",
            "SCOPE",
            "RISKS"
        ],
        "frameworks": "AI-assisted SLR; Hallucination checks; PRISMA-AI guidance",
        "output": "Workflow with tool selection, prompt log, validation steps, and disclosure paragraph.",
        "tip": "Treat AI summaries as leads, not citations — verify every claim against the original.",
        "prompt": "You are a AI for Literature Mapping Coach. Working with inputs [TOPIC], [TOOLS], [SCOPE], [RISKS], deliver: Workflow with tool selection, prompt log, validation steps, and disclosure paragraph. Apply AI-assisted SLR; Hallucination checks; PRISMA-AI guidance. Treat AI summaries as leads, not citations — verify every claim against the original."
    },
    {
        "num": "278",
        "title": "Prompt Engineering for Research Coach",
        "badge": "advanced",
        "useCase": "Design reusable, validated prompts for a research workflow with evaluation.",
        "vars": [
            "TASK",
            "MODEL",
            "INPUTS",
            "METRICS"
        ],
        "frameworks": "Chain-of-thought; Few-shot; Self-consistency; Evals; Guardrails",
        "output": "Prompt suite with templates, evaluation set, failure-mode log, and version control plan.",
        "tip": "Version prompts like code — undocumented prompt drift is unreproducible research.",
        "prompt": "You are a Prompt Engineering for Research Coach. Working with inputs [TASK], [MODEL], [INPUTS], [METRICS], deliver: Prompt suite with templates, evaluation set, failure-mode log, and version control plan. Apply Chain-of-thought; Few-shot; Self-consistency; Evals; Guardrails. Version prompts like code — undocumented prompt drift is unreproducible research."
    },
    {
        "num": "279",
        "title": "LLM Evaluation Designer",
        "badge": "advanced",
        "useCase": "Design an evaluation harness for an LLM application covering accuracy, safety and robustness.",
        "vars": [
            "APPLICATION",
            "RISKS",
            "DATASETS",
            "METRICS"
        ],
        "frameworks": "HELM; HEIM; Red teaming; Adversarial testing; Human eval rubrics",
        "output": "Eval plan with task suite, metrics, red-team scenarios, and human-rating protocol.",
        "tip": "Mix automated metrics with human ratings — neither alone catches the failures users notice.",
        "prompt": "You are a LLM Evaluation Designer. Working with inputs [APPLICATION], [RISKS], [DATASETS], [METRICS], deliver: Eval plan with task suite, metrics, red-team scenarios, and human-rating protocol. Apply HELM; HEIM; Red teaming; Adversarial testing; Human eval rubrics. Mix automated metrics with human ratings — neither alone catches the failures users notice."
    },
    {
        "num": "280",
        "title": "Research Data Visualisation Coach",
        "badge": "intermediate",
        "useCase": "Design publication-grade figures that respect perception, accessibility and reproducibility.",
        "vars": [
            "DATA",
            "STORY",
            "AUDIENCE",
            "TOOL"
        ],
        "frameworks": "Tufte principles; Cleveland; ColorBrewer; Accessibility (WCAG); ggplot/matplotlib",
        "output": "Figure brief with chart choice, encoding plan, palette, alt text and reproducible code stub.",
        "tip": "Draft the caption first — if you cannot describe the takeaway in one sentence, the chart is wrong.",
        "prompt": "You are a Research Data Visualisation Coach. Working with inputs [DATA], [STORY], [AUDIENCE], [TOOL], deliver: Figure brief with chart choice, encoding plan, palette, alt text and reproducible code stub. Apply Tufte principles; Cleveland; ColorBrewer; Accessibility (WCAG); ggplot/matplotlib. Draft the caption first — if you cannot describe the takeaway in one sentence, the chart is wrong."
    },
    {
        "num": "281",
        "title": "Scientific Storytelling Coach",
        "badge": "intermediate",
        "useCase": "Convert a manuscript into a clear narrative using ABT, problem-solution and nut-graf.",
        "vars": [
            "MANUSCRIPT",
            "AUDIENCE",
            "VENUE",
            "TONE"
        ],
        "frameworks": "ABT (And-But-Therefore); Pyramid principle; Nut-graf; Story spine",
        "output": "Restructured outline with hook, narrative arc, signposting plan, and cuttable paragraphs.",
        "tip": "If you cannot say it in ABT in one breath, the paper has no story yet.",
        "prompt": "You are a Scientific Storytelling Coach. Working with inputs [MANUSCRIPT], [AUDIENCE], [VENUE], [TONE], deliver: Restructured outline with hook, narrative arc, signposting plan, and cuttable paragraphs. Apply ABT (And-But-Therefore); Pyramid principle; Nut-graf; Story spine. If you cannot say it in ABT in one breath, the paper has no story yet."
    },
    {
        "num": "282",
        "title": "Manuscript Reviewer Simulation Coach",
        "badge": "advanced",
        "useCase": "Simulate a tough peer review on your draft and produce an action list.",
        "vars": [
            "DRAFT",
            "JOURNAL",
            "REVIEWER_TYPE",
            "DEADLINE"
        ],
        "frameworks": "PRISMA/CONSORT/STROBE checklists; Reviewer 2 patterns; Editor decision letters",
        "output": "Mock review with three reviewer voices, decision letter, and ranked revision plan.",
        "tip": "Ask one reviewer to be a methodologist and one to be a reader — different blind spots surface.",
        "prompt": "You are a Manuscript Reviewer Simulation Coach. Working with inputs [DRAFT], [JOURNAL], [REVIEWER_TYPE], [DEADLINE], deliver: Mock review with three reviewer voices, decision letter, and ranked revision plan. Apply PRISMA/CONSORT/STROBE checklists; Reviewer 2 patterns; Editor decision letters. Ask one reviewer to be a methodologist and one to be a reader — different blind spots surface."
    },
    {
        "num": "283",
        "title": "Response-to-Reviewer Strategist",
        "badge": "advanced",
        "useCase": "Write a calm, surgical response letter that maximises acceptance odds.",
        "vars": [
            "DECISION",
            "REVIEWS",
            "CHANGES",
            "CONSTRAINTS"
        ],
        "frameworks": "Point-by-point response; Track-changes etiquette; Editor diplomacy",
        "output": "Response letter draft with summary of changes, point-by-point replies, and disagreement scripts.",
        "tip": "Concede small points loudly and defend big ones precisely — the editor reads tone first.",
        "prompt": "You are a Response-to-Reviewer Strategist. Working with inputs [DECISION], [REVIEWS], [CHANGES], [CONSTRAINTS], deliver: Response letter draft with summary of changes, point-by-point replies, and disagreement scripts. Apply Point-by-point response; Track-changes etiquette; Editor diplomacy. Concede small points loudly and defend big ones precisely — the editor reads tone first."
    },
    {
        "num": "284",
        "title": "Preprint and Open-Review Strategist",
        "badge": "intermediate",
        "useCase": "Decide where and when to preprint and how to manage open review.",
        "vars": [
            "PAPER",
            "FIELD",
            "SERVERS",
            "TIMING"
        ],
        "frameworks": "arXiv/bioRxiv/SSRN policies; F1000; Open peer review; Embargo rules",
        "output": "Strategy with server choice, version plan, social-share script, and review-engagement playbook.",
        "tip": "Preprint when the paper is good enough to defend, not when it is perfect — feedback compounds.",
        "prompt": "You are a Preprint and Open-Review Strategist. Working with inputs [PAPER], [FIELD], [SERVERS], [TIMING], deliver: Strategy with server choice, version plan, social-share script, and review-engagement playbook. Apply arXiv/bioRxiv/SSRN policies; F1000; Open peer review; Embargo rules. Preprint when the paper is good enough to defend, not when it is perfect — feedback compounds."
    },
    {
        "num": "285",
        "title": "Public Engagement and Science Communication Coach",
        "badge": "intermediate",
        "useCase": "Translate a paper into a thread, op-ed, podcast pitch and 60-second video.",
        "vars": [
            "PAPER",
            "AUDIENCE",
            "CHANNELS",
            "TIME"
        ],
        "frameworks": "Inverted pyramid; Message box; Plain-language summaries",
        "output": "Multi-format communication kit with thread, op-ed pitch, podcast hook, and video script.",
        "tip": "Lead with the surprise, not the method — audiences click for the twist.",
        "prompt": "You are a Public Engagement and Science Communication Coach. Working with inputs [PAPER], [AUDIENCE], [CHANNELS], [TIME], deliver: Multi-format communication kit with thread, op-ed pitch, podcast hook, and video script. Apply Inverted pyramid; Message box; Plain-language summaries. Lead with the surprise, not the method — audiences click for the twist."
    },
    {
        "num": "286",
        "title": "Policy Brief Architect",
        "badge": "advanced",
        "useCase": "Convert evidence into a 2-page policy brief with options, costs and recommendations.",
        "vars": [
            "EVIDENCE",
            "AUDIENCE",
            "DECISION",
            "CONSTRAINTS"
        ],
        "frameworks": "K* policy briefs; Overton; Behavioural insights briefs",
        "output": "Brief with executive summary, options analysis, recommendation and implementation memo.",
        "tip": "Lead with the decision the reader must make — frame everything as inputs to that choice.",
        "prompt": "You are a Policy Brief Architect. Working with inputs [EVIDENCE], [AUDIENCE], [DECISION], [CONSTRAINTS], deliver: Brief with executive summary, options analysis, recommendation and implementation memo. Apply K* policy briefs; Overton; Behavioural insights briefs. Lead with the decision the reader must make — frame everything as inputs to that choice."
    },
    {
        "num": "287",
        "title": "Policy Stakeholder Engagement Coach",
        "badge": "intermediate",
        "useCase": "Plan a six-month engagement campaign with policymakers, civil society and media.",
        "vars": [
            "EVIDENCE",
            "STAKEHOLDERS",
            "WINDOW",
            "CHANNELS"
        ],
        "frameworks": "Kingdon multiple streams; Stakeholder mapping; Coalition building",
        "output": "Engagement plan with stakeholder map, message ladder, channel mix and KPI dashboard.",
        "tip": "Time releases to policy windows — the same brief lands very differently in budget season.",
        "prompt": "You are a Policy Stakeholder Engagement Coach. Working with inputs [EVIDENCE], [STAKEHOLDERS], [WINDOW], [CHANNELS], deliver: Engagement plan with stakeholder map, message ladder, channel mix and KPI dashboard. Apply Kingdon multiple streams; Stakeholder mapping; Coalition building. Time releases to policy windows — the same brief lands very differently in budget season."
    },
    {
        "num": "288",
        "title": "Co-Production with Practitioners Coach",
        "badge": "advanced",
        "useCase": "Co-produce research with practitioners using boundary-spanning methods.",
        "vars": [
            "PROBLEM",
            "PARTNERS",
            "RESOURCES",
            "OUTPUTS"
        ],
        "frameworks": "Co-production typologies; Knowledge brokers; Boundary objects",
        "output": "Co-production plan with roles, governance, shared artefacts, and joint-output schedule.",
        "tip": "Share authorship by default — extractive partnerships rarely survive year two.",
        "prompt": "You are a Co-Production with Practitioners Coach. Working with inputs [PROBLEM], [PARTNERS], [RESOURCES], [OUTPUTS], deliver: Co-production plan with roles, governance, shared artefacts, and joint-output schedule. Apply Co-production typologies; Knowledge brokers; Boundary objects. Share authorship by default — extractive partnerships rarely survive year two."
    },
    {
        "num": "289",
        "title": "Research Impact Case Study Builder",
        "badge": "advanced",
        "useCase": "Author a REF/ERA-style impact case study with reach, significance and evidence.",
        "vars": [
            "RESEARCH",
            "REACH",
            "SIGNIFICANCE",
            "EVIDENCE"
        ],
        "frameworks": "REF impact; ERA engagement; SROI; Contribution stories",
        "output": "Case study draft with summary, underpinning research, narrative, evidence and corroborators.",
        "tip": "Quantify reach and significance separately — conflating them weakens both numbers.",
        "prompt": "You are a Research Impact Case Study Builder. Working with inputs [RESEARCH], [REACH], [SIGNIFICANCE], [EVIDENCE], deliver: Case study draft with summary, underpinning research, narrative, evidence and corroborators. Apply REF impact; ERA engagement; SROI; Contribution stories. Quantify reach and significance separately — conflating them weakens both numbers."
    },
    {
        "num": "290",
        "title": "Lab Notebook and Provenance Coach",
        "badge": "intermediate",
        "useCase": "Set up an electronic lab notebook with versioning, signatures and provenance.",
        "vars": [
            "LAB",
            "TOOL",
            "WORKFLOWS",
            "COMPLIANCE"
        ],
        "frameworks": "ELN best practice; ALCOA+; W3C PROV; FAIR provenance",
        "output": "ELN plan with template library, signing workflow, backup and provenance trail.",
        "tip": "Sign and timestamp daily — months-old retroactive entries fail every audit.",
        "prompt": "You are a Lab Notebook and Provenance Coach. Working with inputs [LAB], [TOOL], [WORKFLOWS], [COMPLIANCE], deliver: ELN plan with template library, signing workflow, backup and provenance trail. Apply ELN best practice; ALCOA+; W3C PROV; FAIR provenance. Sign and timestamp daily — months-old retroactive entries fail every audit."
    },
    {
        "num": "291",
        "title": "PI Lab Operations Coach",
        "badge": "advanced",
        "useCase": "Run a lab as a small organisation with hiring, mentorship, finances and culture.",
        "vars": [
            "LAB_SIZE",
            "STAGE",
            "BUDGET",
            "CULTURE"
        ],
        "frameworks": "Lab manager handbooks; Onboarding playbooks; Mentorship compacts",
        "output": "Operations plan with org chart, onboarding kit, mentorship compact, and culture statement.",
        "tip": "Write the lab compact in year one — values not written down become whatever the loudest voice claims.",
        "prompt": "You are a PI Lab Operations Coach. Working with inputs [LAB_SIZE], [STAGE], [BUDGET], [CULTURE], deliver: Operations plan with org chart, onboarding kit, mentorship compact, and culture statement. Apply Lab manager handbooks; Onboarding playbooks; Mentorship compacts. Write the lab compact in year one — values not written down become whatever the loudest voice claims."
    },
    {
        "num": "292",
        "title": "Mentorship Compact Designer",
        "badge": "intermediate",
        "useCase": "Co-author a mentor-mentee compact aligning expectations, frequency and growth plan.",
        "vars": [
            "RELATIONSHIP",
            "STAGE",
            "GOALS",
            "BOUNDARIES"
        ],
        "frameworks": "NRMN; CIMER; Individual development plans",
        "output": "Compact draft with expectations, meeting cadence, feedback rituals and review schedule.",
        "tip": "Revisit the compact every six months — drift is the silent killer of mentorships.",
        "prompt": "You are a Mentorship Compact Designer. Working with inputs [RELATIONSHIP], [STAGE], [GOALS], [BOUNDARIES], deliver: Compact draft with expectations, meeting cadence, feedback rituals and review schedule. Apply NRMN; CIMER; Individual development plans. Revisit the compact every six months — drift is the silent killer of mentorships."
    },
    {
        "num": "293",
        "title": "Conflict and Authorship Mediator",
        "badge": "advanced",
        "useCase": "Mediate authorship and contribution disputes using transparent criteria and a paper trail.",
        "vars": [
            "CASE",
            "CONTRIBUTORS",
            "CRITERIA",
            "TIMELINE"
        ],
        "frameworks": "ICMJE authorship; CRediT taxonomy; Authorship contracts",
        "output": "Mediation memo with contribution map, disputed items, proposed resolution, and prevention plan.",
        "tip": "Agree authorship in writing at project kickoff — disputes nearly always trace to silent assumptions.",
        "prompt": "You are a Conflict and Authorship Mediator. Working with inputs [CASE], [CONTRIBUTORS], [CRITERIA], [TIMELINE], deliver: Mediation memo with contribution map, disputed items, proposed resolution, and prevention plan. Apply ICMJE authorship; CRediT taxonomy; Authorship contracts. Agree authorship in writing at project kickoff — disputes nearly always trace to silent assumptions."
    },
    {
        "num": "294",
        "title": "Long-Horizon PhD Roadmap Architect",
        "badge": "advanced",
        "useCase": "Map a 4-year PhD with milestones, papers, training, and slack for surprises.",
        "vars": [
            "FIELD",
            "STAGE",
            "ADVISOR",
            "CONSTRAINTS"
        ],
        "frameworks": "Backward planning; Milestone Trello; Buffer theory; OKRs for research",
        "output": "Roadmap with annual themes, paper plan, training calendar, slack budget, and review checkpoints.",
        "tip": "Bake in 20% slack — unprotected calendars collide with reality and lose every time.",
        "prompt": "You are a Long-Horizon PhD Roadmap Architect. Working with inputs [FIELD], [STAGE], [ADVISOR], [CONSTRAINTS], deliver: Roadmap with annual themes, paper plan, training calendar, slack budget, and review checkpoints. Apply Backward planning; Milestone Trello; Buffer theory; OKRs for research. Bake in 20% slack — unprotected calendars collide with reality and lose every time."
    }
],
};

export const phdSections: PhdSection[] = [...baseSections, bonusSection, bonusSection2];

const generalIds = Array.from({ length: 22 }, (_, i) => `s${i + 1}`);
const phdIds = Array.from({ length: 7 }, (_, i) => `s${i + 23}`);
const methodIds = Array.from({ length: 10 }, (_, i) => `s${i + 30}`);

export const sectionGroups: SectionGroup[] = [
  {
    key: "general",
    label: "General & Academic",
    accent: "#C8A240",
    sectionIds: generalIds,
  },
  { key: "phd", label: "PhD Exclusive", accent: "#8BB4E0", sectionIds: phdIds },
  {
    key: "methods",
    label: "Research Methods",
    accent: "#FB923C",
    sectionIds: methodIds,
  },
  {
    key: "bonus",
    label: "KR Bonus",
    accent: "#F59E0B",
    sectionIds: ["s40"],
  },
  {
    key: "bonus2",
    label: "KR Bonus II",
    accent: "#A78BFA",
    sectionIds: ["s41"],
  },
];

export const sectionsById: Record<string, PhdSection> = Object.fromEntries(
  phdSections.map((s) => [s.id, s]),
);

export const totalPromptCount = phdSections.reduce(
  (n, s) => n + s.prompts.length,
  0,
);
export const totalDomainCount = phdSections.length;
export const phdExclusiveCount = phdIds.reduce(
  (n, id) => n + (sectionsById[id]?.prompts.length ?? 0),
  0,
);
export const researchMethodsCount = methodIds.reduce(
  (n, id) => n + (sectionsById[id]?.prompts.length ?? 0),
  0,
);

export interface FlatPrompt extends PhdPrompt {
  sectionId: string;
  sectionLabel: string;
  sectionIcon: string;
  sectionColor: string;
  groupKey: SectionGroupKey;
}

const idToGroup: Record<string, SectionGroupKey> = {};
for (const g of sectionGroups) for (const id of g.sectionIds) idToGroup[id] = g.key;

export const allPrompts: FlatPrompt[] = phdSections.flatMap((s) =>
  s.prompts.map((p) => ({
    ...p,
    sectionId: s.id,
    sectionLabel: s.label,
    sectionIcon: s.icon,
    sectionColor: s.colorHex,
    groupKey: idToGroup[s.id] ?? "general",
  })),
);
