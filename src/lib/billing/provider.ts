/**
 * Payment integration point. DailyDesk does not take payments yet.
 * To add them later, implement this interface for your provider (Stripe, Razorpay, Paddle, ...),
 * keep secrets in server-only environment variables, and store the resulting plan in a table that
 * only the server can write (never in user-editable tables such as user_settings).
 */
export interface BillingProvider {
  readonly configured: boolean;
  createCheckoutUrl(input: { userId: string; plan: "pro"; returnUrl: string }): Promise<string>;
  createPortalUrl(input: { userId: string; returnUrl: string }): Promise<string>;
}

export const noBillingProvider: BillingProvider = {
  configured: false,
  async createCheckoutUrl() {
    throw new Error("Billing is not configured.");
  },
  async createPortalUrl() {
    throw new Error("Billing is not configured.");
  },
};

export const billing: BillingProvider = noBillingProvider;
