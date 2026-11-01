"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/Checkbox";
import { useToast } from "@/components/ui/Toast";
import { PageContainer } from "@/components/layout/PageContainer";

const PUSH_OPTIONS = [
  { id: "routine_reminder", label: "Routine reminders", desc: "Daily reminders for unfinished Dinacharya practices" },
  { id: "streak_alert",     label: "Streak alerts",     desc: "Notify when your streak is at risk" },
  { id: "ai_insights",      label: "AI insights",       desc: "Personalised recommendations from AI Vaidya" },
  { id: "achievements",     label: "Achievements",      desc: "Celebrate milestones and unlocked badges" },
];

const EMAIL_OPTIONS = [
  { id: "weekly_summary",   label: "Weekly summary", desc: "A recap of your wellness progress every Sunday" },
  { id: "product_updates",  label: "Product updates", desc: "New features and improvements" },
  { id: "promotional",      label: "Offers & promotions", desc: "Discounts on Pro and Elite plans" },
];

export default function NotificationSettingsPage() {
  const { toast } = useToast();
  const [push, setPush] = React.useState<Record<string, boolean>>({
    routine_reminder: true, streak_alert: true, ai_insights: true, achievements: true,
  });
  const [email, setEmail] = React.useState<Record<string, boolean>>({
    weekly_summary: true, product_updates: false, promotional: false,
  });

  const toggle = (set: React.Dispatch<React.SetStateAction<Record<string, boolean>>>, id: string) => {
    set((p) => ({ ...p, [id]: !p[id] }));
    toast({ type: "success", title: "Preference saved" });
  };

  return (
    <PageContainer className="py-8 max-w-2xl mx-auto">
      <motion.div className="flex flex-col gap-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        <div>
          <h1 className="text-h1 font-display font-bold text-text-heading mb-1">Notifications</h1>
          <p className="text-body text-text-muted">Choose what you want to be notified about</p>
        </div>

        <div className="p-6 rounded-xl bg-surface-card border border-border-default">
          <h3 className="text-h4 font-semibold text-text-heading mb-4">Push Notifications</h3>
          <div className="flex flex-col gap-4">
            {PUSH_OPTIONS.map((opt) => (
              <Checkbox key={opt.id} label={opt.label} description={opt.desc}
                checked={push[opt.id]} onChange={() => toggle(setPush, opt.id)} />
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-surface-card border border-border-default">
          <h3 className="text-h4 font-semibold text-text-heading mb-4">Email Notifications</h3>
          <div className="flex flex-col gap-4">
            {EMAIL_OPTIONS.map((opt) => (
              <Checkbox key={opt.id} label={opt.label} description={opt.desc}
                checked={email[opt.id]} onChange={() => toggle(setEmail, opt.id)} />
            ))}
          </div>
        </div>
      </motion.div>
    </PageContainer>
  );
}