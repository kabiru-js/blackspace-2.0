"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { UserDocument, DocumentType } from "@/lib/types";
import { Upload, CheckCircle2, AlertCircle, FileText, Loader2 } from "lucide-react";

const DOCUMENT_TYPES: { type: DocumentType; label: string; description: string }[] = [
  { type: "cv", label: "CV / Resume", description: "PDF format, max 5MB" },
  { type: "transcript", label: "Academic Transcript", description: "PDF format, max 5MB" },
  { type: "passport", label: "Passport Copy", description: "PDF or image, max 5MB" },
  { type: "personal_statement", label: "Personal Statement", description: "PDF or DOC, max 5MB" },
];

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const display = { fontFamily: "'Space Grotesk', sans-serif" };

export function DocumentChecklist({ documents, userId, onUploadComplete }: { documents: UserDocument[]; userId: string; onUploadComplete: () => void }) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const getDocumentStatus = (type: DocumentType) => documents.find((d) => d.type === type);

  const handleUpload = async (type: DocumentType) => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploading(type); setError(null);
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, file, { cacheControl: "3600", upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("documents").getPublicUrl(fileName);
        const { error: dbError } = await supabase.from("user_documents").insert({ user_id: userId, type, file_url: urlData.publicUrl } as any);
        if (dbError) throw dbError;
        onUploadComplete();
      } catch (err) { setError(`Failed to upload ${type}.`); }
      finally { setUploading(null); }
    };
    input.click();
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold" style={{ ...display, color: "var(--text)" }}>Required Documents</h3>
      <p className="text-sm" style={{ color: "var(--muted)" }}>Upload your documents to proceed. All documents are stored securely.</p>

      {error && (
        <div className="p-3 rounded-2xl border flex items-center gap-2 text-sm"
          style={{ background: "rgba(255,46,159,.06)", borderColor: "rgba(255,46,159,.15)", color: "var(--magenta)", ...mono }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="space-y-2">
        {DOCUMENT_TYPES.map(({ type, label, description }) => {
          const existing = getDocumentStatus(type);
          const isUploading = uploading === type;
          return (
            <div key={type} className="flex items-center gap-3 p-3 rounded-2xl border transition-all"
              style={{
                background: existing ? "rgba(26,174,57,.04)" : "var(--card)",
                borderColor: existing ? "rgba(26,174,57,.15)" : "var(--line-strong)",
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: existing ? "rgba(26,174,57,.08)" : "var(--card)",
                  color: existing ? "var(--lime)" : "var(--faint)",
                }}>
                {existing ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{label}</p>
                <p className="text-xs truncate" style={{ ...mono, color: "var(--faint)" }}>
                  {existing ? "Uploaded successfully" : description}
                </p>
              </div>
              <button onClick={() => handleUpload(type)} disabled={isUploading || !!existing}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5"
                style={{
                  ...mono,
                  background: existing ? "rgba(26,174,57,.08)" : isUploading ? "rgba(214,255,63,.1)" : "var(--lime)",
                  border: existing ? "1px solid rgba(26,174,57,.15)" : "none",
                  color: existing ? "var(--lime)" : isUploading ? "var(--lime)" : "#050506",
                }}>
                {isUploading ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</>
                  : existing ? <><CheckCircle2 className="w-3 h-3" /> Uploaded</>
                  : <><Upload className="w-3 h-3" /> Upload</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
