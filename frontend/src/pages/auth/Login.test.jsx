import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

// Mock NavbarHome to isolate testing of Login component
vi.mock('../../components/NavbarHome.jsx', () => ({
    default: () => <div data-testid="navbar-home">NavbarHome</div>,
}));

// Mock useNavigate
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => navigateMock,
        // We need Link to work properly inside BrowserRouter
        Link: actual.Link
    };
});

describe('Login Page', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        // Mock global fetch
        global.fetch = vi.fn();
        // Mock localStorage
        Storage.prototype.setItem = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderLogin = () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
    };

    it('renders login form elements correctly', () => {
        renderLogin();

        expect(screen.getByRole('heading', { name: /Log in/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Log in/i })).toBeInTheDocument();
        expect(screen.getByText(/Don’t have an account?/i)).toBeInTheDocument();
    });

    it('handles successful login flow', async () => {
        // Mock legitimate API response
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ token: 'fake-jwt-token' }),
        });

        renderLogin();

        // 1. Fill in the form
        fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
            target: { value: 'user@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
            target: { value: 'password123' },
        });

        // 2. Submit form
        fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

        // 3. Check for loading state
        expect(screen.getByRole('button')).toHaveTextContent(/Logging in.../i);

        // 4. Verify API call and navigation
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth/login'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ email: 'user@example.com', password: 'password123' })
                })
            );

            expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-jwt-token');
            expect(navigateMock).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('displays error message on login failure', async () => {
        // Mock failed API response
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Invalid credentials' }),
        });

        renderLogin();

        // Fill and submit
        fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
            target: { value: 'wrong@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
            target: { value: 'wrongpass' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

        // Verify error message appears
        await waitFor(() => {
            expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
            expect(localStorage.setItem).not.toHaveBeenCalled();
            expect(navigateMock).not.toHaveBeenCalled();
        });
    });
});
