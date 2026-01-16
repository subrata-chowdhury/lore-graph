import Image from "next/image";
import React from "react";
import { useOpenedLoreContext } from "../../contexts/OpenedLoreContext";
import { LoreType } from "../../types/loreTypes";
import { BiVideo } from "react-icons/bi";
import Title from "@/ui/components/Title";

interface LoreTypeWithNext extends LoreType {
  next: string[];
}

type Props = {
  lore: LoreTypeWithNext;
  refs?: React.RefObject<{ [key: string]: HTMLDivElement | null }>;
  className?: string;
  titleClassName?: string;
  containerClassName?: string;
};

const Lore = ({
  lore,
  refs,
  className = "",
  titleClassName = "",
  containerClassName = "",
}: Props) => {
  const { setLore } = useOpenedLoreContext();
  if (!lore) return null;

  return (
    <div
      className={`${containerClassName} w-min`}
      style={{
        marginRight: lore.next.length * 10,
      }}
    >
      <div
        key={lore._id}
        ref={(el) => {
          if (refs) refs.current[lore._id] = el;
        }}
        onClick={() => setLore(lore)}
        className={`flex aspect-video w-[230px] cursor-pointer items-center justify-center rounded-lg bg-white p-1 shadow-md ${className || ""}`}
      >
        {lore?.thumbnailUrl ? (
          <img
            src={lore?.thumbnailUrl}
            alt="lore thumbnail"
            width={230}
            height={130}
            className="z-0 aspect-video h-full w-full rounded-lg object-cover"
          />
        ) : (
          <BiVideo size={40} />
        )}
      </div>
      <Title className="top-0!" title={lore.title}>
        <div
          onClick={() => setLore(lore)}
          className={`left-0 mt-1.5 max-h-12.5 w-[230px] cursor-pointer rounded-xs border-l-6 border-black/20 bg-white/90 px-4 py-2 pl-2 text-sm leading-tight font-semibold shadow ${titleClassName}`}
        >
          <p className="h-full truncate">{lore.title}</p>
        </div>
      </Title>
    </div>
  );
};

{
  /* <div className="relative top-8 left-20 w-60 h-44 bg-white rounded-lg p-1 pb-6">
    <div className="bg-blue-950 rounded-xl w-full h-full"></div>
</div> */
}

export default Lore;
