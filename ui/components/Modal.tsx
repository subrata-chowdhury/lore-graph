interface ModalProps {
  children?: React.ReactNode;
  onClose: () => void;
  className?: string;
  isOpen?: boolean;
}

function Modal({ children, onClose = () => {}, className = "", isOpen = true }: ModalProps) {
  return (
    <div
      className={`top-to-bottom fixed inset-0 z-30 ${isOpen ? "flex" : "hidden"} items-center justify-center bg-black/20 backdrop-blur-sm dark:bg-white/10`}
      onClick={onClose}
    >
      <div
        className={`flex flex-col overflow-hidden rounded-md bg-white shadow-md dark:bg-black ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
