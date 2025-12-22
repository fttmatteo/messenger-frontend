import { describe, it, expect } from 'vitest';
import { formatDisplayName, capitalizeWords } from './format-utils';

describe('format-utils', () => {
    describe('formatDisplayName', () => {
        it('should format full name to First Name + Last Initial', () => {
            expect(formatDisplayName('Juan Carlos Perez')).toBe('Juan P.');
            expect(formatDisplayName('Maria Lopez')).toBe('Maria L.');
        });

        it('should handle single names', () => {
            expect(formatDisplayName('Juan')).toBe('Juan');
        });

        it('should handle empty strings', () => {
            expect(formatDisplayName('')).toBe('');
        });

        it('should handle extra spaces', () => {
            expect(formatDisplayName('  Juan   Perez  ')).toBe('Juan P.');
        });
    });

    describe('capitalizeWords', () => {
        it('should capitalize first letter of each word', () => {
            expect(capitalizeWords('HOLA MUNDO')).toBe('Hola Mundo');
            expect(capitalizeWords('hola mundo')).toBe('Hola Mundo');
        });

        it('should handle mixed case', () => {
            expect(capitalizeWords('hOlA mUnDo')).toBe('Hola Mundo');
        });

        it('should handle single word', () => {
            expect(capitalizeWords('TEST')).toBe('Test');
        });
    });
});
