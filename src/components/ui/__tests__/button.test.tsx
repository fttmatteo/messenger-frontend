import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'
import { forwardRef } from 'react'

describe('Button Component', () => {
    it('should render correctly with default props', () => {
        render(<Button>Click me</Button>)
        const button = screen.getByRole('button', { name: /click me/i })
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass('bg-primary') // Check default variant
    })

    it('should apply the correct variant classes', () => {
        render(<Button variant="destructive">Destructive</Button>)
        const button = screen.getByRole('button', { name: /destructive/i })
        expect(button).toHaveClass('bg-destructive')
    })

    it('should apply the correct size classes', () => {
        render(<Button size="sm">Small</Button>)
        const button = screen.getByRole('button', { name: /small/i })
        expect(button).toHaveClass('h-8', 'px-3')
    })

    it('should handle onClick events', async () => {
        const handleClick = vi.fn()
        render(<Button onClick={handleClick}>Click me</Button>)

        await userEvent.click(screen.getByRole('button', { name: /click me/i }))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should pass down additional props', () => {
        render(<Button data-testid="custom-button" aria-label="custom label">Click me</Button>)
        const button = screen.getByTestId('custom-button')
        expect(button).toHaveAttribute('aria-label', 'custom label')
    })

    it('should render as a child custom element when asChild is true', () => {
        // If asChild is true, it renders the child element but passes the button classes to it
        const CustomLink = forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>((props, ref) => (
            <a ref={ref} {...props} data-custom="true">Link</a>
        ))
        CustomLink.displayName = 'CustomLink'

        render(
            <Button asChild variant="outline">
                <CustomLink href="/home" />
            </Button>
        )

        const link = screen.getByRole('link', { name: /link/i })
        expect(link).toHaveAttribute('href', '/home')
        expect(link).toHaveAttribute('data-custom', 'true')
        // Should have outline variant class instead of default
        expect(link).toHaveClass('border')
    })

    it('should be disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>)
        const button = screen.getByRole('button', { name: /disabled/i })
        expect(button).toBeDisabled()
        expect(button).toHaveClass('disabled:opacity-50')
    })
})
