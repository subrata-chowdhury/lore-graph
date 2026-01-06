import Image from "next/image";
import React from "react";
import { useOpenedLoreContext } from "../contexts/OpenedLoreContext";
import { LoreType } from "../../types/loreTypes";

interface LoreTypeWithNext extends LoreType {
  next: string[];
}

type Props = {
  lore: LoreTypeWithNext;
  refs?: React.RefObject<{ [key: string]: HTMLDivElement | null }>;
  className?: string;
};

const Lore = ({ lore, refs, className }: Props) => {
  const { setLore } = useOpenedLoreContext();
  if (!lore) return null;

  return (
    <div
      key={lore._id}
      ref={(el) => {
        if (refs) refs.current[lore._id] = el;
      }}
      style={{
        marginRight: lore.next.length * 10,
      }}
      onClick={() => setLore(lore)}
      className={`flex aspect-video w-[230px] cursor-pointer items-center justify-center rounded-lg bg-white p-1 ${className || ""}`}
    >
      <Image
        src={lore?.thumbnailUrl || "/first-cutscene.jpg"}
        alt="lore thumbnail"
        width={230}
        height={130}
        className="z-0 h-full w-full rounded-lg object-cover"
      />
    </div>
  );
};

{
  /* <div className="relative top-8 left-20 w-60 h-44 bg-white rounded-lg p-1 pb-6">
    <div className="bg-blue-950 rounded-xl w-full h-full"></div>
</div> */
}

export default Lore;
