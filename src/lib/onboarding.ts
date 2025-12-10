import { OnboardingTask } from '../types';

export function calculateProgress(tasks: OnboardingTask[]): number {
  if (!tasks.length) return 0;
  const done = tasks.filter((t) => t.status === 'done').length;
  return Math.round((done / tasks.length) * 100);
}
