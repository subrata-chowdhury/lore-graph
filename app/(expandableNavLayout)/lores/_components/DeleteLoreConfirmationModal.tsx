"use client";
import { LoreType } from "@/types/loreTypes";
import Modal from "@/ui/components/Modal";
import React from "react";
import { CgClose } from "react-icons/cg";
import { PiWarningFill } from "react-icons/pi";

type Props = {
  lore: LoreType;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteLoreConfirmationModal = ({ lore, isOpen, onClose, onConfirm }: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="rounded-2xl!">
      <div className="p-6 px-7">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Confirm Deletion</h2>
          <CgClose className="cursor-pointer text-xl" onClick={onClose} />
        </div>
        <div className="mb-4 flex items-center gap-2">
          <PiWarningFill className="text-red-500" size={18} />
          <p className="text-sm">
            Are you sure you want to delete "<span className="font-semibold">{lore.title}</span>"?
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            className="cursor-pointer rounded-full border px-5 py-2 text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="cursor-pointer rounded-full bg-black/80 px-5 py-2 text-sm text-white"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteLoreConfirmationModal;
