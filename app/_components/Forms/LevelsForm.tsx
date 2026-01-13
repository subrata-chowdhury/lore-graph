import { PageType } from "@/types/types";
import React, { useState } from "react";
import LevelForm from "./LevelForm/LevelForm";
import { TbTrash } from "react-icons/tb";
import { LuPencil } from "react-icons/lu";

type Props = {
  levels: PageType["lvls"];
  onLevelsChange: (newLevels: PageType["lvls"]) => void;
  onSave?: () => void;
};

const LevelsForm = ({ levels, onLevelsChange = () => {}, onSave = () => {} }: Props) => {
  const [showLevelForm, setShowLevelForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null); // for edit feature

  return (
    <>
      <div className="flex flex-1 flex-col overflow-auto bg-white p-6 px-8">
        {!showLevelForm && (
          <>
            <div className="flex flex-col">
              <div className={`text-sm font-semibold`}>Levels</div>
              <div className="text-sm text-black/60">
                You can add multiple levels as option to switch between different layouts.
              </div>
            </div>
            {levels?.map((lvl) => {
              return (
                <div className="mt-2 flex gap-2 rounded-lg bg-black/10 p-3 pr-4" key={lvl.id}>
                  <div className="flex flex-1 flex-col justify-between gap-1">
                    <div className="truncate text-sm leading-none font-semibold">{lvl.title}</div>
                    <div className="truncate text-xs leading-none text-black/50">{lvl.id}</div>
                  </div>
                  <div className="flex gap-1">
                    <LuPencil
                      onClick={() => {
                        setShowLevelForm(true);
                        setSelectedId(lvl.id);
                      }}
                    />
                    <TbTrash
                      className="cursor-pointer"
                      onClick={() => {
                        const newLevels = levels.filter((level) => level.id !== lvl.id);
                        onLevelsChange(newLevels);
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowLevelForm(true)}
                className="cursor-pointer rounded-full bg-black/20 px-5 py-2 text-sm font-semibold hover:bg-black/30"
              >
                Add Level
              </button>
              {levels.length > 0 && (
                <button
                  onClick={() => onSave()}
                  className="cursor-pointer rounded-full bg-black/80 px-5 py-2 text-sm font-semibold text-white hover:bg-black/70"
                >
                  Next
                </button>
              )}
            </div>
          </>
        )}
        {showLevelForm && (
          <LevelForm
            id={selectedId}
            onAdd={(newLevel) => {
              onLevelsChange([...levels, newLevel]);
              setShowLevelForm(false);
            }}
            onCancel={() => setShowLevelForm(false)}
          />
        )}
      </div>
    </>
  );
};

export default LevelsForm;
