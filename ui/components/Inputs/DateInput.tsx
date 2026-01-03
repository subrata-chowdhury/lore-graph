"use client";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
  label: string;
  value: Date;
  onChange: (val: Date) => void;
  // name?: string;
  // placeholder?: string;
  error?: string;
  containerClass?: string;
  labelClass?: string;
  minTime?: Date;
  maxTime?: Date;
  maxDate?: Date;
};

const DateInput = ({
  label = "",
  error = "",
  value = new Date(),
  onChange = () => {},
  containerClass = "",
  labelClass = "",
  minTime,
  maxTime,
  maxDate,
}: Props) => {
  return (
    <label className={"flex flex-col gap-1 " + containerClass}>
      <div className={labelClass}>{label}</div>
      <DatePicker
        selected={value}
        onChange={(date) => onChange(date as Date)}
        className="w-full rounded border-2 border-gray-300/50 px-3 py-2 outline-none"
        showTimeSelect
        dateFormat="Pp"
        minDate={minTime}
        maxDate={maxDate}
        minTime={minTime}
        maxTime={maxTime}
      />
      {/* <input type={'date'} placeholder={placeholder} name={name} value={value.toISOString().split('T')[0]} onChange={e => onChange(new Date(e.target.value))} className="px-3 py-2 border-2 rounded outline-none" style={inputStyle} /> */}
      {error && error?.length > 0 && <p className="text-xs font-medium text-red-500">{error}</p>}
    </label>
  );
};

export default DateInput;
