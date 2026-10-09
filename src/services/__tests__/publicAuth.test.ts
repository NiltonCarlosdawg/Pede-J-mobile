import { isPublicAuthUrl } from '../api';

jest.mock('../session', () => ({
  loadSession: jest.fn().mockResolvedValue(null),
  saveSession: jest.fn(),
  clearStoredSession: jest.fn(),
}));

describe('isPublicAuthUrl', () => {
  it('classifica /auth/login como público', () => {
    expect(isPublicAuthUrl('/auth/login')).toBe(true);
  });

  it('classifica /auth/register como público', () => {
    expect(isPublicAuthUrl('/auth/register')).toBe(true);
  });

  it('classifica /auth/refresh como público', () => {
    expect(isPublicAuthUrl('/auth/refresh')).toBe(true);
  });

  it('classifica /auth/me como protegido', () => {
    expect(isPublicAuthUrl('/auth/me')).toBe(false);
  });

  it('classifica /orders como protegido', () => {
    expect(isPublicAuthUrl('/orders')).toBe(false);
  });

  it('classifica undefined como protegido', () => {
    expect(isPublicAuthUrl(undefined)).toBe(false);
  });
});
