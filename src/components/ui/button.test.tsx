import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
    it('should render correctly', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
    });

    it('should handle click events', async () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        const button = screen.getByRole('button', { name: /click me/i });
        await userEvent.click(button);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should apply variant classes', () => {
        render(<Button variant="destructive">Delete</Button>);
        const button = screen.getByRole('button', { name: /delete/i });
        expect(button).toHaveClass('bg-destructive');
    });

    it('should be disabled when disabled prop is passed', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole('button', { name: /disabled/i });
        expect(button).toBeDisabled();
    });
});
