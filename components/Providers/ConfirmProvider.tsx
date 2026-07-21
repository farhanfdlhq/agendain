"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmOptions {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextType {
  showConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
  }>({
    isOpen: false,
    options: null,
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void, confirmText = 'Ya, Lanjutkan', cancelText = 'Batal') => {
    setDialogState({
      isOpen: true,
      options: { title, message, onConfirm, confirmText, cancelText },
    });
  };

  const handleClose = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    if (dialogState.options) {
      dialogState.options.onConfirm();
    }
    handleClose();
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      <Dialog open={dialogState.isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm rounded-xl z-[100]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {dialogState.options?.title || 'Konfirmasi'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground leading-relaxed">
            {dialogState.options?.message}
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={handleClose}>
              {dialogState.options?.cancelText}
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              {dialogState.options?.confirmText}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
