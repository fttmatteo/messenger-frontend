import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarTrigger } from './sidebar';

describe('Sidebar', () => {
    it('should render correctly in desktop mode', () => {
        render(
            <SidebarProvider defaultOpen={true}>
                <Sidebar>
                    <SidebarHeader>
                        <span>Header</span>
                    </SidebarHeader>
                    <SidebarContent>
                        <span>Content</span>
                    </SidebarContent>
                </Sidebar>
                <div id="content">Main Content</div>
            </SidebarProvider>
        );

        expect(screen.getByText('Header')).toBeInTheDocument();
        expect(screen.getByText('Content')).toBeInTheDocument();
        expect(screen.getByText('Main Content')).toBeInTheDocument();

        const sidebar = screen.getByText('Content').closest('[data-slot="sidebar"]');
        expect(sidebar).toHaveAttribute('data-state', 'expanded');
    });

    it('should toggle sidebar state', async () => {
        render(
            <SidebarProvider defaultOpen={true}>
                <SidebarTrigger />
                <Sidebar>
                    <SidebarContent>Sidebar Content</SidebarContent>
                </Sidebar>
            </SidebarProvider>
        );

        const trigger = screen.getByRole('button', { name: /toggle sidebar/i });
        const sidebar = screen.getByText('Sidebar Content').closest('[data-slot="sidebar"]');

        expect(sidebar).toHaveAttribute('data-state', 'expanded');

        await userEvent.click(trigger);
        expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    });
});
