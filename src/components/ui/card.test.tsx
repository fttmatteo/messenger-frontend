import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card', () => {
    it('should render all card sub-components correctly', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Card Content</p>
                </CardContent>
                <CardFooter>
                    <button>Action</button>
                </CardFooter>
            </Card>
        );

        expect(screen.getByText('Card Title')).toBeInTheDocument();
        expect(screen.getByText('Card Description')).toBeInTheDocument();
        expect(screen.getByText('Card Content')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });

    it('should allow custom classes on components', () => {
        render(
            <Card className="custom-card">
                <CardContent className="custom-content">Content</CardContent>
            </Card>
        );

        const card = screen.getByText('Content').closest('div')?.parentElement;
        expect(card).toHaveClass('custom-card');
        expect(screen.getByText('Content')).toHaveClass('custom-content');
    });
});
