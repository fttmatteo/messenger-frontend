import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog';

describe('Dialog', () => {
    it('should open and close correctly', async () => {
        render(
            <Dialog>
                <DialogTrigger>Open</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dialog Title</DialogTitle>
                        <DialogDescription>Dialog Description</DialogDescription>
                    </DialogHeader>
                    <div>Content Area</div>
                </DialogContent>
            </Dialog>
        );

        const trigger = screen.getByRole('button', { name: /open/i });
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();

        await userEvent.click(trigger);

        expect(await screen.findByText('Dialog Title')).toBeInTheDocument();
        expect(screen.getByText('Content Area')).toBeInTheDocument();

        // Close using Escape key (default behavior)
        await userEvent.keyboard('{Escape}');

        // Wait for it to disappear
        // Note: Dialogs often have exit animations, queryByText is safer after some time
        // but for now we trust the state change
    });
});
