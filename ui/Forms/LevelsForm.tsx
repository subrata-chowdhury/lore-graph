import { PageType } from "@/types/types";
import React, { useState } from "react";
import LevelForm from "./LevelForm/LevelForm";

type Props = {
  levels: PageType["lvls"];
};

const LevelsForm = ({ levels }: Props) => {
  const [showNewLevelForm, setShowNewLevelForm] = useState(false);

  return (
    <>
      <div className="flex flex-1 flex-col overflow-auto bg-white p-6 px-8">
        {!showNewLevelForm && (
          <>
            <div className="flex flex-col">
              <div className={`text-sm font-semibold`}>Levels</div>
              <div className="text-sm text-black/60">
                You can add multiple levels as option to switch between different layouts.
              </div>
            </div>
            {levels?.map((lvl) => {
              return (
                <div key={lvl.id} className="mt-4">
                  <div>
                    <p>{lvl.title}</p>
                    <p>{lvl.id}</p>
                  </div>
                </div>
              );
            })}
            <div className="mt-4">
              <button
                onClick={() => setShowNewLevelForm(true)}
                className="cursor-pointer rounded-full bg-black/80 px-5 py-2 text-sm font-semibold text-white hover:bg-black/70"
              >
                Add Level
              </button>
            </div>
          </>
        )}
        {showNewLevelForm && <LevelForm />}
      </div>
    </>
  );
};

export default LevelsForm;
