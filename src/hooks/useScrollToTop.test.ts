import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, fireEvent } from '@testing-library/react';
import { useScrollToTop } from './useScrollToTop';

describe('useScrollToTop', () => {
    beforeEach(() => {
        window.scrollTo = vi.fn();
    });

    it('should accept enabled option', () => {
        const { result } = renderHook(() => useScrollToTop({ enabled: false }));

        act(() => {
            window.scrollY = 500;
            fireEvent.scroll(window);
        });

        expect(result.current.showScrollTop).toBe(false);
    });

    it('should show button after scrolling past threshold', () => {
        const { result } = renderHook(() => useScrollToTop({ threshold: 100 }));
        expect(result.current.showScrollTop).toBe(false);

        act(() => {
            // Mock window.scrollY
            Object.defineProperty(window, 'scrollY', { value: 150, configurable: true });
            fireEvent.scroll(window);
        });

        expect(result.current.showScrollTop).toBe(true);

        act(() => {
            Object.defineProperty(window, 'scrollY', { value: 50, configurable: true });
            fireEvent.scroll(window);
        });

        expect(result.current.showScrollTop).toBe(false);
    });

    it('should scroll to top when called', () => {
        const { result } = renderHook(() => useScrollToTop());

        act(() => {
            result.current.scrollToTop();
        });

        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
});
