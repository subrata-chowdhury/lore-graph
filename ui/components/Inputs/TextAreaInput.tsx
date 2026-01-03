const TextAreaInput = ({
  label = "",
  description = "",
  placeholder = "",
  name = "",
  error = "",
  max = 500,
  value = "",
  onChange = () => {},
  containerClass = "",
  labelClass = "",
  mainInputContainerClass = "",
  inputClass = "",
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (val: string) => void;
  name?: string;
  placeholder?: string;
  error?: string;
  max?: number;
  containerClass?: string;
  labelClass?: string;
  mainInputContainerClass?: string;
  inputClass?: string;
}) => {
  const valueLength = value?.length || 0;

  return (
    <label className={"flex flex-col gap-1 " + containerClass}>
      <div className={`${labelClass} text-sm font-semibold`}>{label}</div>
      {description && <div className="text-sm text-black/60">{description}</div>}
      <div
        className={`${mainInputContainerClass} mt-1 flex flex-col rounded-lg border ${valueLength > (max || Infinity) ? "border-red-500" : "border-black/15 focus-within:border-black/50"} bg-transparent px-2 py-1 pt-1.5 text-sm dark:border-white/20`}
      >
        <textarea
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} flex-1 outline-0`}
        />
        <p className={`ms-auto text-xs text-gray-500 ${valueLength > max ? "text-red-500" : ""}`}>
          {valueLength}/{max}
        </p>
      </div>
      {error && error?.length > 0 && <p className="text-xs font-medium text-red-500">{error}</p>}
    </label>
  );
};

export default TextAreaInput;
