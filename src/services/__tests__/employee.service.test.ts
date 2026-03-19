import { describe, it, expect, vi, beforeEach } from 'vitest';
import { employeeService } from '../employee.service';
import apiClient from '../api-client';

vi.mock('../api-client', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('employeeService', () => {
    const mockEmployee = { idEmployee: 1, uuid: 'employee-uuid-1', fullName: 'Employee 1', document: 12345 };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getAll should return array', async () => {
        vi.mocked(apiClient.get).mockResolvedValue({ data: [mockEmployee] });
        const result = await employeeService.getAll();
        expect(result).toEqual([mockEmployee]);
        expect(apiClient.get).toHaveBeenCalledWith('/employees/allEmployees');
    });

    it('getById should return one', async () => {
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockEmployee });
        const result = await employeeService.getById('1');
        expect(result).toEqual(mockEmployee);
        expect(apiClient.get).toHaveBeenCalledWith('/employees/findByEmployeeId/1');
    });

    it('create should call API', async () => {
        vi.mocked(apiClient.post).mockResolvedValue({ data: mockEmployee });
        const result = await employeeService.create({
            fullName: 'New',
            document: '555',
            phone: '123',
            role: 'MESSENGER',
            password: 'pass'
        });
        expect(result).toEqual(mockEmployee);
        expect(apiClient.post).toHaveBeenCalledWith('/employees/createEmployee', expect.anything());
    });

    it('update should call API', async () => {
        vi.mocked(apiClient.put).mockResolvedValue({ data: mockEmployee });
        const result = await employeeService.update('1', {
            fullName: 'Updated',
            document: '123',
            phone: '123',
            role: 'MESSENGER',
            password: 'pass'
        });
        expect(result).toEqual(mockEmployee);
        expect(apiClient.put).toHaveBeenCalledWith('/employees/updateEmployee/1', expect.anything());
    });

    it('delete should call API', async () => {
        vi.mocked(apiClient.delete).mockResolvedValue({});
        await employeeService.delete('1');
        expect(apiClient.delete).toHaveBeenCalledWith('/employees/deleteEmployee/1');
    });
});
