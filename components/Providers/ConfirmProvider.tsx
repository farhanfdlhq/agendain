"use client";

import React, { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface PromptOptions {
  title: string;
  message?: string;
  /** Nilai awal isian, seperti argumen kedua `window.prompt`. */
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

type DialogState =
  | { kind: 'confirm'; options: Required<Pick<ConfirmOptions, 'title' | 'message' | 'confirmText' | 'cancelText'>> }
  | { kind: 'prompt'; options: Required<Pick<PromptOptions, 'title' | 'confirmText' | 'cancelText'>> & Pick<PromptOptions, 'message' | 'placeholder'> }

interface ConfirmContextType {
  /**
   * Bentuk yang di-await: `if (!(await confirm({ title, message }))) return`.
   * Sengaja meniru bentuk `window.confirm` supaya sisa badan fungsi pemanggil
   * tidak perlu dibungkus ulang ke dalam closure saat migrasi.
   */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /**
   * Pengganti `window.prompt`. Mengembalikan string isian, atau `null` bila
   * dibatalkan — sama persis dengan kontrak `window.prompt`, sehingga
   * pemanggil lama cukup ditambah `await`.
   */
  prompt: (options: PromptOptions) => Promise<string | null>;
  /** Bentuk callback yang lebih dulu ada. Kini hanya pembungkus tipis di atas `confirm`. */
  showConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<DialogState | null>(null);
  const [inputValue, setInputValue] = useState('');

  // Disimpan di ref, bukan state: resolver-nya tidak ikut menentukan tampilan
  // dan menaruhnya di state akan memicu render ekstra.
  const resolverRef = useRef<((value: any) => void) | null>(null);

  const settle = useCallback((value: boolean | string | null) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setIsOpen(false);
  }, []);

  const open = useCallback(<T,>(next: DialogState, initialInput: string): Promise<T> => {
    // Kalau ada dialog yang masih menggantung, tutup dulu sebagai "batal" supaya
    // promise lamanya tidak pernah tertinggal tanpa jawaban.
    resolverRef.current?.(next.kind === 'prompt' ? null : false);

    return new Promise<T>((resolve) => {
      resolverRef.current = resolve as (value: any) => void;
      setInputValue(initialInput);
      setState(next);
      setIsOpen(true);
    });
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => open<boolean>({
    kind: 'confirm',
    options: {
      confirmText: 'Ya, Lanjutkan',
      cancelText: 'Batal',
      ...options,
    },
  }, ''), [open]);

  const prompt = useCallback((options: PromptOptions) => open<string | null>({
    kind: 'prompt',
    options: {
      confirmText: 'Simpan',
      cancelText: 'Batal',
      ...options,
    },
  }, options.defaultValue ?? ''), [open]);

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
  ) => {
    void confirm({ title, message, confirmText, cancelText }).then((ok) => {
      if (ok) onConfirm();
    });
  }, [confirm]);

  const isPrompt = state?.kind === 'prompt';

  return (
    <ConfirmContext.Provider value={{ confirm, prompt, showConfirm }}>
      {children}
      {/* Menutup lewat overlay/Esc dihitung sebagai "batal", bukan promise yang menggantung. */}
      <Dialog open={isOpen} onOpenChange={(next) => { if (!next) settle(isPrompt ? null : false) }}>
        <DialogContent className="max-w-sm rounded-xl z-[100]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {state?.options.title || 'Konfirmasi'}
            </DialogTitle>
          </DialogHeader>

          {state?.options.message && (
            <div className="py-2 text-sm text-muted-foreground leading-relaxed">
              {state.options.message}
            </div>
          )}

          {isPrompt && (
            <div className="pt-1">
              {/* autoFocus + Enter supaya alurnya secepat window.prompt: buka,
                  ketik, Enter. Enter ditangani eksplisit, bukan lewat implicit
                  form submission — perilaku itu tidak berlaku andal pada form
                  tanpa tombol submit. */}
              <Input
                autoFocus
                value={inputValue}
                placeholder={state.options.placeholder}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); settle(inputValue) }
                }}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => settle(isPrompt ? null : false)}>
              {state?.options.cancelText}
            </Button>
            <Button
              variant={isPrompt ? 'default' : 'destructive'}
              onClick={() => settle(isPrompt ? inputValue : true)}
            >
              {state?.options.confirmText}
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
