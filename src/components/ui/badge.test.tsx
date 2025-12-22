import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
    it('should render correctly', () => {
        render(<Badge>Status</Badge>);
        const badge = screen.getByText('Status');
        expect(badge).toBeInTheDocument();
    });

    it('should apply variant classes', () => {
        render(<Badge variant="secondary">Secondary</Badge>);
        const badge = screen.getByText('Secondary');
        expect(badge).toHaveClass('bg-secondary');
    });

    it('should apply custom classes', () => {
        render(<Badge className="custom-class">Custom</Badge>);
        const badge = screen.getByText('Custom');
        expect(badge).toHaveClass('custom-class');
    });
});
