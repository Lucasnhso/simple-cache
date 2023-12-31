import { describe, expect, it, vi } from 'vitest';
import * as schedule from '../../../../lib/utils/schedule';

describe('Schedule - Unit Tests', () => {
  it('should create a schedule and wait delay', async () => {
    const delay = 1000;
    const fakeModule = {
      task: () => null
    };
    vi.useFakeTimers();
    const spySchedule = vi.spyOn(schedule, 'createSchedule');
    const spyModule = vi.spyOn(fakeModule, 'task');

    schedule.createSchedule(delay, fakeModule.task);
    await vi.runAllTimersAsync();

    expect(spySchedule).toHaveBeenCalledOnce();
    expect(spyModule).toHaveBeenCalledOnce();
  });
});
