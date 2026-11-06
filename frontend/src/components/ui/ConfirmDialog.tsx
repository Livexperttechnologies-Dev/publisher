import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex items-start gap-3 py-2">
        <div
          className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
            isDestructive ? 'bg-red-50 text-[#F06A64]' : 'bg-purple-50 text-[#690BA8]'
          }`}
        >
          <AlertCircle size={20} />
        </div>
        <div>
          <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={isDestructive ? 'danger' : 'primary'}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
