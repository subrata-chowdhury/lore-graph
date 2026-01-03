import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

type Option = {
  label: string | number;
  value: string | number;
};

type Props = {
  options: Option[];
  value: string | number;
  onChange?: (opt: { value: string | number; index: number }) => void;
  width?: string | number;
  height?: number;
  showPopupAtTop?: boolean;
  containerClassName?: string;
  mainContainerClassName?: string;
  optionElement?: (props: {
    option: Option;
    index: number;
    onClick: () => void;
  }) => React.JSX.Element;
  ref?: React.RefObject<HTMLDivElement | null>;
  loading?: boolean;
};

function Dropdown({
  options = [],
  value = "",
  onChange = () => {},
  containerClassName = "",
  mainContainerClassName = "",
  width,
  height,
  showPopupAtTop = false,
  optionElement,
  ref,
  loading = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const displayLabel = options.find((opt) => opt.value === value)?.label || value;

  return (
    <div className={"relative " + containerClassName} style={{ width: width || "fit-content" }}>
      <div
        className={`flex cursor-pointer items-center justify-between gap-1 rounded-md border border-black/15 p-2 pl-3 dark:border-white/20 ${mainContainerClassName}`}
        onClick={() => (!loading ? setIsOpen(!isOpen) : "")}
        ref={ref}
        style={{ height: height || "40px", width: width || "fit-content" }}
      >
        <div className="truncate text-nowrap" title={displayLabel.toString()}>
          {displayLabel}
        </div>
        <IoIosArrowDown
          className={`h-4 w-4 transition-all ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </div>
      {isOpen && (
        <div
          className="absolute z-10 my-1 max-h-60 w-full overflow-y-auto rounded-lg border border-black/15 bg-white dark:border-white/20 dark:bg-black"
          style={{
            top: showPopupAtTop ? "auto" : "100%",
            bottom: showPopupAtTop ? "100%" : "auto",
          }}
        >
          {!optionElement &&
            options.map((option, index) => (
              <div
                key={index}
                className="cursor-pointer p-2 hover:bg-gray-200 hover:dark:bg-slate-600"
                onClick={() => {
                  onChange({ value: option.value, index });
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          {optionElement &&
            options.map((option, index) =>
              optionElement({ option, index, onClick: () => setIsOpen(false) })
            )}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
