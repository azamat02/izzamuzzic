interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
      <div className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-white text-lg font-medium mb-2">{title}</h3>
        <p className="text-[#a0a0a0] text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-[#a0a0a0] hover:text-white bg-[#1a1a1a] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
