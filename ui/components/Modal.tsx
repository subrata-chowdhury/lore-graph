interface ModalProps {
  children?: React.ReactNode;
  onClose: () => void;
  className?: string;
  heading?: string;
}

function Modal({ children, onClose = () => {}, className = "" }: ModalProps) {
  return (
    <div
      className="fixed inset-0 flex items-center top-to-bottom justify-center bg-black/20 dark:bg-white/10 backdrop-blur-sm z-30"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-black rounded-md shadow-md flex flex-col overflow-hidden ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
