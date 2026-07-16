import { create } from 'zustand';

interface DialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

interface DialogState {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  destructive: boolean;
  onConfirm: () => void;
  show: (options: DialogOptions) => void;
  hide: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  visible: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  destructive: false,
  onConfirm: () => {},
  show: (options) =>
    set({
      visible: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText ?? 'Confirm',
      destructive: options.destructive ?? false,
      onConfirm: options.onConfirm,
    }),
  hide: () => set({ visible: false }),
}));
