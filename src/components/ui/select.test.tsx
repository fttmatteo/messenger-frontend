import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

describe('Select', () => {
    it('should render and allow item selection', async () => {
        render(
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="opt1">Option 1</SelectItem>
                    <SelectItem value="opt2">Option 2</SelectItem>
                </SelectContent>
            </Select>
        );

        const trigger = screen.getByRole('combobox');
        expect(trigger).toHaveTextContent('Select an option');

        await userEvent.click(trigger);

        // Items are rendered in a portal, RTL usually finds them in the body
        const item1 = await screen.findByText('Option 1');
        const item2 = await screen.findByText('Option 2');

        expect(item1).toBeInTheDocument();
        expect(item2).toBeInTheDocument();

        await userEvent.click(item1);
        expect(trigger).toHaveTextContent('Option 1');
    });
});
