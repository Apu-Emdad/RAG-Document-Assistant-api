import { validateEnv } from './env.js';

const validEnv = {
  DATABASE_URL: 'postgresql://starter:starter@localhost:5434/starter_db',
};

describe('validateEnv', () => {
  it('parses valid variables and applies defaults', () => {
    expect(validateEnv(validEnv)).toEqual({
      NODE_ENV: 'development',
      PORT: 5000,
      DATABASE_URL: validEnv.DATABASE_URL,
      WEB_ORIGIN: 'http://localhost:5001',
    });
  });

  it('rejects an invalid WEB_ORIGIN', () => {
    expect(() => validateEnv({ ...validEnv, WEB_ORIGIN: 'not a url' })).toThrow(
      /WEB_ORIGIN/,
    );
  });

  it('throws when DATABASE_URL is missing', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });

  it('rejects a non-postgres DATABASE_URL', () => {
    expect(() =>
      validateEnv({ ...validEnv, DATABASE_URL: 'mysql://localhost/db' }),
    ).toThrow(/DATABASE_URL/);
  });

  it('rejects a non-numeric port', () => {
    expect(() => validateEnv({ ...validEnv, PORT: 'abc' })).toThrow(/PORT/);
  });
});
