import { describe, it, expect } from 'vitest';
import { capitalizePhrase, capitalizeWords } from '../stringUtils';

describe('stringUtils', () => {
  describe('capitalizePhrase', () => {
    it('debería capitalizar la primera letra y pasar a minúscula el resto', () => {
      expect(capitalizePhrase('HOLA MUNDO')).toBe('Hola mundo');
      expect(capitalizePhrase('hola mundo')).toBe('Hola mundo');
      expect(capitalizePhrase('hOLA mUnDo')).toBe('Hola mundo');
    });

    it('debería manejar strings vacíos y nulos', () => {
      expect(capitalizePhrase('')).toBe('');
      expect(capitalizePhrase(null)).toBe('');
      expect(capitalizePhrase(undefined)).toBe('');
      expect(capitalizePhrase('   ')).toBe('');
    });

    it('debería hacer trim al texto', () => {
      expect(capitalizePhrase('  hola mundo  ')).toBe('Hola mundo');
    });
  });

  describe('capitalizeWords', () => {
    it('debería capitalizar la primera letra de cada palabra', () => {
      expect(capitalizeWords('juan perez')).toBe('Juan Perez');
      expect(capitalizeWords('JUAN PEREZ')).toBe('Juan Perez');
    });

    it('debería mantener en minúscula los conectores comunes', () => {
      expect(capitalizeWords('juan del perez')).toBe('Juan del Perez');
      expect(capitalizeWords('maria de los angeles')).toBe('Maria de los Angeles');
      expect(capitalizeWords('sistema y procesos')).toBe('Sistema y Procesos');
    });

    it('debería capitalizar conectores si son la primera palabra', () => {
      expect(capitalizeWords('de los santos juan')).toBe('De los Santos Juan');
      expect(capitalizeWords('el sistema de riego')).toBe('El Sistema de Riego');
    });

    it('debería manejar strings vacíos y nulos', () => {
      expect(capitalizeWords('')).toBe('');
      expect(capitalizeWords(null)).toBe('');
      expect(capitalizeWords(undefined)).toBe('');
    });
  });
});
