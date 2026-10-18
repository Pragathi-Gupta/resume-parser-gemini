"use client";

import { useState } from "react";

type Result = {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  total_experience_years?: number;
  skills?: string[];
  education?: { institution?: string; degree?: string; year?: string }[];
  experience?: {
    company?: string;
    role?: string;
    duration?: string;
    highlights?: string[];
  }[];
  projects?: { title?: string; description?: string }[];
};

export default function Home() {
  const [mode, setMode] = useState<"pdf" | "text">("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [view, setView] = useState<"summary" | "json">("summary");
  const [copied, setCopied] = useState(false);

  async function handleParse() {
    setError("");
    setResult(null);
    const form = new FormData();

    if (mode === "pdf") {
      if (!file) return setError("Choose a PDF first.");
      form.append("file", file);
    } else {
      if (!text.trim()) return setError("Paste some resume text first.");
      form.append("text", text);
    }

    setLoading(true);
    try {
      const res = await fetch("/api/parse", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
      setView("summary");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function copyJson() {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const tab = (active: boolean) =>
    `px-4 py-2 text-sm rounded-full transition ${
      active
        ? "bg-neutral-900 text-white"
        : "text-neutral-500 hover:text-neutral-900"
    }`;

  return (
    <div className="min-h-screen bg-[#fafaf9] text-neutral-900">
      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Resume Parser
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Turn any resume into clean, structured data.
        </h1>
        <p className="mt-4 max-w-xl text-neutral-600">
          Upload a PDF or paste raw text. Gemini reads it and returns skills,
          education and experience as JSON.
        </p>

        {/* Input card */}
        <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex gap-2">
            <button className={tab(mode === "pdf")} onClick={() => setMode("pdf")}>
              Upload PDF
            </button>
            <button className={tab(mode === "text")} onClick={() => setMode("text")}>
              Paste text
            </button>
          </div>

          <div className="mt-5">
            {mode === "pdf" ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 px-6 py-12 text-center transition hover:border-neutral-900">
                <span className="text-sm font-medium">
                  {file ? file.name : "Click to choose a PDF"}
                </span>
                <span className="mt-1 text-xs text-neutral-500">
                  PDF only, up to 4 MB
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            ) : (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the resume text here..."
                className="h-56 w-full resize-none rounded-xl border border-neutral-200 p-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
              />
            )}
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button
            onClick={handleParse}
            disabled={loading}
            className="mt-5 w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            {loading ? "Parsing..." : "Parse resume"}
          </button>
        </section>

        {/* Results */}
        {result && (
          <section className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  className={tab(view === "summary")}
                  onClick={() => setView("summary")}
                >
                  Summary
                </button>
                <button
                  className={tab(view === "json")}
                  onClick={() => setView("json")}
                >
                  JSON
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyJson}
                  className="rounded-full border border-neutral-300 px-4 py-2 text-sm transition hover:border-neutral-900"
                >
                  {copied ? "Copied" : "Copy JSON"}
                </button>
                <button
                  onClick={downloadJson}
                  className="rounded-full border border-neutral-300 px-4 py-2 text-sm transition hover:border-neutral-900"
                >
                  Download
                </button>
              </div>
            </div>

            {view === "json" ? (
              <pre className="mt-5 overflow-x-auto rounded-2xl bg-neutral-900 p-6 text-xs leading-relaxed text-neutral-100">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <div className="mt-5 space-y-5">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                  <h2 className="text-2xl font-semibold">{result.name}</h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    {[result.email, result.phone, result.location]
                      .filter(Boolean)
                      .join("  ·  ")}
                  </p>
                  {typeof result.total_experience_years === "number" && (
                    <p className="mt-3 text-sm text-neutral-600">
                      {result.total_experience_years} years of experience
                    </p>
                  )}
                  {result.summary && (
                    <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                      {result.summary}
                    </p>
                  )}
                </div>

                {!!result.skills?.length && (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                    <h3 className="text-xs uppercase tracking-[0.15em] text-neutral-500">
                      Skills
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.skills.map((s, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-800"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!!result.education?.length && (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                    <h3 className="text-xs uppercase tracking-[0.15em] text-neutral-500">
                      Education
                    </h3>
                    <div className="mt-3 space-y-3">
                      {result.education.map((e, i) => (
                        <div key={i}>
                          <p className="text-sm font-medium">{e.degree}</p>
                          <p className="text-sm text-neutral-500">
                            {[e.institution, e.year].filter(Boolean).join("  ·  ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!!result.experience?.length && (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                    <h3 className="text-xs uppercase tracking-[0.15em] text-neutral-500">
                      Experience
                    </h3>
                    <div className="mt-3 space-y-5">
                      {result.experience.map((x, i) => (
                        <div key={i}>
                          <p className="text-sm font-medium">{x.role}</p>
                          <p className="text-sm text-neutral-500">
                            {[x.company, x.duration].filter(Boolean).join("  ·  ")}
                          </p>
                          {!!x.highlights?.length && (
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
                              {x.highlights.map((h, j) => (
                                <li key={j}>{h}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!!result.projects?.length && (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                    <h3 className="text-xs uppercase tracking-[0.15em] text-neutral-500">
                      Projects
                    </h3>
                    <div className="mt-3 space-y-4">
                      {result.projects.map((p, i) => (
                        <div key={i}>
                          <p className="text-sm font-medium">{p.title}</p>
                          <p className="text-sm text-neutral-600">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        <footer className="mt-16 text-xs text-neutral-400">
          Built with Next.js and Google Gemini
        </footer>
      </main>
    </div>
  );
}