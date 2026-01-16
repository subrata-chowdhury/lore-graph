import React from "react";

type Props = {
  title: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
};

const Title: React.FC<Props> = ({
  title,
  className = "",
  containerClassName = "",
  onClick = () => {},
  children,
}) => {
  return (
    <div className="group/title relative flex flex-col items-center">
      <div
        className={
          "absolute -top-2 z-10 hidden w-fit -translate-y-full rounded bg-gray-200 p-2 px-3 text-xs text-nowrap group-hover/title:block " +
          className
        }
      >
        {title}
        <div className="absolute -bottom-1.25 left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-8 border-r-8 border-l-8 border-t-slate-200 border-r-transparent border-l-transparent"></div>
      </div>
      <div className={"cursor-pointer " + containerClassName} onClick={onClick}>
        {children}
      </div>
    </div>
  );
};

export default Title;
