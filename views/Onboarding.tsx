import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { OnboardingData } from '../types';
import { SERVICE_PACKAGES } from '../constants';
import { generatePermitRoadmap, ROADMAP_FAILURE_LABELS } from '../services/geminiService';
import type { AIPermitRoadmap, RoadmapItem, RoadmapOutcome } from '../services/geminiService';
import { getWhatsAppLink } from '../services/whatsapp';
import type { WhatsAppMessageType, WhatsAppProjectContext } from '../services/whatsapp';
import { CLEARANCE_LETTERS, evaluateRules } from '@/src/domain/rules';
import type {
  AssessedRequirement,
  DevelopmentType,
  DocumentAvailability,
  ProjectScope,
  RequirementCategory,
  SiteCondition,
  TitleStatus,
} from '@/src/domain/rules';
import {
  TITLE_OPTIONS,
  TITLE_STATUS_BY_LABEL,
  buildEngineInput,
  createInitialData,
  derivePropertyType,
  toDisplayProject,
  validateStep1,
  validateStep2,
  validateStep4,
} from './onboardingValidation';
import type { Errors } from './onboardingValidation';

const DRAFT_KEY = 'permitflow_onboarding_draft';

export const LAGOS_LGAS = [
  'Lagos Island', 'Lagos Mainland', 'Lekki 1', 'Lekki 2', 'Mosan Okunola',
  'Mushin', 'Ojo', 'Ojodu', 'Ojokoro', 'Oke-Odo',
  'Olorunda', 'Ori-Ade', 'Oshodi', 'Papa Ajao', 'Somolu',
  'Surulere', 'Yaba', 'Ibeju Lekki East', 'Ibeju Lekki West', 'Ifako Ijaye',
  'Igando', 'Igogbo Baiyeku', 'Ijede', 'Ikeja', 'Ikorodu Central',
  'Ikorodu North', 'Ikorodu West', 'Ikosi Eredo', 'Ikota', 'Ikotun',
  'Ikoyi Obalende', 'Imota', 'Iru-Victoria Island', 'Isolo', 'Kosofe',
  'Iba/Otto/Awori', 'Addo - Badore', 'Agbado', 'Agboyi Ikosi Ketu', 'Agege',
  'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Ayobo-Ipaja',
  'Badagry', 'Bariga', 'Coker Aguda', 'Egbe Idimu', 'Epe',
  'Eti-Osa East', 'Eti-Osa North', 'Eti-Osa South',
];

const APPLICANT_OPTIONS: { label: string; value: 'individual' | 'corporate'; hint: string }[] = [
  { label: 'Individual / Property Owner', value: 'individual', hint: 'LIRS individual tax clearance (e-TCC) applies' },
  { label: 'Company / Corporate Developer', value: 'corporate', hint: 'CAC certificate, corporate TCC & directors documents apply' },
];

export const DEVELOPMENT_OPTIONS: { label: string; value: DevelopmentType; icon: string }[] = [
  { label: 'Agricultural', value: 'agricultural', icon: 'agriculture' },
  { label: 'Commercial', value: 'commercial', icon: 'storefront' },
  { label: 'Industrial', value: 'industrial', icon: 'factory' },
  { label: 'Institutional', value: 'institutional', icon: 'account_balance' },
  { label: 'Mixed Use', value: 'mixed_use', icon: 'apartment' },
  { label: 'Recreational', value: 'recreational', icon: 'park' },
  { label: 'Religious', value: 'religious', icon: 'church' },
  { label: 'Residential', value: 'residential', icon: 'home' },
  { label: 'Special Applications', value: 'special_applications', icon: 'science' },
  { label: 'Transportation', value: 'transportation', icon: 'directions_bus' },
];

const SCOPE_OPTIONS: { label: string; value: ProjectScope; hint: string }[] = [
  { label: 'New construction', value: 'new_construction', hint: 'Fresh development from the ground up' },
  { label: 'Renovation', value: 'renovation', hint: 'Altering an existing approved building' },
  { label: 'Extension', value: 'extension', hint: 'Adding floors or expanding an existing building' },
  { label: 'Change of use', value: 'change_of_use', hint: 'Changing what the building is used for' },
  { label: 'Regularization (already built)', value: 'regularization_amnesty', hint: 'Already built — formalising the permit now' },
];

const SITE_CONDITIONS: { label: string; value: SiteCondition }[] = [
  { label: 'Coastal / shoreline', value: 'coastal' },
  { label: 'Flood-prone area', value: 'flood_prone' },
  { label: 'Adjacent to a canal', value: 'canal_adjacent' },
  { label: 'Swampy terrain', value: 'swampy' },
  { label: 'Near a water body (lagoon / river)', value: 'water_adjacent' },
  { label: 'Reclaimed land', value: 'reclaimed' },
];

const CATEGORY_META: Record<RequirementCategory, { label: string; icon: string }> = {
  drawings: { label: 'Drawings', icon: 'architecture' },
  technical_reports: { label: 'Technical reports & site studies', icon: 'science' },
  tax_corporate: { label: 'Tax & corporate documents', icon: 'receipt_long' },
  insurance_legal: { label: 'Insurance & legal', icon: 'verified_user' },
  existing_renovation: { label: 'Existing-development documents', icon: 'gavel' },
};

const CATEGORY_ORDER: RequirementCategory[] = [
  'drawings',
  'technical_reports',
  'tax_corporate',
  'insurance_legal',
  'existing_renovation',
];

const FieldLabel = ({ text, htmlFor, required }: { text: string; htmlFor: string; required?: boolean }) => (
  <div className="flex items-center justify-between mb-2">
    <label htmlFor={htmlFor} className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
      {text}
    </label>
    <span className={`text-[11px] font-bold uppercase tracking-wider ${required ? 'text-primary' : 'text-gray-500'}`}>
      {required ? 'Required' : 'Optional'}
    </span>
  </div>
);

const ErrMsg = ({ id, text }: { id: string; text?: string }) =>
  text ? (
    <p id={id} role="alert" className="mt-2 text-xs font-semibold text-red-500 dark:text-red-400 flex items-start gap-1.5">
      <span aria-hidden="true" className="material-icons-outlined text-sm mt-0.5">error</span>
      <span>{text}</span>
    </p>
  ) : null;

const OptionChips = <T extends string>({ options, value, onChange, name, label, error, columns }: {
  options: { label: string; value: T; hint?: string; icon?: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
  name: string;
  label?: string;
  error?: string;
  columns?: boolean;
}) => (
  <div
    id={`group-${name}`}
    tabIndex={-1}
    role="radiogroup"
    aria-label={label ?? name.replace(/-/g, ' ')}
    aria-invalid={!!error}
    aria-describedby={error ? `err-${name}` : undefined}
  >
    <div className={`${columns ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5' : 'flex flex-wrap gap-2.5 sm:gap-3'}`}>
      {options.map((o, index) => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (!value && index === 0) ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
              if (!keys.includes(e.key)) return;
              e.preventDefault();
              let next = index;
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % options.length;
              else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + options.length) % options.length;
              else if (e.key === 'Home') next = 0;
              else next = options.length - 1;
              onChange(options[next].value);
              const buttons = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
              buttons?.[next]?.focus();
            }}
            className={`text-left px-4 py-3 rounded-xl border-2 text-xs sm:text-sm transition-all flex items-center gap-2.5 ${
              selected
                ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary text-gray-700 dark:text-gray-300'
            }`}
          >
            {o.icon && <span aria-hidden="true" className="material-icons-outlined text-base shrink-0">{o.icon}</span>}
            <span className="flex flex-col">
              <span>{o.label}</span>
              {o.hint && <span className={`text-[11px] font-normal ${selected ? 'text-primary/80' : 'text-gray-500 dark:text-gray-400'}`}>{o.hint}</span>}
            </span>
          </button>
        );
      })}
    </div>
    <ErrMsg id={`err-${name}`} text={error} />
  </div>
);

const TriState = ({ id, value, onChange }: { id: string; value: DocumentAvailability; onChange: (av: DocumentAvailability) => void }) => {
  const opts: { label: string; value: DocumentAvailability; icon: string }[] = [
    { label: 'Have it', value: 'have', icon: 'check_circle' },
    { label: 'Not yet', value: 'missing', icon: 'schedule' },
    { label: 'Not sure', value: 'unknown', icon: 'help' },
  ];
  return (
    <div role="radiogroup" aria-label={`Availability of ${id}`} className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl shrink-0">
      {opts.map((o, index) => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (!value && index === 0) ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
              if (!keys.includes(e.key)) return;
              e.preventDefault();
              let next = index;
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % opts.length;
              else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + opts.length) % opts.length;
              else if (e.key === 'Home') next = 0;
              else next = opts.length - 1;
              onChange(opts[next].value);
              const buttons = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
              buttons?.[next]?.focus();
            }}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              selected
                ? o.value === 'have'
                  ? 'bg-emerald-500 text-white'
                  : o.value === 'missing'
                    ? 'bg-red-600 text-white'
                    : 'bg-amber-400 text-amber-950'
                : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
            }`}
          >
            <span aria-hidden="true" className="material-icons-outlined text-sm">{o.icon}</span>
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const MiniTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">{children}</p>
);

const RoadmapBulletList = ({ items }: { items: string[] }) => (
  <ul className="space-y-1.5">
    {items.map((s, i) => (
      <li key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex items-start gap-2">
        <span aria-hidden="true" className="material-icons-outlined text-xs text-primary mt-0.5 shrink-0">arrow_right</span>
        <span>{s}</span>
      </li>
    ))}
  </ul>
);

const RoadmapItemList = ({ items }: { items: RoadmapItem[] }) => (
  <ul className="space-y-2">
    {items.map((it, i) => (
      <li key={i} className="text-sm leading-relaxed">
        <span className="font-semibold text-gray-900 dark:text-white">{it.name}: </span>
        <span className="text-gray-600 dark:text-gray-300">{it.why}</span>
      </li>
    ))}
  </ul>
);

const RoadmapView = ({ roadmap }: { roadmap: AIPermitRoadmap }) => (
  <div className="space-y-5">
    <div>
      <MiniTitle>Summary</MiniTitle>
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{roadmap.summary}</p>
    </div>

    {roadmap.workflow.length > 0 && (
      <div>
        <MiniTitle>Likely workflow</MiniTitle>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
          {roadmap.workflow.map((s, i) => (
            <li key={i} className="leading-relaxed">{s}</li>
          ))}
        </ol>
      </div>
    )}

    {roadmap.missingDocuments.length > 0 && (
      <div>
        <MiniTitle>Missing documents &amp; why they matter</MiniTitle>
        <RoadmapItemList items={roadmap.missingDocuments} />
      </div>
    )}

    {roadmap.checklistExplanations.length > 0 && (
      <div>
        <MiniTitle>Why these checklist items matter</MiniTitle>
        <RoadmapItemList items={roadmap.checklistExplanations} />
      </div>
    )}

    {roadmap.nextSteps.length > 0 && (
      <div>
        <MiniTitle>Practical next steps</MiniTitle>
        <RoadmapBulletList items={roadmap.nextSteps} />
      </div>
    )}

    {roadmap.consultantQuestions.length > 0 && (
      <div>
        <MiniTitle>Questions to confirm with a consultant</MiniTitle>
        <RoadmapBulletList items={roadmap.consultantQuestions} />
      </div>
    )}

    {roadmap.disclaimers.length > 0 && (
      <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
        <ul className="space-y-1">
          {roadmap.disclaimers.map((d, i) => (
            <li key={i} className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">• {d}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export const Onboarding: React.FC = () => {
  const saveTimer = useRef<number | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const submittedHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const isFirstRender = useRef(true);
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(createInitialData);
  const [errors, setErrors] = useState<Errors>({});
  const [restored, setRestored] = useState(false);
  const [roadmapOutcome, setRoadmapOutcome] = useState<RoadmapOutcome | null>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!submitted) stepHeadingRef.current?.focus();
  }, [step, submitted]);

  useEffect(() => {
    if (submitted) submittedHeadingRef.current?.focus();
  }, [submitted]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { step?: number; data?: Partial<OnboardingData> };
      if (parsed.data && parsed.data.id) {
        setData({ ...createInitialData(), ...parsed.data } as OnboardingData);
        const s = parsed.step;
        setStep(s && s >= 1 && s <= 4 ? s : 1);
        setRestored(true);
      }
    } catch {
      /* corrupted draft — start fresh */
    }
  }, []);

  useEffect(() => {
    if (submitted) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, data }));
      } catch {
        /* storage unavailable */
      }
    }, 400);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [data, step, submitted]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  };

  const patch = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    const k: string = key;
    setErrors((prev) => {
      if (!(k in prev)) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const patchNum = (key: 'landAreaSqm' | 'floors' | 'units', raw: string) => {
    const trimmed = raw.trim();
    const v = trimmed === '' ? undefined : Number(raw);
    patch(key, v !== undefined && isFinite(v) ? v : undefined);
  };

  const toggleSite = (c: SiteCondition) => {
    const current = data.siteConditions || [];
    const next = current.includes(c) ? current.filter((x) => x !== c) : [...current, c];
    patch('siteConditions', next.length > 0 ? next : undefined);
  };

  const engineInput = useMemo(() => buildEngineInput(data), [data]);
  const assessment = useMemo(
    () => evaluateRules(engineInput, data.documentAvailability || {}),
    [engineInput, data.documentAvailability],
  );

  const requiredGroups = useMemo(() => {
    const map = new Map<RequirementCategory, AssessedRequirement[]>();
    CATEGORY_ORDER.forEach((c) => map.set(c, []));
    assessment.required.forEach((r) => {
      const list = map.get(r.category);
      if (list) list.push(r);
    });
    return CATEGORY_ORDER.filter((c) => (map.get(c) || []).length > 0).map((c) => ({
      category: c,
      items: map.get(c) || [],
    }));
  }, [assessment]);

  const availabilityOf = (id: string): DocumentAvailability => data.documentAvailability?.[id] ?? 'unknown';

  const setAvailability = (id: string, av: DocumentAvailability) => {
    patch('documentAvailability', { ...(data.documentAvailability || {}), [id]: av });
  };

  const focusFirstError = (errs: Record<string, string>) => {
    const fieldIds: Record<string, string> = {
      applicantType: 'group-applicant-type',
      developmentType: 'group-development-type',
      workScope: 'group-work-scope',
    };
    const first = Object.keys(errs)[0];
    if (!first) return;
    const el = document.getElementById(fieldIds[first] ?? first);
    el?.scrollIntoView?.({ block: 'center' });
    el?.focus();
  };

  const handleContinue = () => {
    const errs = step === 1 ? validateStep1(data) : step === 2 ? validateStep2(data) : {};
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      focusFirstError(errs);
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateRoadmap = async () => {
    setLoadingRoadmap(true);
    const mapped: OnboardingData = { ...data, ...toDisplayProject(data) };
    const outcome = await generatePermitRoadmap(mapped, assessment);
    setRoadmapOutcome(outcome);
    setLoadingRoadmap(false);
  };

  const handleComplete = () => {
    const errs = validateStep4(data);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs);
      return;
    }
    clearDraft();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startNewApplication = () => {
    discardAndRestart();
    setSubmitted(false);
  };

  const discardAndRestart = () => {
    clearDraft();
    setData(createInitialData());
    setStep(1);
    setErrors({});
    setRestored(false);
    setRoadmapOutcome(null);
  };

  const waContext = useMemo<WhatsAppProjectContext>(() => {
    const missing = assessment.required
      .filter((r) => availabilityOf(r.requirementId) === 'missing')
      .map((r) => r.name);
    const questions = assessment.consultantQuestions.slice(0, 3).map((q) => q.question);
    return {
      propertyType: derivePropertyType(data.workScope, data.developmentType),
      lga: data.lga || undefined,
      readinessScore: assessment.readinessScore,
      recommendedAction: assessment.recommendedAction,
      missingDocuments: missing.length > 0 ? missing : undefined,
      consultantQuestions: questions.length > 0 ? questions : undefined,
    };
  }, [data.lga, data.workScope, data.developmentType, assessment]);

  const waType: WhatsAppMessageType = waContext.missingDocuments ? 'missing_documentation' : 'permit_readiness_review';

  const waLink = useMemo(() => getWhatsAppLink(waType, waContext), [waType, waContext]);

  const renderProgress = () => {
    const labels = ['Type', 'Property', 'Documents', 'Assessment'];
    return (
      <div className="max-w-3xl mx-auto mb-8 sm:mb-10 px-4 sm:px-6">
        <div className="flex items-center justify-between w-full relative">
          {[1, 2, 3, 4].map((i) => {
            const isActive = step >= i;
            const isDone = step > i;
            return (
              <div key={`step-${i}`} aria-current={i === step ? 'step' : undefined} className={`relative z-10 flex flex-col items-center flex-1 ${i < 4 ? 'step-connector' : ''} ${i < 4 && isActive ? 'step-connector-active' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md transition-all border-2 sm:border-4 ${isActive ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-white dark:bg-[#161F30] text-gray-500 border-gray-200 dark:border-gray-700'}`}>
                  {isDone ? <span aria-hidden="true" className="material-icons-outlined text-lg">check</span> : i}
                </div>
                <span className={`mt-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                  {labels[i - 1]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const score = assessment.readinessScore ?? 0;

  const renderStep1 = () => (
    <div className="p-6 sm:p-10 md:p-12">
      <h1
        ref={stepHeadingRef}
        tabIndex={-1}
        className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3"
      >
        <span aria-hidden="true" className="material-icons-outlined text-primary">apartment</span>
        Project type &amp; scope
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
        This determines the statutory documents and clearances your project triggers.
      </p>

      <div className="space-y-8">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
            1. Who is applying? <span className="text-primary text-sm">*</span>
          </h2>
          <OptionChips
            options={APPLICANT_OPTIONS}
            value={data.applicantType}
            onChange={(v) => patch('applicantType', v)}
            name="applicant-type"
            label="Applicant type"
            columns
            error={errors.applicantType}
          />
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
            2. What type of property? <span className="text-primary text-sm">*</span>
          </h2>
          <OptionChips
            options={DEVELOPMENT_OPTIONS}
            value={data.developmentType}
            onChange={(v) => patch('developmentType', v)}
            name="development-type"
            label="Property type"
            columns
            error={errors.developmentType}
          />
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
            3. What work is being done? <span className="text-primary text-sm">*</span>
          </h2>
          <OptionChips
            options={SCOPE_OPTIONS}
            value={data.workScope}
            onChange={(v) => patch('workScope', v)}
            name="work-scope"
            label="Work scope"
            columns
            error={errors.workScope}
          />
        </div>
      </div>

      <div className="mt-10 sm:mt-12">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
        >
          <span>Continue to property details</span>
          <span aria-hidden="true" className="material-icons-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="p-6 sm:p-10 md:p-12">
      <h1
        ref={stepHeadingRef}
        tabIndex={-1}
        className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3"
      >
        <span aria-hidden="true" className="material-icons-outlined text-primary">location_city</span>
        Property &amp; title details
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
        Accurate details let the assessment engine confirm exactly what applies — no guessing.
      </p>

      <div className="space-y-6 sm:space-y-8">
        <div>
          <FieldLabel text="Property Address" htmlFor="address" required />
          <input
            id="address"
            type="text"
            className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm"
            placeholder="e.g., 5 Adeola Odeku Street, Victoria Island"
            value={data.address}
            onChange={(e) => patch('address', e.target.value)}
            aria-invalid={!!errors.address}
            aria-describedby={errors.address ? 'err-address' : undefined}
          />
          <ErrMsg id="err-address" text={errors.address} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FieldLabel text="LGA (Local Govt Area)" htmlFor="lga" required />
            <div className="relative">
              <select
                id="lga"
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none appearance-none text-sm"
                value={data.lga}
                onChange={(e) => patch('lga', e.target.value)}
                aria-invalid={!!errors.lga}
                aria-describedby={errors.lga ? 'err-lga' : undefined}
              >
                <option value="">Select LGA</option>
                {LAGOS_LGAS.map((lga) => (
                  <option key={lga} value={lga}>{lga}</option>
                ))}
              </select>
              <span aria-hidden="true" className="material-icons-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
            </div>
            <ErrMsg id="err-lga" text={errors.lga} />
          </div>

          <div>
            <FieldLabel text="Title Document" htmlFor="titleType" required />
            <div className="relative">
              <select
                id="titleType"
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none appearance-none text-sm"
                value={data.titleType}
                onChange={(e) => {
                  const label = e.target.value;
                  patch('titleType', label);
                  patch('titleStatus', label ? TITLE_STATUS_BY_LABEL[label] : undefined);
                }}
                aria-invalid={!!errors.titleType}
                aria-describedby={errors.titleType ? 'err-titleType' : undefined}
              >
                <option value="">Select document</option>
                {TITLE_OPTIONS.map((o) => (
                  <option key={o.label} value={o.label}>{o.label}</option>
                ))}
              </select>
              <span aria-hidden="true" className="material-icons-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
            </div>
            <ErrMsg id="err-titleType" text={errors.titleType} />
          </div>

          <div>
            <FieldLabel text="Land Size (Sqm)" htmlFor="landAreaSqm" required />
            <input
              id="landAreaSqm"
              type="number"
              min={1}
              inputMode="numeric"
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none text-sm"
              placeholder="e.g. 600"
              value={data.landAreaSqm ?? ''}
              onChange={(e) => patchNum('landAreaSqm', e.target.value)}
              aria-invalid={!!errors.landAreaSqm}
              aria-describedby={errors.landAreaSqm ? 'err-landAreaSqm' : undefined}
            />
            <ErrMsg id="err-landAreaSqm" text={errors.landAreaSqm} />
          </div>

          <div>
            <FieldLabel text="Number of Floors" htmlFor="floors" required />
            <input
              id="floors"
              type="number"
              min={1}
              inputMode="numeric"
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none text-sm"
              placeholder="e.g. 2"
              value={data.floors ?? ''}
              onChange={(e) => patchNum('floors', e.target.value)}
              aria-invalid={!!errors.floors}
              aria-describedby={errors.floors ? 'err-floors' : undefined}
            />
            <ErrMsg id="err-floors" text={errors.floors} />
          </div>

          <div>
            <FieldLabel text="Number of Units / Flats" htmlFor="units" required />
            <input
              id="units"
              type="number"
              min={1}
              inputMode="numeric"
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none text-sm"
              placeholder="e.g. 1"
              value={data.units ?? ''}
              onChange={(e) => patchNum('units', e.target.value)}
              aria-invalid={!!errors.units}
              aria-describedby={errors.units ? 'err-units' : undefined}
            />
            <ErrMsg id="err-units" text={errors.units} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Site conditions
            </h2>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Optional</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Select any that apply — coastal, flood-prone and reclaimed sites trigger extra site studies.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {SITE_CONDITIONS.map((c) => {
              const selected = (data.siteConditions || []).includes(c.value);
              return (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleSite(c.value)}
                  className={`px-4 py-2.5 rounded-full border-2 text-xs sm:text-sm transition-all ${selected ? 'bg-primary/10 border-primary text-primary font-bold' : 'border-gray-200 dark:border-gray-700 hover:border-primary text-gray-700 dark:text-gray-300'}`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <FieldLabel text="Project Description" htmlFor="description" />
          <textarea
            id="description"
            rows={1}
            className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none text-sm resize-none"
            placeholder="e.g. 3-storey residence, ground market floor..."
            value={data.description}
            onChange={(e) => patch('description', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-10 sm:mt-12 flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
        <button type="button" onClick={handleBack} className="px-6 py-2.5 min-h-11 text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold text-sm transition-colors">
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
        >
          <span>Continue to documents</span>
          <span aria-hidden="true" className="material-icons-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="p-6 sm:p-10 md:p-12">
      <h1
        ref={stepHeadingRef}
        tabIndex={-1}
        className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3"
      >
        <span aria-hidden="true" className="material-icons-outlined text-primary">folder_open</span>
        Documents &amp; service needs
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6 sm:mb-8 text-sm">
        Tick what you already have. Anything unconfirmed just shows as "Not sure" - you can update it later with your consultant.
      </p>

      <div className="mb-8 p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60" aria-live="polite">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="text-sm font-bold text-teal-900 dark:text-teal-200">Document readiness</div>
          <div className="text-sm font-extrabold text-primary">{score}%</div>
        </div>
        <div className="h-2.5 w-full bg-teal-100 dark:bg-teal-900/50 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${score}%` }} />
        </div>
        <div className="text-xs text-teal-700 dark:text-teal-300 mt-2">
          {assessment.completedCount} of {assessment.required.length} mandatory documents confirmed
          {assessment.missingCount > 0 ? ` • ${assessment.missingCount} still needed` : ''}
        </div>
      </div>

      <div className="space-y-6">
        {requiredGroups.map((group) => (
          <div key={group.category}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
              <span aria-hidden="true" className="material-icons-outlined text-base">{CATEGORY_META[group.category].icon}</span>
              {CATEGORY_META[group.category].label}
            </h2>
            <div className="space-y-3">
              {group.items.map((r) => (
                <div key={r.requirementId} className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <span aria-hidden="true" className="material-icons-outlined text-primary mt-0.5 shrink-0">{CATEGORY_META[r.category].icon}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{r.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{r.rationale}</div>
                      {r.meta?.regulatoryBody && (
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-semibold uppercase tracking-wider">{r.meta.regulatoryBody}</div>
                      )}
                    </div>
                  </div>
                  <TriState id={r.requirementId} value={availabilityOf(r.requirementId)} onChange={(av) => setAvailability(r.requirementId, av)} />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <span aria-hidden="true" className="material-icons-outlined text-base">verified</span>
            Clearance letters from third parties
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Conditional letters from the Lagos EPPES form. Track them here — each one is confirmed case-by-case with your consultant and is not counted in the readiness score.
          </p>
          <div className="space-y-3">
            {CLEARANCE_LETTERS.map((letter) => (
              <div key={letter.id} className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="text-sm font-bold text-gray-900 dark:text-white min-w-0">{letter.name}</div>
                <TriState id={letter.id} value={availabilityOf(letter.id)} onChange={(av) => setAvailability(letter.id, av)} />
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
          <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
            <span aria-hidden="true" className="material-icons-outlined text-primary">info</span>
            Buildings above 3 floors
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Mechanical, Structural and Electrical Drawings are mandatory. The Physical Planning Technical Report is required for buildings of 8 units or 4 floors, and 3D drawings must be submitted alongside 2D.
          </p>
        </div>

        {assessment.unknown.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
            <div className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2 mb-2">
              <span aria-hidden="true" className="material-icons-outlined text-amber-500">help</span>
              Needs review after consultation
            </div>
            <ul className="space-y-1.5 text-xs text-amber-800 dark:text-amber-300">
              {assessment.unknown.map((r) => (
                <li key={r.requirementId}>• {r.name} — {r.rationale}</li>
              ))}
            </ul>
          </div>
        )}

        {assessment.consultantQuestions.length > 0 && (
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60">
            <div className="text-sm font-bold text-sky-900 dark:text-sky-200 flex items-center gap-2 mb-2">
              <span aria-hidden="true" className="material-icons-outlined text-sky-500">support_agent</span>
              Questions a permit consultant must confirm
            </div>
            <ul className="space-y-1.5 text-xs text-sky-800 dark:text-sky-300">
              {assessment.consultantQuestions.map((q, i) => (
                <li key={i}>• {q.question}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            Service package (optional)
          </h2>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Optional</span>
        </div>
        <div className="space-y-4">
          {SERVICE_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              type="button"
              aria-pressed={data.selectedPackage === pkg.id}
              onClick={() => patch('selectedPackage', data.selectedPackage === pkg.id ? null : pkg.id)}
              className={`relative w-full p-5 sm:p-6 rounded-2xl border-2 text-left transition-all ${
                data.selectedPackage === pkg.id
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/10'
                  : 'border-gray-200/80 dark:border-gray-800 hover:border-primary/50'
              }`}
            >
              {pkg.popular && (
                <span className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">Recommended</span>
              )}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{pkg.name}</h3>
                <div className="sm:text-right">
                  <div className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">{pkg.price}</div>
                  <div className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">{pkg.priceSub}</div>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-3 leading-relaxed">{pkg.description}</p>
              <div className="flex flex-wrap gap-2">
                {pkg.features.map((f, i) => (
                  <span key={`${pkg.id}-${i}`} className="inline-flex items-center gap-1 text-[11px] text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                    <span aria-hidden="true" className="material-icons-outlined text-primary text-xs">check_circle</span>
                    {f}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
        <button type="button" onClick={handleBack} className="px-6 py-2.5 min-h-11 text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold text-sm transition-colors">
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
        >
          <span>View my assessment</span>
          <span aria-hidden="true" className="material-icons-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const hasWarnings = assessment.warnings.length > 0;
    const hasQuestions = assessment.consultantQuestions.length > 0;
    const hasUnknown = assessment.unknown.length > 0;

    return (
      <div className="p-6 sm:p-10 md:p-12">
        <h1
          ref={stepHeadingRef}
          tabIndex={-1}
          className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3"
        >
          <span aria-hidden="true" className="material-icons-outlined text-primary">verified</span>
          Readiness assessment
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
          Calculated locally from the Lagos statutory checklist — no guesswork.
        </p>

        <div className="mb-8 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div
              className="w-36 h-36 rounded-full relative shrink-0"
              role="img"
              aria-label={`Readiness score ${score} percent`}
              style={{ background: `conic-gradient(#0F6B61 ${score}%, rgba(229,231,235,0.9) ${score}% 100%)` }}
            >
              <div className="absolute inset-2.5 rounded-full bg-white dark:bg-[#161F30] flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{score}%</span>
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">Ready</span>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-base font-bold text-gray-900 dark:text-white mb-1">Recommended next step</div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{assessment.recommendedAction}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">{assessment.scoringExplanation}</p>
            </div>
          </div>
        </div>

        <div className="mb-8 p-5 sm:p-6 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/[0.06] dark:bg-[#25D366]/[0.08]">
          <div className="flex items-center gap-2.5 mb-2">
            <span aria-hidden="true" className="material-icons-outlined text-[#0F7A6E] dark:text-[#25D366]">forum</span>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Consult a PermitFlow Consultant</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Get a human review of your recommended next step. WhatsApp opens with a pre-filled message containing only your project details — never your personal information.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 bg-[#0F7A6E] hover:bg-[#0B5A51] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md shadow-[#25D366]/20 transition-all"
          >
            <svg aria-hidden="true" focusable="false" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.28-1.26-2.79-1.26-4.38 0-4.54 3.7-8.24 8.25-8.24 4.53 0 8.24 3.7 8.24 8.24 0 4.55-3.71 8.25-8.24 8.25zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.24-.64.8-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29z"/>
            </svg>
            Consult on WhatsApp
          </a>
        </div>

        <div className="mb-8 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <span aria-hidden="true" className="material-icons-outlined text-base">description</span>
            Mandatory documents ({assessment.required.length})
          </h2>
          <ul className="space-y-2">
            {assessment.required.map((r) => {
              const av = availabilityOf(r.requirementId);
              const chip =
                av === 'have'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300'
                  : av === 'missing'
                    ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-950/40 dark:border-red-800/60 dark:text-red-300'
                    : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300';
              const label = av === 'have' ? 'Have' : av === 'missing' ? 'Not yet' : 'Confirm';
              return (
                <li key={r.requirementId} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{r.name}</span>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider shrink-0 ${chip}`}>{label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {hasWarnings && (
          <div className="mb-8 p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
              <span aria-hidden="true" className="material-icons-outlined text-base">warning</span>
              Warnings
            </h2>
            <ul className="space-y-1.5 text-xs text-amber-800 dark:text-amber-300">
              {assessment.warnings.map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          </div>
        )}

        {hasQuestions && (
          <div className="mb-8 p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-800 dark:text-sky-300 mb-2 flex items-center gap-2">
              <span aria-hidden="true" className="material-icons-outlined text-base">support_agent</span>
              Consult a permit officer on:
            </h2>
            <ul className="space-y-1.5 text-xs text-sky-800 dark:text-sky-300">
              {assessment.consultantQuestions.map((q, i) => (
                <li key={i}>• {q.question}</li>
              ))}
            </ul>
          </div>
        )}

        {hasUnknown && (
          <div className="mb-8 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
              <span aria-hidden="true" className="material-icons-outlined text-base">help</span>
              Requirements that still need confirming
            </h2>
            <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
              {assessment.unknown.map((r) => (
                <li key={r.requirementId}>• {r.name} — {r.rationale}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-8 p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span aria-hidden="true" className="material-icons-outlined text-primary">auto_awesome</span>
              Preliminary AI explanation
            </h2>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Optional</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
            Your score above is computed by our deterministic rules engine. You can optionally generate a plain-language explanation of the assessment, workflow, and next steps (may be unavailable offline).
          </p>
          <div aria-live="polite">
            {loadingRoadmap && (
              <div className="mb-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <span aria-hidden="true" className="material-icons-outlined animate-spin text-base text-primary">refresh</span>
                Generating your explanation…
              </div>
            )}

            {roadmapOutcome && (
              <div className="mb-4 p-5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <RoadmapView roadmap={roadmapOutcome.roadmap} />
                {roadmapOutcome.status === 'fallback' && (
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                    <span aria-hidden="true" className="material-icons-outlined text-sm mt-0.5 shrink-0">info</span>
                    <span>
                      The AI assistant was unavailable ({ROADMAP_FAILURE_LABELS[roadmapOutcome.error]}). The structured guidance above was generated from the deterministic engine instead.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleGenerateRoadmap}
            disabled={loadingRoadmap}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingRoadmap ? (
              <>
                <span aria-hidden="true" className="material-icons-outlined animate-spin text-base">refresh</span>
                Generating…
              </>
            ) : (
              <>
                <span aria-hidden="true" className="material-icons-outlined text-base">auto_awesome</span>
                {roadmapOutcome ? 'Regenerate explanation' : 'Generate explanation'}
              </>
            )}
          </button>
        </div>

        <div className="mb-6 p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span aria-hidden="true" className="material-icons-outlined text-primary">contact_phone</span>
            Where should we send your report?
          </h2>
          <div className="space-y-4">
            <div>
              <FieldLabel text="Phone Number (WhatsApp)" htmlFor="phone" required />
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none text-sm"
                placeholder="0803 123 4567"
                value={data.phone}
                onChange={(e) => patch('phone', e.target.value)}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'err-phone' : undefined}
              />
              <ErrMsg id="err-phone" text={errors.phone} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel text="Full Name" htmlFor="contactName" />
                <input
                  id="contactName"
                  type="text"
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none text-sm"
                  placeholder="Oluwaseun Adeyemi"
                  value={data.contactName}
                  onChange={(e) => patch('contactName', e.target.value)}
                />
              </div>
              <div>
                <FieldLabel text="Email Address" htmlFor="email" />
                <input
                  id="email"
                  type="email"
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none text-sm"
                  placeholder="you@example.com"
                  value={data.email}
                  onChange={(e) => patch('email', e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'err-email' : undefined}
                />
                <ErrMsg id="err-email" text={errors.email} />
              </div>
            </div>
          </div>
        </div>

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mb-4 inline-flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#0F7A6E] dark:text-[#25D366] py-4 rounded-xl font-bold text-sm sm:text-base transition-all"
        >
          <span>Continue on WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={handleComplete}
          className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
        >
          <span aria-hidden="true" className="material-icons-outlined text-lg">task_alt</span>
          Submit Application
        </button>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] text-gray-500 font-bold uppercase pt-4">
          <span className="flex items-center gap-1"><span aria-hidden="true" className="material-icons-outlined text-xs">lock</span> 100% Confidential</span>
          <span className="flex items-center gap-1"><span aria-hidden="true" className="material-icons-outlined text-xs text-primary">offline_pin</span> Saved locally on this device</span>
        </div>
      </div>
    );
  };

  const renderSubmitted = () => (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <div className="bg-white dark:bg-[#161F30] rounded-3xl shadow-xl border border-gray-200/80 dark:border-gray-800 p-6 sm:p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
          <span aria-hidden="true" className="material-icons-outlined text-3xl">task_alt</span>
        </div>

        <h1
          ref={submittedHeadingRef}
          tabIndex={-1}
          className="mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white"
        >
          Application summary ready
        </h1>
        <p className="mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl mx-auto">
          Thanks{data.contactName ? `, ${data.contactName}` : ''}. Your project has been checked against the
          LASPPPA requirements. Send the summary to a consultant on WhatsApp to begin the formal submission.
        </p>

        <dl className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <dt className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Project site</dt>
            <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-white break-words">
              {data.address || 'Not specified'}
            </dd>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <dt className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">LGA</dt>
            <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-white break-words">
              {data.lga || 'Not specified'}
            </dd>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <dt className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Readiness</dt>
            <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
              {assessment.readinessScore}%
            </dd>
          </div>
        </dl>

        <div className="mt-8 space-y-3">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#0F7A6E] hover:bg-[#0B5A51] text-white py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-md transition-all"
          >
            <svg aria-hidden="true" focusable="false" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.77.781 2.796.781 3.182 0 5.768-2.587 5.768-5.766.001-3.187-2.575-5.767-5.768-5.767zm9.969 5.766c0 5.405-4.394 9.799-9.799 9.799-1.688 0-3.277-.432-4.665-1.189l-5.536 1.452 1.48-5.394c-.827-1.439-1.279-3.097-1.279-4.868 0-5.405 4.395-9.799 9.799-9.799 5.405 0 10 4.394 10 9.799z"/>
            </svg>
            <span>Send Summary on WhatsApp</span>
          </a>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold text-sm transition-all"
            >
              <span aria-hidden="true" className="material-icons-outlined text-base">home</span>
              Back to Home
            </Link>
            <button
              type="button"
              onClick={startNewApplication}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 rounded-xl font-bold text-sm transition-all"
            >
              <span aria-hidden="true" className="material-icons-outlined text-base">restart_alt</span>
              Start Another Application
            </button>
          </div>
        </div>

        <p className="mt-6 text-[11px] text-gray-500 font-bold uppercase">
          <span aria-hidden="true" className="material-icons-outlined text-xs align-middle text-primary">lock</span>{' '}
          No data is stored on a server
        </p>
      </div>
    </div>
  );

  return (
    <div className="pt-24 sm:pt-28 pb-24 min-h-screen bg-gray-50 dark:bg-[#0B1120]">
      {submitted ? (
        renderSubmitted()
      ) : (
        <>
          {restored && (
            <div className="max-w-3xl mx-auto mb-6 px-4 sm:px-6">
              <div className="flex items-start justify-between gap-3 p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60">
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className="material-icons-outlined text-sky-600 dark:text-sky-300 mt-0.5">restore</span>
                  <div>
                    <div className="text-sm font-bold text-sky-900 dark:text-sky-200">Resumed your in-progress application</div>
                    <div className="text-xs text-sky-700 dark:text-sky-300 mt-0.5">Step {step} of 4 — changes are saved automatically on this device.</div>
                  </div>
                </div>
                <button type="button" onClick={discardAndRestart} className="text-xs font-bold text-sky-700 dark:text-sky-300 hover:text-sky-900 whitespace-nowrap py-2.5 -my-2.5 px-1 -mr-1 min-h-11">
                  Discard &amp; start fresh
                </button>
              </div>
            </div>
          )}

          {renderProgress()}

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-[#161F30] rounded-3xl shadow-xl border border-gray-200/80 dark:border-gray-800 overflow-hidden transition-all">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};