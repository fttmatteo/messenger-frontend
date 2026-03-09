import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../dialog'

describe('Dialog Component', () => {
    const TestDialog = () => (
        <Dialog>
            <DialogTrigger>Open Dialog</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Dialog Title</DialogTitle>
                    <DialogDescription>
                        This is a description for the dialog.
                    </DialogDescription>
                </DialogHeader>
                <div data-testid="dialog-body">Content goes here</div>
                <DialogFooter>
                    <button>Save</button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

    it('should not show content initially', () => {
        render(<TestDialog />)
        expect(screen.getByRole('button', { name: /Open Dialog/i })).toBeInTheDocument()
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument()
    })

    it('should open dialog and show content when trigger is clicked', async () => {
        render(<TestDialog />)
        const trigger = screen.getByRole('button', { name: /Open Dialog/i })

        await userEvent.click(trigger)

        // Radix portals the content out of the root, so it exists in document body
        const title = await screen.findByText('Dialog Title')
        expect(title).toBeInTheDocument()

        expect(screen.getByText('This is a description for the dialog.')).toBeInTheDocument()
        expect(screen.getByTestId('dialog-body')).toBeInTheDocument()
        expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should close dialog when X button is clicked', async () => {
        render(<TestDialog />)

        // Open Dialog
        await userEvent.click(screen.getByRole('button', { name: /Open Dialog/i }))
        await screen.findByRole('dialog')

        // Find close button (usually rendered by default inside DialogContent if showCloseButton is true)
        const closeBtn = screen.getByRole('button', { name: /close/i })

        // Click close
        await userEvent.click(closeBtn)

        // Wait for the animation to finish and unmount
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    it('should apply custom classes to DialogContent', async () => {
        render(
            <Dialog>
                <DialogTrigger>Open</DialogTrigger>
                <DialogContent className="custom-test-class">
                    <DialogTitle>Test</DialogTitle>
                </DialogContent>
            </Dialog>
        )

        await userEvent.click(screen.getByRole('button', { name: /Open/i }))
        const dialogContent = await screen.findByRole('dialog')

        expect(dialogContent).toHaveClass('custom-test-class')
    })
})
