"use client";
import React from "react";

type Props = {
  label?: string;
  description?: string;
  value: string;
  min?: number;
  max?: number;
  onChange: (val: string) => void;
  name?: string;
  placeholder?: string;
  type?: "text" | "number";
  error?: string;
  inputClass?: string;
  inputStyle?: React.CSSProperties;
  containerClass?: string;
  labelClass?: string;
  ref?: React.RefObject<HTMLInputElement | null>;
  disabled?: boolean;
};

const Input = ({
  label = "",
  description = "",
  placeholder = "",
  name = "",
  error = "",
  value = "",
  min,
  max,
  onChange = () => {},
  type = "text",
  inputClass = "",
  inputStyle = {},
  containerClass = "",
  labelClass = "",
  ref,
  disabled = false,
}: Props) => {
  const valueLength = value?.length || 0;

  return (
    <label className={"flex flex-col gap-1 " + containerClass}>
      <div className={labelClass}>{label}</div>
      {description && <div className="text-sm text-black/60">{description}</div>}
      <div
        className={`flex rounded border ${valueLength > (max || Infinity) ? "border-red-500" : "border-black/15 focus-within:border-black/50"} bg-transparent px-3 py-2 outline-none dark:border-white/20`}
      >
        <input
          type={type}
          placeholder={placeholder}
          min={min}
          max={max}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} flex-1 bg-transparent outline-0`}
          style={inputStyle}
          disabled={disabled}
          ref={ref}
        />
        {max && (
          <p
            className={`my-auto ms-auto text-xs text-gray-500 ${valueLength > max ? "text-red-500" : ""}`}
          >
            {valueLength}/{max}
          </p>
        )}
      </div>
      {error && error?.length > 0 && <p className="text-xs font-medium text-red-500">{error}</p>}
    </label>
  );
};

export default Input;
