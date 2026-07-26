"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  FileText,
  Send,
  ExternalLink,
  Loader2,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { DocumentChecklist } from "./DocumentChecklist";
import { Opportunity, UserDocument, DocumentType } from "@/lib/types";
import clsx from "clsx";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  scholarship: Opportunity;
  userId: string;
}

type Step = "documents" | "generate" | "review";

export function ApplicationModal({
  isOpen,
  onClose,
  scholarship,
  userId,
}: ApplicationModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("documents");
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedEssay, setGeneratedEssay] = useState<string>("");
  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
      setCurrentStep("documents");
      setSaved(false);
      setGeneratedEssay("");
      setGeneratedLetter("");
      setError(null);
    }
  }, [isOpen]);

  const loadDocuments = async () => {
    const { data } = await supabase
      .from("user_documents")
      .select("*")
      .eq("user_id", userId);

    setDocuments(data || []);
  };

  const allDocumentsUploaded = () => {
    const required: DocumentType[] = [
      "cv",
      "transcript",
      "passport",
      "personal_statement",
    ];
    const uploaded = documents.map((d) => d.type);
    return required.every((r) => uploaded.includes(r));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          scholarshipId: scholarship.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate content");
      }

      const data = await response.json();
      setGeneratedEssay(data.essay);
      setGeneratedLetter(data.letter);
      setCurrentStep("review");
    } catch (err) {
      console.error("Generation error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate content"
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const fullContent = `## Personal Statement\n\n${generatedEssay}\n\n---\n\n## Motivation Letter\n\n${generatedLetter}`;

      const { error: saveError } = await supabase.from("applications").insert({
        user_id: userId,
        scholarship_id: scholarship.id,
        status: "draft",
        generated_essay: fullContent,
      } as any);

      if (saveError) throw saveError;

      setSaved(true);
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save application. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    {
      key: "documents",
      label: "Documents",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      key: "generate",
      label: "Generate",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      key: "review",
      label: "Review",
      icon: <Send className="w-4 h-4" />,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto md:inset-y-0 md:right-0 md:left-auto md:w-[500px] md:max-h-full"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none min-h-[60vh] md:min-h-full">
              {/* Header */}
              <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Apply with AI
                  </h2>
                  <p className="text-xs text-zinc-400">{scholarship.title}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              {/* Step indicators */}
              <div className="flex items-center justify-center gap-1 px-4 py-3 bg-zinc-900/50">
                {steps.map((step, i) => (
                  <div key={step.key} className="flex items-center">
                    <div
                      className={clsx(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all",
                        currentStep === step.key
                          ? "bg-accent/20 text-accent-light"
                          : steps.findIndex((s) => s.key === currentStep) > i
                          ? "text-green-400"
                          : "text-zinc-500"
                      )}
                    >
                      {step.icon}
                      <span className="font-medium">{step.label}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-zinc-600 mx-1" />
                    )}
                  </div>
                ))}
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {currentStep === "documents" && (
                  <div className="space-y-4">
                    <DocumentChecklist
                      documents={documents}
                      userId={userId}
                      onUploadComplete={loadDocuments}
                    />

                    <button
                      onClick={() => setCurrentStep("generate")}
                      disabled={!allDocumentsUploaded()}
                      className={clsx(
                        "w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
                        allDocumentsUploaded()
                          ? "bg-accent text-white hover:bg-accent-dark active:scale-[0.98]"
                          : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                      )}
                    >
                      <Sparkles className="w-4 h-4" />
                      Continue to Generate
                    </button>

                    {!allDocumentsUploaded() && (
                      <p className="text-xs text-zinc-500 text-center">
                        Please upload all required documents to continue
                      </p>
                    )}
                  </div>
                )}

                {currentStep === "generate" && (
                  <div className="space-y-4">
                    <div className="text-center py-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/30 to-blue-500/30 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-accent-light" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        AI-Powered Generation
                      </h3>
                      <p className="text-sm text-zinc-400 mb-6 max-w-sm mx-auto">
                        Our AI will generate a personalized personal statement
                        and motivation letter based on your profile and this
                        scholarship.
                      </p>

                      {error && (
                        <p className="text-sm text-red-400 mb-4">{error}</p>
                      )}

                      <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="px-8 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-dark transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate Application Content
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === "review" && (
                  <div className="space-y-4">
                    {saved ? (
                      <div className="text-center py-8 space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Application Saved!
                          </h3>
                          <p className="text-sm text-zinc-400 mt-1">
                            Your application has been saved as a draft. You can
                            now proceed to the official application page.
                          </p>
                        </div>
                        <a
                          href={scholarship.application_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-dark transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open Application Link
                        </a>
                      </div>
                    ) : (
                      <>
                        {/* Generated Essay Preview */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-accent-light" />
                            Generated Content
                          </h3>

                          <div className="bg-zinc-800/50 rounded-xl p-4 max-h-[300px] overflow-y-auto">
                            <div className="prose prose-invert prose-sm max-w-none">
                              <h4 className="text-accent-light font-semibold mb-2">
                                Personal Statement
                              </h4>
                              <p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">
                                {generatedEssay}
                              </p>

                              <hr className="border-zinc-700 my-4" />

                              <h4 className="text-accent-light font-semibold mb-2">
                                Motivation Letter
                              </h4>
                              <p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">
                                {generatedLetter}
                              </p>
                            </div>
                          </div>
                        </div>

                        {error && (
                          <p className="text-sm text-red-400">{error}</p>
                        )}

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-dark transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Save Application
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleGenerate()}
                            className="w-full py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                          >
                            Regenerate
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
