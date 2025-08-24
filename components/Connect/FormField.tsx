"use client";

import { motion } from "motion/react";

interface FormFieldProps {
  id?: string;
  name?: string;
  label: string;
  required?: boolean;
  type?: "text" | "email" | "tel";
  textarea?: boolean;
  rows?: number;
  value: string;
  placeholder: string;
  errorActive?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const baseInputClass =
  "w-full border text-white px-4 py-3 outline-none transition-colors";
const okVariant =
  "bg-white/5 border-white/10 focus:border-white/30 placeholder:text-white/40";
const errorVariant =
  "bg-red-500/10 border-red-400/60 focus:border-red-300/80 placeholder:text-red-300/90";

export const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  label,
  required,
  type = "text",
  textarea,
  rows = 6,
  value,
  placeholder,
  errorActive,
  disabled,
  onChange,
}) => {
  const fieldId = id || name || label.toLowerCase().replace(/\s+/g, "-");
  const classes = `${baseInputClass} ${errorActive ? errorVariant : okVariant}`;
  const wrapperClass = textarea ? "relative h-[140px]" : "relative";

  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm text-white/70 mb-2">
        {label} {required && <span className="text-red-400 text-lg">*</span>}
      </label>
      <div className={wrapperClass}>
        {textarea ? (
          <textarea
            id={fieldId}
            name={name}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${classes} resize-none h-full`}
            placeholder={placeholder}
            disabled={disabled}
          />
        ) : (
          <input
            id={fieldId}
            name={name}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={classes}
            placeholder={placeholder}
            disabled={disabled}
            inputMode={type === "tel" ? "tel" : undefined}
          />
        )}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={false}
          animate={{ opacity: errorActive ? 1 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="absolute inset-0 bg-red-500/10" />
          <div className="absolute inset-0 ring-1 ring-inset ring-red-400/30" />
        </motion.div>
      </div>
    </div>
  );
};

export default FormField;
