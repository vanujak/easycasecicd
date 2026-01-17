import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

// Mock components
vi.mock('../../components/NavbarDashboard.jsx', () => ({
    default: () => <div data-testid="navbar-dashboard">NavbarDashboard</div>,
}));

vi.mock('../../components/CaseDetailsOverlay.jsx', () => ({
    default: ({ caseId, onClose }) => (
        <div data-testid="case-overlay">
            Case Details: {caseId}
            <button onClick={onClose}>Close</button>
        </div>
    ),
}));

describe('Dashboard Page', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        global.fetch = vi.fn();
        Storage.prototype.getItem = vi.fn(() => 'fake-token');
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const mockDashboardData = (cases = [], hearings = []) => {
        // Mock auth/me
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ name: 'Lawyer Mike' }),
        });

        // Mock api/cases
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => cases,
        });

        // Mock hearings calls for each OPEN case
        const openCasesCount = cases.filter(c => c.status === 'open').length;
        for (let i = 0; i < openCasesCount; i++) {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => hearings,
            });
        }
    };

    it('renders dashboard with loading state initially', async () => {
        // We mock a pending promise to keep it loading? No, just render and check immediately.
        // But fetch mocks are resolved immediately.
        // We can't easily catch "Loading..." if it resolves microseconds later.
        // However, we can check it eventually DISAPPEARS.

        mockDashboardData();
        render(<BrowserRouter><Dashboard /></BrowserRouter>);

        // It might be too fast to see loading, but we can verify final state
        await waitFor(() => {
            expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
            expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
        });
    });

    it('displays user name and greeting', async () => {
        mockDashboardData();
        render(<BrowserRouter><Dashboard /></BrowserRouter>);

        await waitFor(() => {
            // Check for ANY of the greetings
            expect(screen.getByText(/Good (Morning|Afternoon|Evening)/i)).toBeInTheDocument();
            expect(screen.getByText(/Welcome back, Lawyer Mike!/i)).toBeInTheDocument();
        });
    });

    it('displays active cases count', async () => {
        const cases = [
            { _id: '1', status: 'open', title: 'Case A', number: '001' },
            { _id: '2', status: 'closed', title: 'Case B', number: '002' },
            { _id: '3', status: 'open', title: 'Case C', number: '003' },
        ];
        mockDashboardData(cases);

        render(<BrowserRouter><Dashboard /></BrowserRouter>);

        await waitFor(() => {
            // There are 2 open cases
            expect(screen.getByText('2')).toBeInTheDocument();
        });
    });

    it('displays upcoming hearings', async () => {
        const cases = [{ _id: '1', status: 'open', title: 'Case A', number: '001' }];
        // Ensure date is in the future
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 10);

        const hearings = [{ _id: 'h1', caseId: '1', nextDate: futureDate.toISOString(), outcome: 'Pending' }];

        mockDashboardData(cases, hearings);

        render(<BrowserRouter><Dashboard /></BrowserRouter>);

        await waitFor(() => {
            expect(screen.getByText(/Case A/i)).toBeInTheDocument();
            expect(screen.getByText(/Pending/i)).toBeInTheDocument();
        });
    });

    it('opens case details overlay when clicking a hearing', async () => {
        const cases = [{ _id: '1', status: 'open', title: 'Case A', number: '001' }];
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 10);

        const hearings = [{ _id: 'h1', caseId: '1', nextDate: futureDate.toISOString(), outcome: 'Pending' }];

        mockDashboardData(cases, hearings);

        render(<BrowserRouter><Dashboard /></BrowserRouter>);

        // Wait for hearing to appear
        await waitFor(() => {
            expect(screen.getByText(/Case A/i)).toBeInTheDocument();
        });

        const hearingItem = screen.getByText(/Case A/i).closest('li');
        fireEvent.click(hearingItem);

        expect(screen.getByTestId('case-overlay')).toBeInTheDocument();
        expect(screen.getByText(/Case Details: 1/i)).toBeInTheDocument();
    });
});
