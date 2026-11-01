"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { PageContainer } from "@/components/layout/PageContainer";

export default function PrivacySettingsPage() {
  const { toast } = useToast();
  const [analytics, setAnalytics] = React.useState(true);
  const [personalized, setPersonalized] = React.useState(true);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsExporting(false);
    toast({ type: "success", title: "Data export ready", description: "Check your email for the download link." });
  };

  const handleDelete = () => {
    setShowDeleteModal(false);
    toast({ type: "warning", title: "Deletion request submitted", description: "Your account will be deleted within 30 days." });
  };

  return (
    <PageContainer className="py-8 max-w-2xl mx-auto">
      <motion.div className="flex flex-col gap-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        <div>
          <h1 className="text-h1 font-display font-bold text-text-heading mb-1">Privacy & Data</h1>
          <p className="text-body text-text-muted">Control how your data is used</p>
        </div>

        <div className="p-6 rounded-xl bg-surface-card border border-border-default flex flex-col gap-4">
          <h3 className="text-h4 font-semibold text-text-heading mb-1">Data Usage</h3>
          <Checkbox label="Analytics" description="Help us improve by sharing anonymous usage data"
            checked={analytics} onChange={() => setAnalytics(!analytics)} />
          <Checkbox label="Personalised recommendations" description="Use my activity to improve AI suggestions"
            checked={personalized} onChange={() => setPersonalized(!personalized)} />
        </div>

        <div className="p-6 rounded-xl bg-surface-card border border-border-default flex flex-col gap-4">
          <h3 className="text-h4 font-semibold text-text-heading mb-1">Your Data</h3>
          <div className="flex items-center justify-between p-4 rounded-lg bg-bg-subtle">
            <div>
              <p className="text-body-sm font-semibold text-text-heading">Export your data</p>
              <p className="text-label text-text-muted">Download a copy of all your data</p>
            </div>
            <Button variant="secondary" size="sm" isLoading={isExporting} onClick={handleExport}>
              Export
            </Button>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-status-error/20 bg-status-error-bg flex flex-col gap-3">
          <h3 className="text-h4 font-semibold text-status-error">Delete Account</h3>
          <p className="text-body-sm text-text-body">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button variant="danger" size="sm" className="self-start" onClick={() => setShowDeleteModal(true)}>
            Delete my account
          </Button>
        </div>

        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}
          title="Delete account?" description="This action is permanent and cannot be undone.">
          <p className="text-body-sm text-text-body">
            All your Prakriti results, chat history, yoga progress, and personal data will be
            permanently deleted within 30 days. You will lose access immediately.
          </p>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Yes, delete my account</Button>
          </ModalFooter>
        </Modal>
      </motion.div>
    </PageContainer>
  );
}