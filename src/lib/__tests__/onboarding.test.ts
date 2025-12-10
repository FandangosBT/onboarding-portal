import { describe, expect, it } from 'vitest';
import { calculateProgress } from '../onboarding';
import { OnboardingTask } from '../../types';

const baseTasks: OnboardingTask[] = [
  { id: '1', title: 't1', description: null, status: 'pending', due_date: null, step_id: 's1' },
  { id: '2', title: 't2', description: null, status: 'review', due_date: null, step_id: 's1' },
  { id: '3', title: 't3', description: null, status: 'done', due_date: null, step_id: 's1' },
];

describe('calculateProgress', () => {
  it('returns 0 when empty', () => {
    expect(calculateProgress([])).toBe(0);
  });

  it('calculates percentage of done tasks', () => {
    expect(calculateProgress(baseTasks)).toBe(Math.round((1 / 3) * 100));
  });

  it('returns 100 when all done', () => {
    const done = baseTasks.map((t) => ({ ...t, status: 'done' as const }));
    expect(calculateProgress(done)).toBe(100);
  });
});
