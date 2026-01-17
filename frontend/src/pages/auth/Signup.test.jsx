import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Signup from './Signup';

// Mock NavbarHome
vi.mock('../../components/NavbarHome.jsx', () => ({
    default: () => <div data-testid="navbar-home">NavbarHome</div>,
}));

describe('Signup Page', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        global.fetch = vi.fn();
        global.alert = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderSignup = () => {
        return render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );
    };

    const fillRequiredFields = (container) => {
        fireEvent.change(screen.getByPlaceholderText(/e.g., Vanuja Karunaratne/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/07XXXXXXXX/i), { target: { value: '0712345678' } });

        const dobInput = container.querySelector('input[name="dob"]');
        fireEvent.change(dobInput, { target: { value: '1990-01-01' } });

        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Male' } });
        fireEvent.change(screen.getByPlaceholderText(/BASL/i), { target: { value: 'BASL/999' } });
    }

    it('renders all signup form fields', () => {
        const { container } = renderSignup();

        expect(screen.getByRole('heading', { name: /Create account/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/e.g., Vanuja Karunaratne/i)).toBeInTheDocument(); // Name
        expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument(); // Email
    });

    it('prevents submission when passwords do not match', async () => {
        const { container } = renderSignup();

        // Fill required fields so form can submit
        fillRequiredFields(container);

        // Fill passwords mismatching
        fireEvent.change(screen.getByPlaceholderText(/^At least 8 characters/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText(/Re-enter password/i), { target: { value: 'passwordXXX' } });

        // Use submit directly
        fireEvent.submit(container.querySelector('form'));

        await waitFor(() => {
            // We verify that the API is NOT called, indicating validation (either client-side or manual) stopped it.
            expect(global.fetch).not.toHaveBeenCalled();
        });
    });

    it('handles successful signup', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ name: 'Test User' }),
        });

        const { container } = renderSignup();

        fillRequiredFields(container);

        // Fill valid passwords
        fireEvent.change(screen.getByPlaceholderText(/^At least 8 characters/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText(/Re-enter password/i), { target: { value: 'password123' } });

        fireEvent.submit(container.querySelector('form'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth/signup'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringMatching(/"name":"Test User".*"password":"password123"/)
                })
            );
            expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Signup success'));
        });
    });
});
