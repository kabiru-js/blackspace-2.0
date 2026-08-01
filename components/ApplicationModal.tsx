"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, FileText, Send, ExternalLink, Loader2, ChevronRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { DocumentChecklist } from "./DocumentChecklist";
import { Opportunity, UserDocument, DocumentType } from "@/lib/types";

interface ApplicationModalProps { isOpen: boolean; onClose: () => void; scholarship: Opportunity; userId: string; }
type Step = "documents" | "generate" | "review";

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const display = { fontFamily: "'Space Grotesk', sans-serif" };
const glass = { background: "rgba(5,5,6,.75)", backdropFilter: "blur(14px)" };
const cardBg = { background: "linear-gradient(160deg, var(--card2), var(--card))" };

export function ApplicationModal({ isOpen, onClose, scholarship, userId }: ApplicationModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("documents");
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedEssay, setGeneratedEssay] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) { loadDocuments(); setCurrentStep("documents"); setSaved(false); setGeneratedEssay(""); setGeneratedLetter(""); setError(null); }
  }, [isOpen]);

  const loadDocuments = async () => {
    const { data } = await supabase.from("user_documents").select("*").eq("user_id", userId);
    setDocuments(data || []);
  };

  const allDocumentsUploaded = () => {
    const required: DocumentType[] = ["cv", "transcript", "passport", "personal_statement"];
    return required.every((r) => documents.map((d) => d.type).includes(r));
  };

  const handleGenerate = async () => {
    setGenerating(true); setError(null);
    try {
      const response = await fetch("/api/generate-essay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, scholarshipId: scholarship.id }) });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || "Failed to generate"); }
      const data = await response.json();
      setGeneratedEssay(data.essay); setGeneratedLetter(data.letter); setCurrentStep("review");
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to generate"); }
    finally { setGenerating(false); }
  };

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      const fullContent = `## Personal Statement\n\n${generatedEssay}\n\n---\n\n## Motivation Letter\n\n${generatedLetter}`;
      const { error: saveError } = await supabase.from("applications").insert({ user_id: userId, scholarship_id: scholarship.id, status: "draft", generated_essay: fullContent } as any);
      if (saveError) throw saveError;
      setSaved(true);
    } catch (err) { setError("Failed to save application."); }
    finally { setSaving(false); }
  };

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: "documents", label: "Documents", icon: <FileText className="w-4 h-4" /> },
    { key: "generate", label: "Generate", icon: <Sparkles className="w-4 h-4" /> },
    { key: "review", label: "Review", icon: <Send className="w-4 h-4" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50" style={{ background: "rgba(5,5,6,.85)", backdropFilter: "blur(8px)" }}
            onClick={onClose} />

          <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto md:inset-y-0 md:right-0 md:left-auto md:w-[500px] md:max-h-full">
            <div className="rounded-t-[22px] md:rounded-l-[22px] md:rounded-tr-none min-h-[60vh] md:min-h-full" style={{ ...cardBg, border: "1px solid var(--line-strong)" }}>
              {/* Header */}
              <div className="sticky top-0 p-4 flex items-center justify-between z-10 border-b" style={{ ...glass, borderColor: "var(--line)" }}>
                <div>
                  <h2 className="text-lg font-bold" style={{ ...display, color: "var(--text)" }}>Apply with AI</h2>
                  <p className="text-xs" style={{ ...mono, color: "var(--faint)" }}>{scholarship.title}</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "var(--card)", border: "1px solid var(--line-strong)", color: "var(--faint)" }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step indicators */}
              <div className="flex items-center justify-center gap-1 px-4 py-3" style={{ ...glass }}>
                {steps.map((step, i) => {
                  const isCurrent = currentStep === step.key;
                  const isDone = steps.findIndex((s) => s.key === currentStep) > i;
                  return (
                    <div key={step.key} className="flex items-center">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all" style={{
                        ...mono,
                        background: isCurrent ? "rgba(214,255,63,.1)" : "transparent",
                        color: isCurrent ? "var(--lime)" : isDone ? "var(--lime)" : "var(--faint)",
                      }}>
                        {step.icon}<span className="font-medium">{step.label}</span>
                      </div>
                      {i < steps.length - 1 && <ChevronRight className="w-3 h-3 mx-1" style={{ color: "var(--faint)" }} />}
                    </div>
                  );
                })}
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">

                {/* DOCUMENTS */}
                {currentStep === "documents" && (
                  <div className="space-y-4">
                    <DocumentChecklist documents={documents} userId={userId} onUploadComplete={loadDocuments} />
                    <button onClick={() => setCurrentStep("generate")} disabled={!allDocumentsUploaded()}
                      className="btn btn-primary w-full justify-center" style={{ opacity: allDocumentsUploaded() ? 1 : 0.3 }}>
                      <Sparkles className="w-4 h-4" /> Continue to Generate
                    </button>
                    {!allDocumentsUploaded() && (
                      <p className="text-xs text-center" style={{ ...mono, color: "var(--faint)" }}>Please upload all required documents</p>
                    )}
                  </div>
                )}

                {/* GENERATE */}
                {currentStep === "generate" && (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{ background: "radial-gradient(circle, rgba(214,255,63,.15), rgba(42,245,207,.08))", border: "1px solid rgba(214,255,63,.15)" }}>
                      <Sparkles className="w-8 h-8" style={{ color: "var(--lime)" }} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ ...display, color: "var(--text)" }}>AI-Powered Generation</h3>
                    <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "var(--muted)" }}>Our AI will generate a personalized personal statement and motivation letter.</p>
                    {error && <p className="text-sm mb-4" style={{ color: "var(--magenta)" }}>{error}</p>}
                    <button onClick={handleGenerate} disabled={generating} className="btn btn-primary"
                      style={{ opacity: generating ? 0.5 : 1, padding: "12px 32px" }}>
                      {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Application</>}
                    </button>
                  </div>
                )}

                {/* REVIEW */}
                {currentStep === "review" && (
                  <div className="space-y-4">
                    {saved ? (
                      <div className="text-center py-8 space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ background: "rgba(26,174,57,.1)", border: "1px solid rgba(26,174,57,.2)" }}>
                          <CheckCircle2 className="w-8 h-8" style={{ color: "var(--lime)" }} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold" style={{ ...display, color: "var(--text)" }}>Application Saved!</h3>
                          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Your application is saved as a draft.</p>
                        </div>
                        <a href={scholarship.application_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary inline-flex" style={{ padding: "12px 24px" }}>
                          <ExternalLink className="w-4 h-4" /> Open Application Link
                        </a>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          <h3 className="font-semibold flex items-center gap-2" style={{ ...display, color: "var(--text)" }}>
                            <FileText className="w-4 h-4" style={{ color: "var(--lime)" }} /> Generated Content
                          </h3>
                          <div className="rounded-xl p-4 max-h-[300px] overflow-y-auto" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
                            <h4 className="font-semibold mb-2" style={{ ...mono, color: "var(--lime)", fontSize: "12px" }}>Personal Statement</h4>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{generatedEssay}</p>
                            <hr className="my-4" style={{ borderColor: "var(--line)" }} />
                            <h4 className="font-semibold mb-2" style={{ ...mono, color: "var(--lime)", fontSize: "12px" }}>Motivation Letter</h4>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{generatedLetter}</p>
                          </div>
                        </div>
                        {error && <p className="text-sm" style={{ color: "var(--magenta)" }}>{error}</p>}
                        <div className="flex flex-col gap-2">
                          <button onClick={handleSave} disabled={saving} className="btn btn-primary w-full justify-center" style={{ opacity: saving ? 0.5 : 1 }}>
                            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-4 h-4" /> Save Application</>}
                          </button>
                          <button onClick={() => handleGenerate()}
                            className="w-full py-2 text-sm transition-colors rounded-full"
                            style={{ ...mono, color: "var(--faint)" }}>Regenerate</button>
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
