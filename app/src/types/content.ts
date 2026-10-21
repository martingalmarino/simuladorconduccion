export type JurisdictionId = 'ar-caba' | 'ar-x-cordoba-capital' | 'ar-nacional';

export type ScopeKind = 'local' | 'national-framework';

export type LicenseClass = 'B1';

export type PracticeModeId = 'learn' | 'practice';

export type FeedbackTiming = 'immediate' | 'at-end';

export interface AnswerOption {
  id: string;
  text: string;
}

export interface QuestionSourceRef {
  sourceId: string;
  locator: string;
}

export interface Question {
  id: string;
  jurisdictionId: JurisdictionId;
  licenseClasses: LicenseClass[];
  topic: string;
  prompt: string;
  options: AnswerOption[];
  correctOptionId: string;
  explanation: string;
  imageId: string | null;
  sources: QuestionSourceRef[];
  contentStatus: 'source-checked-draft';
  sourceCheckedAt: string;
  humanReviewedAt: string | null;
  humanReviewer: string | null;
  authorship: 'original-editorial';
  version: number;
  scopeKind?: ScopeKind;
  scopeNote?: string;
}

export interface QuestionBank {
  schemaVersion: string;
  bankId: string;
  title: string;
  coverage: string;
  questions: Question[];
  scopeKind?: ScopeKind;
  scopeNote?: string;
}

export interface Source {
  id: string;
  title: string;
  publisher: string;
  jurisdictionId: JurisdictionId;
  url: string;
  type: string;
  accessedAt: string;
  usage?: string;
}

export interface Asset {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  origin: string;
  createdAt: string;
  note?: string;
  sourceId?: string;
  locator?: string;
}

export interface PracticeModeConfig {
  id: PracticeModeId;
  label: string;
  feedback: FeedbackTiming;
  questionCounts: number[];
  timeLimitSeconds: number | null;
}

export interface JurisdictionPageCopy {
  title: string;
  h1: string;
  description: string;
  intro: string;
  notice: string;
  scopeLabel: string;
  sourceCheckedAt: string;
}

export interface JurisdictionConfig {
  id: JurisdictionId;
  label: string;
  slug: string;
  bankId: string;
  geographicScope: string;
  licenseClasses: LicenseClass[];
  fullSyllabus: boolean;
  scopeKind?: ScopeKind;
  practiceModes?: PracticeModeConfig[];
  notice?: string;
  contextLabel?: string;
  page?: JurisdictionPageCopy;
}

export type UpcomingTestStatus = 'proximamente';

export interface UpcomingTest {
  id: string;
  slug: string;
  licenseClass: string;
  title: string;
  subtitle: string;
  status: UpcomingTestStatus;
}

export interface SiteConfig {
  siteName: string;
  locale: string;
  siteUrl: string | null;
  indexableProduction: boolean;
  officialExamMode: {
    enabled: boolean;
    reason: string;
    profiles: unknown[];
  };
  practiceModes: PracticeModeConfig[];
  jurisdictions: JurisdictionConfig[];
  plannedClasses: string[];
  upcomingTests: UpcomingTest[];
  notice: string;
  launchReview: {
    humanContentReviewComplete: boolean;
    note: string;
  };
}

export interface ResolvedSource {
  sourceId: string;
  locator: string;
  title: string;
  publisher: string;
  url: string;
  accessedAt: string;
}

export interface SessionQuestion {
  id: string;
  prompt: string;
  topic: string;
  explanation: string;
  correctOptionId: string;
  options: AnswerOption[];
  image: Asset | null;
  sources: ResolvedSource[];
  sourceCheckedAt: string;
  version: number;
  scopeNote?: string | null;
}

export type SessionAnswerMap = Record<string, string | null>;

export interface PracticeSession {
  schemaVersion: 1;
  contentVersion: string;
  attemptId: string;
  bankId: string;
  jurisdictionId: JurisdictionId;
  jurisdictionSlug: string;
  jurisdictionLabel: string;
  licenseClasses: LicenseClass[];
  mode: PracticeModeId;
  feedback: FeedbackTiming;
  questionCount: number;
  questionIds: string[];
  questions: SessionQuestion[];
  answers: SessionAnswerMap;
  submittedLearn: Record<string, boolean>;
  currentIndex: number;
  startedAt: string;
  finishedAt: string | null;
  status: 'active' | 'finished';
}

export interface PracticeHistoryEntry {
  attemptId: string;
  bankId: string;
  jurisdictionLabel: string;
  mode: PracticeModeId;
  questionCount: number;
  correctCount: number;
  unansweredCount: number;
  percentage: number;
  finishedAt: string;
}

export interface ScoreSummary {
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  percentage: number;
  missedQuestionIds: string[];
  unansweredQuestionIds: string[];
  topicsToReview: string[];
}
