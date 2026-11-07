/** Plans and premium feature flags. Free is the only plan that can be used today. No payments are taken. */
export type PlanId = "free" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  priceLabel: string;
  description: string;
  /** requests per signed-in account per day (UTC) */
  aiRequestsPerDay: number;
  /** can this plan be bought or used right now? */
  available: boolean;
  highlights: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    priceLabel: "$0",
    description: "Every tool, free to use. An account is optional.",
    aiRequestsPerDay: 100,
    available: true,
    highlights: [
      "All PDF, image, calculator and productivity tools",
      "AI tools and AI Assistant with daily limits",
      "Notes, tasks, planner and habits synced when you log in",
      "Files stay in your browser",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceLabel: "Not available yet",
    description: "Planned for power users. Nothing can be purchased today.",
    aiRequestsPerDay: 1000,
    available: false,
    highlights: [
      "Much higher daily AI limits",
      "Larger file size limits",
      "Batch processing for image tools",
      "No advertisements",
    ],
  },
};

export type PremiumFeature = "higher-ai-limits" | "larger-files" | "batch-image-tools" | "ad-free";

export const PREMIUM_FEATURES: Record<PremiumFeature, { label: string; plans: PlanId[] }> = {
  "higher-ai-limits": { label: "Higher daily AI limits", plans: ["pro"] },
  "larger-files": { label: "Larger file size limits", plans: ["pro"] },
  "batch-image-tools": { label: "Batch image processing", plans: ["pro"] },
  "ad-free": { label: "No advertisements", plans: ["pro"] },
};

export function hasFeature(plan: PlanId, feature: PremiumFeature): boolean {
  return PREMIUM_FEATURES[feature].plans.includes(plan);
}

export function aiLimitFor(plan: PlanId): number {
  return PLANS[plan].aiRequestsPerDay;
}
