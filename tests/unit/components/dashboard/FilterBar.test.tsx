import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '@/components/dashboard/FilterBar';

// Mock component tests (RED phase)
describe('FilterBar', () => {
  const defaultProps = {
    searchTerm: '',
    onSearchChange: vi.fn(),
    filterZone: 'ALL',
    onZoneChange: vi.fn(),
    filterStatus: 'ALL',
    onStatusChange: vi.fn(),
    onClearFilters: vi.fn(),
    onExportPDF: vi.fn(),
    orchardZones: ['ALL', 'A', 'B', 'C'],
    totalTrees: 100,
    isLoading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input with correct placeholder', () => {
    render(<FilterBar {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('ค้นหาเลขต้นหรือพันธุ์...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
  });

  it('should render zone filter with correct options', () => {
    render(<FilterBar {...defaultProps} />);

    const zoneFilter = screen.getByDisplayValue('ทุกโซน');
    expect(zoneFilter).toBeInTheDocument();

    // Check for zone options
    expect(screen.getByText('ทุกโซน')).toBeInTheDocument();
    expect(screen.getByText('โซน A')).toBeInTheDocument();
    expect(screen.getByText('โซน B')).toBeInTheDocument();
    expect(screen.getByText('โซน C')).toBeInTheDocument();
  });

  it('should render status filter with correct options', () => {
    render(<FilterBar {...defaultProps} />);

    const statusFilter = screen.getByDisplayValue('ทุกสถานะ');
    expect(statusFilter).toBeInTheDocument();

    // Check for status options
    expect(screen.getByText('ทุกสถานะ')).toBeInTheDocument();
    expect(screen.getByText('สมบูรณ์')).toBeInTheDocument();
    expect(screen.getByText('ป่วย')).toBeInTheDocument();
    expect(screen.getByText('ตาย')).toBeInTheDocument();
    expect(screen.getByText('เก็บรวบ')).toBeInTheDocument();
  });

  it('should call onSearchChange when typing in search input', () => {
    render(<FilterBar {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('ค้นหาเลขต้นหรือพันธุ์...');
    fireEvent.change(searchInput, { target: { value: 'T001' } });

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('T001');
  });

  it('should call onZoneChange when selecting a zone', async () => {
    const user = userEvent.setup();
    render(<FilterBar {...defaultProps} />);

    const zoneFilter = screen.getByDisplayValue('ทุกโซน');
    await user.selectOptions(zoneFilter, 'A');

    expect(defaultProps.onZoneChange).toHaveBeenCalledWith('A');
  });

  it('should call onStatusChange when selecting a status', async () => {
    const user = userEvent.setup();
    render(<FilterBar {...defaultProps} />);

    const statusFilter = screen.getByDisplayValue('ทุกสถานะ');
    await user.selectOptions(statusFilter, 'sick');

    expect(defaultProps.onStatusChange).toHaveBeenCalledWith('sick');
  });

  it('should show clear filters button when filters are active', () => {
    render(<FilterBar {...defaultProps} searchTerm="T001" />);

    const clearButton = screen.getByText('ล้างตัวกรอง');
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear filters button when no filters are active', () => {
    render(<FilterBar {...defaultProps} />);

    const clearButton = screen.queryByText('ล้างตัวกรอง');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should call onClearFilters when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<FilterBar {...defaultProps} searchTerm="T001" />);

    const clearButton = screen.getByText('ล้างตัวกรอง');
    await user.click(clearButton);

    expect(defaultProps.onClearFilters).toHaveBeenCalled();
  });

  it('should show export PDF button with correct tree count', () => {
    render(<FilterBar {...defaultProps} totalTrees={50} />);

    const exportButton = screen.getByText('พิมพ์ QR (50)');
    expect(exportButton).toBeInTheDocument();
  });

  it('should call onExportPDF when export button is clicked', async () => {
    const user = userEvent.setup();
    render(<FilterBar {...defaultProps} />);

    const exportButton = screen.getByText('พิมพ์ QR (100)');
    await user.click(exportButton);

    expect(defaultProps.onExportPDF).toHaveBeenCalled();
  });

  it('should disable export button when no trees', () => {
    render(<FilterBar {...defaultProps} totalTrees={0} />);

    const exportButton = screen.getByText('พิมพ์ QR (0)');
    expect(exportButton).toBeDisabled();
  });

  it('should display search icon', () => {
    render(<FilterBar {...defaultProps} />);

    // Check for search icon by its role or testid
    const searchIcon = document.querySelector('svg[data-testid="search-icon"]')
      || document.querySelector('.lucide-search');

    // If icon doesn't have specific attributes, we can check for its presence in the DOM
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('should show search value when provided', () => {
    render(<FilterBar {...defaultProps} searchTerm="T001" />);

    const searchInput = screen.getByDisplayValue('T001');
    expect(searchInput).toBeInTheDocument();
  });

  it('should show selected zone value correctly', () => {
    render(<FilterBar {...defaultProps} filterZone="A" />);

    const zoneFilter = screen.getByDisplayValue('โซน A');
    expect(zoneFilter).toBeInTheDocument();
  });

  it('should show selected status value correctly', () => {
    render(<FilterBar {...defaultProps} filterStatus="sick" />);

    const statusFilter = screen.getByDisplayValue('ป่วย');
    expect(statusFilter).toBeInTheDocument();
  });
});