"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";

const PLANS = [
  { name: "Free",  price: 0,   features: ["Prakriti assessment (once)", "10 AI messages/mo", "5 yoga sessions/mo"] },
  { name: "Pro",   price: 499, features: ["Unlimited AI chat", "Full herb encyclopedia", "Unlimited yoga", "Skin analysis 10/mo"] },
  { name: "Elite", price: 999, features: ["Everything in Pro", "Unlimited skin analyses", "Family account (4)", "Wellness coach"] },
];

export default function SubscriptionSettingsPage() {
  const { user } = useAuthStore();
  const currentPlan = user?.plan ?? "free";

  return (
    <PageContainer className="py-8 max-w-3xl mx-auto">
      <motion.div className="flex flex-col gap-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        <div>
          <h1 className="text-h1 font-display font-bold text-text-heading mb-1">Subscription</h1>
          <p className="text-body text-text-muted">Manage your plan and billing</p>
        </div>

        {/* Current plan card */}
        <div className="p-6 rounded-2xl border border-brand-gold/20" style={{ background: "var(--color-brand-gold-pale)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-label font-semibold text-brand-gold uppercase tracking-wider">Current Plan</p>
            <Badge variant="gold" size="md" className="capitalize">{currentPlan}</Badge>
          </div>
          <p className="text-h2 font-display font-bold text-text-heading capitalize">{currentPlan} Plan</p>
          {currentPlan !== "free" && (
            <p className="text-body-sm text-text-muted mt-1">Renews on the 15th of every month</p>
          )}
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const isCurrent = plan.name.toLowerCase() === currentPlan;
            return (
              <div key={plan.name}
                className={cn(
                  "flex flex-col gap-4 p-6 rounded-xl border",
                  isCurrent ? "border-brand-burgundy bg-brand-burgundy/3" : "border-border-default bg-surface-card",
                )}>
                <div className="flex items-center justify-between">
                  <h3 className="text-h4 font-bold text-text-heading">{plan.name}</h3>
                  {isCurrent && <Badge variant="brand" size="sm">Current</Badge>}
                </div>
                <p className="text-h2 font-bold text-text-heading">
                  {plan.price === 0 ? "Free" : `₹${plan.price}/mo`}
                </p>
                <ul className="flex flex-col gap-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-body-sm text-text-body">
                      <svg className="w-4 h-4 text-status-success shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant={isCurrent ? "secondary" : "primary"} disabled={isCurrent} className="mt-auto">
                  {isCurrent ? "Current plan" : "Upgrade"}
                </Button>
              </div>
            );
          })}
        </div>

        {currentPlan !== "free" && (
          <div className="p-5 rounded-xl bg-bg-subtle border border-border-default">
            <p className="text-body-sm text-text-muted">
              Need to cancel? <button type="button" className="text-brand-burgundy font-semibold hover:underline underline-offset-4">Cancel subscription</button>
            </p>
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}