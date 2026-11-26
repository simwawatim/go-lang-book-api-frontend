"use client";

import { useState } from "react";
import { ApiError, BookInput, FieldErrors } from "@/lib/api";

type Props = {
  initial?: BookInput;
  submitLabel: string;
  onSubmit: (input: BookInput) => Promise<void>;
  onCancel: () => void;
};

const empty: BookInput = { title: "", author: "", isbn: "", published_year: null, description: "" };

export default function BookForm({ initial = empty, submitLabel, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState({
    title: initial.title,
    author: initial.author,
    isbn: initial.isbn,
    year: initial.published_year === null ? "" : String(initial.published_year),
    description: initial.description,
  });
  const [fields, setFields] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFields({});
    setError("");
    try {
      await onSubmit({
        title: values.title,
        author: values.author,
        isbn: values.isbn,
        published_year: values.year.trim() === "" ? null : Number(values.year),
        description: values.description,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields ?? {});
        setError(err.fields ? "Fix the highlighted fields and save again." : err.message);
      } else {
        setError("Could not reach the server. Check your connection and try again.");
      }
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <Field label="Title" error={fields.title}>
        <input value={values.title} onChange={set("title")} required maxLength={255} autoFocus />
      </Field>
      <Field label="Author" error={fields.author}>
        <input value={values.author} onChange={set("author")} required maxLength={255} />
      </Field>
      <div className="form-row">
        <Field label="ISBN" hint="10 or 13 digits, optional" error={fields.isbn}>
          <input value={values.isbn} onChange={set("isbn")} inputMode="numeric" />
        </Field>
        <Field label="Year published" hint="Optional" error={fields.published_year}>
          <input value={values.year} onChange={set("year")} inputMode="numeric" maxLength={4} />
        </Field>
      </div>
      <Field label="Description" hint="Optional" error={fields.description}>
        <textarea value={values.description} onChange={set("description")} rows={6} maxLength={5000} />
      </Field>
      <div className="form-actions">
        <button type="submit" className="button" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </button>
        <button type="button" className="link-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={error ? "field field-invalid" : "field"}>
      <span className="field-label">
        {label}
        {hint && <span className="field-hint">{hint}</span>}
      </span>
      {children}
      {error && <span className="field-error">{label} {error}.</span>}
    </label>
  );
}
