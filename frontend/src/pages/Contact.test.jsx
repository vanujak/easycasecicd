import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Contact from './Contact';

// Mock NavbarHome
vi.mock('../components/NavbarHome.jsx', () => ({
    default: () => <div data-testid="navbar-home">NavbarHome</div>,
}));

describe('Contact Page', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => { });
        global.alert = vi.fn();
    });

    it('renders contact form correctly', () => {
        render(<Contact />);

        expect(screen.getByRole('heading', { name: /Contact Us/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Your name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/How can we help?/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Write your message.../i)).toBeInTheDocument();
    });

    it('allows user to fill and submit form', () => {
        render(<Contact />);

        fireEvent.change(screen.getByPlaceholderText(/Your name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/How can we help?/i), { target: { value: 'Inquiry' } });
        fireEvent.change(screen.getByPlaceholderText(/Write your message.../i), { target: { value: 'Hello there' } });

        fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

        expect(console.log).toHaveBeenCalledWith('contact form', expect.objectContaining({
            name: 'John Doe',
            email: 'john@example.com',
            subject: 'Inquiry',
            message: 'Hello there'
        }));
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Message submitted'));
    });
});
