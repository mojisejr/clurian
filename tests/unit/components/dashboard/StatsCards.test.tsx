import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCards } from '@/components/dashboard/StatsCards';

// Now tests should pass (GREEN phase)
describe('StatsCards', () => {
  const mockStats = {
    totalTrees: 100,
    healthyTrees: 75,
    sickTrees: 15,
    deadTrees: 5,
    archivedTrees: 5
  };

  it('should display total trees count', () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText('ทั้งหมดในสวนนี้')).toBeInTheDocument();
    expect(screen.getByText('100 ต้น')).toBeInTheDocument();
  });

  it('should display sick trees count', () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText('ต้องดูแลพิเศษ')).toBeInTheDocument();
    expect(screen.getByText('15 ต้น')).toBeInTheDocument();
  });

  it('should display sick trees percentage', () => {
    render(<StatsCards stats={mockStats} />);

    // 15/100 = 15%
    expect(screen.getByText('15% ของทั้งหมด')).toBeInTheDocument();
  });

  it('should display healthy trees when provided', () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText('สมบูรณ์')).toBeInTheDocument();
    expect(screen.getByText('75 ต้น')).toBeInTheDocument();
    expect(screen.getByText('75% ของทั้งหมด')).toBeInTheDocument();
  });

  it('should handle zero trees', () => {
    const emptyStats = {
      totalTrees: 0,
      healthyTrees: 0,
      sickTrees: 0,
      deadTrees: 0,
      archivedTrees: 0
    };
    render(<StatsCards stats={emptyStats} />);

    expect(screen.getByText('ทั้งหมดในสวนนี้')).toBeInTheDocument();
    expect(screen.getByText('ต้องดูแลพิเศษ')).toBeInTheDocument();
    // When totalTrees is 0, no percentages are shown
    expect(screen.queryByText('0% ของทั้งหมด')).not.toBeInTheDocument();
  });

  it('should use custom className when provided', () => {
    render(<StatsCards stats={mockStats} className="custom-class" />);

    const container = screen.getByText('ทั้งหมดในสวนนี้').closest('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('should calculate percentages correctly with various numbers', () => {
    const testStats = {
      totalTrees: 50,
      healthyTrees: 30,
      sickTrees: 10,
      deadTrees: 5,
      archivedTrees: 5
    };
    render(<StatsCards stats={testStats} />);

    // 30/50 = 60%
    // 10/50 = 20%
    // 5+5/50 = 20% (dead+archived)
    expect(screen.getByText('60% ของทั้งหมด')).toBeInTheDocument();
    // Both sick and dead/archived show 20%
    expect(screen.getAllByText('20% ของทั้งหมด')).toHaveLength(2);
  });

  it('should handle partial stats without all properties', () => {
    const partialStats = {
      totalTrees: 25,
      sickTrees: 5
      // Missing other properties
    };
    render(<StatsCards stats={partialStats} />);

    expect(screen.getByText('25 ต้น')).toBeInTheDocument();
    expect(screen.getByText('5 ต้น')).toBeInTheDocument();
    expect(screen.getByText('20% ของทั้งหมด')).toBeInTheDocument(); // 5/25 = 20%
  });

  it('should show dead/archived trees card when present', () => {
    const statsWithDead = {
      totalTrees: 100,
      sickTrees: 10,
      deadTrees: 3,
      archivedTrees: 2
    };
    render(<StatsCards stats={statsWithDead} />);

    expect(screen.getByText('ตาย')).toBeInTheDocument();
    expect(screen.getByText('5 ต้น')).toBeInTheDocument(); // 3 + 2 = 5
  });

  it('should not show healthy trees card when not provided', () => {
    const statsWithoutHealthy = {
      totalTrees: 100,
      sickTrees: 20
      // No healthyTrees property
    };
    render(<StatsCards stats={statsWithoutHealthy} />);

    // Should only show total and sick trees cards
    expect(screen.getByText('ทั้งหมดในสวนนี้')).toBeInTheDocument();
    expect(screen.getByText('ต้องดูแลพิเศษ')).toBeInTheDocument();
    expect(screen.queryByText('สมบูรณ์')).not.toBeInTheDocument();
  });
});