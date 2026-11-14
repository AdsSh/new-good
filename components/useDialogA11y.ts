import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

interface UseDialogA11yOptions {
  open: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
}

function getTabbable(root: HTMLElement): HTMLElement[] {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return nodes.filter((el) => {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
  });
}

/**
 * Focus management for modal-style overlays: traps Tab/Shift+Tab inside the
 * dialog, closes on Escape, locks body scroll and restores focus to the
 * previously-focused element when the dialog unmounts/closes.
 */
export function useDialogA11y({ open, onClose, closeOnEscape = true, lockScroll = true }: UseDialogA11yOptions) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement;

    const dialog = dialogRef.current;
    if (dialog) {
      dialog.focus();
      const first = getTabbable(dialog)[0];
      if (first && first !== dialog) first.focus();
    }

    return () => {
      const prev = previouslyFocusedRef.current;
      if (prev instanceof HTMLElement && prev.isConnected && document.contains(prev)) {
        prev.focus();
      }
      previouslyFocusedRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const tabbable = getTabbable(dialog);
      if (tabbable.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }

      const first = tabbable[0];
      const last = tabbable[tabbable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !dialog.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  useEffect(() => {
    if (!open || !lockScroll) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, lockScroll]);

  return dialogRef;
}