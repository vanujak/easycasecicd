import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from './Home';

// Mock child components to isolate Home page
vi.mock('../components/NavbarHome.jsx', () => ({
    default: () => <div data-testid="navbar-home">NavbarHome</div>,
}));

vi.mock('../components/BackgroundSlideshow.jsx', () => ({
    default: () => <div data-testid="background-slideshow">BackgroundSlideshow</div>,
}));

describe('Home Page', () => {
    it('renders the welcome message', () => {
        render(<Home />);

        // Check for main heading
        expect(screen.getByText(/Welcome to EasyCase/i)).toBeInTheDocument();

        // Check for subtitle
        expect(screen.getByText(/Your trusted case management system/i)).toBeInTheDocument();
    });

    it('renders structural components', () => {
        render(<Home />);

        // Verify mocked components are present
        expect(screen.getByTestId('navbar-home')).toBeInTheDocument();
        expect(screen.getByTestId('background-slideshow')).toBeInTheDocument();
    });
});
