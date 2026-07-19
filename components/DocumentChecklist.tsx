"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { UserDocument, DocumentType } from "@/lib/types";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import clsx from "clsx";

interface DocumentChecklistProps {
  documents: UserDocument[];
  userId: string;
  onUploadComplete: () => void;
}

const DOCUMENT_TYPES: {
  type: DocumentType;
  label: string;
  description: string;
}[] = [
  { type: "cv", label: "CV / Resume", description: "PDF format, max 5MB" },
  {
    type: "transcript",
    label: "Academic Transcript",
    description: "PDF format, max 5MB",
  },
  {
    type: "passport",
    label: "Passport Copy",
    description: "PDF or image, max 5MB",
  },
  {
    type: "personal_statement",
    label: "Personal Statement",
    description: "PDF or DOC, max 5MB",
  },
];

export function DocumentChecklist({
  documents,
  userId,
  onUploadComplete,
}: DocumentChecklistProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const getDocumentStatus = (type: DocumentType) => {
    return documents.find((d) => d.type === type);
  };

  const handleUpload = async (type: DocumentType) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploading(type);
      setError(null);

      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("documents")
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase.from("user_documents").insert(
          {
            user_id: userId,
            type,
            file_url: urlData.publicUrl,
          } as any
        );

        if (dbError) throw dbError;

        onUploadComplete();
      } catch (err) {
        console.error("Upload error:", err);
        setError(`Failed to upload ${type}. Please try again.`);
      } finally {
        setUploading(null);
      }
    };

    input.click();
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Required Documents</h3>
      <p className="text-sm text-zinc-400">
        Upload your documents to proceed with the application. All documents are
        stored securely.
      </p>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        {DOCUMENT_TYPES.map(({ type, label, description }) => {
          const existing = getDocumentStatus(type);
          const isUploading = uploading === type;

          return (
            <div
              key={type}
              className={clsx(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                existing
                  ? "bg-green-500/5 border-green-500/20"
                  : "bg-zinc-800/50 border-zinc-700/50"
              )}
            >
              <div
                className={clsx(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  existing
                    ? "bg-green-500/10 text-green-400"
                    : "bg-zinc-700/50 text-zinc-400"
                )}
              >
                {existing ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-zinc-500 truncate">
                  {existing ? "Uploaded successfully" : description}
                </p>
              </div>

              <button
                onClick={() => handleUpload(type)}
                disabled={isUploading || !!existing}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                  existing
                    ? "bg-green-500/10 text-green-400 cursor-default"
                    : isUploading
                    ? "bg-accent/20 text-accent-light cursor-wait"
                    : "bg-accent text-white hover:bg-accent-dark active:scale-95"
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Uploading...
                  </>
                ) : existing ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    Uploaded
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3" />
                    Upload
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
