import { stepTimes, formatStepTime } from '../constants';

describe('stepTimes', () => {
  it('mapeia ready para preparo e usa a primeira ocorrência', () => {
    const times = stepTimes([
      { status: 'pending', timestamp: '2026-10-12T10:00:00Z' },
      { status: 'confirmed', timestamp: '2026-10-12T10:01:00Z' },
      { status: 'preparing', timestamp: '2026-10-12T10:05:00Z' },
      { status: 'ready', timestamp: '2026-10-12T10:20:00Z' },
    ]);
    expect(times.confirmed).toBe('2026-10-12T10:01:00Z');
    expect(times.preparing).toBe('2026-10-12T10:05:00Z');
    expect(times.delivering).toBeNull();
    expect(times.delivered).toBeNull();
  });

  it('sem timeline não há horas', () => {
    expect(stepTimes(undefined)).toEqual({
      confirmed: null,
      preparing: null,
      delivering: null,
      delivered: null,
    });
    expect(formatStepTime(null)).toBeNull();
    expect(formatStepTime('lixo')).toBeNull();
  });
});
