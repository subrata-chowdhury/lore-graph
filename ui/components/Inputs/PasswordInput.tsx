import React, { useState } from "react";
import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  error?: string;
  iconSize?: number;
  labelClass?: string;
};

const PasswordInput = ({
  label = "",
  value = "",
  placeholder = "",
  name = "",
  onChange = () => {},
  error = "",
  iconSize = 24,
  labelClass = "",
}: Props) => {
  const [isPassword, setIsPassword] = useState(true);

  return (
    <label className="flex flex-col gap-1">
      <p className={labelClass}>{label}</p>
      <div className="flex">
        <input
          type={isPassword ? "password" : "text"}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-l border border-black/15 bg-transparent px-3 py-2 outline-none dark:border-white/20"
        />
        <div
          className="flex cursor-pointer items-center justify-center rounded-r border border-l-0 border-black/15 px-3 py-2 dark:border-white/20"
          onClick={() => setIsPassword((prevVal) => !prevVal)}
        >
          {isPassword ? (
            <FiEyeOff size={iconSize} color="gray" />
          ) : (
            <FiEye size={iconSize} color="gray" />
          )}
        </div>
      </div>
      {error && error.length > 0 && <p className="text-xs font-medium text-red-500">{error}</p>}
    </label>
  );
};

export default PasswordInput;
