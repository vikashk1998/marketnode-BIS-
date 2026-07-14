import { BOND_CONSTRAINTS } from '../constants';

/**
 * Deterministic-enough random data for independent, non-colliding test entities.
 */
export class RandomDataUtility {
  private static sequence = 0;

  static uniqueSuffix(): string {
    RandomDataUtility.sequence += 1;
    const time = Date.now().toString(36).toUpperCase();
    const seq = RandomDataUtility.sequence.toString(36).toUpperCase().padStart(3, '0');
    return `${time}${seq}`.slice(-8);
  }

  /**
   * Generates a 12-character alphanumeric ISIN-like identifier.
   * Prefix MYBND keeps fixtures recognizable; sequence is embedded so
   * rapid successive calls cannot collide after length truncation.
   */
  static generateIsin(prefix = 'MY'): string {
    RandomDataUtility.sequence += 1;
    const seq = RandomDataUtility.sequence.toString(36).toUpperCase().padStart(4, '0').slice(-4);
    const time = Date.now().toString(36).toUpperCase().slice(-6);
    const raw = `${prefix}${time}${seq}`.replace(/[^A-Z0-9]/g, '0');
    return raw.slice(0, BOND_CONSTRAINTS.isinLength).padEnd(BOND_CONSTRAINTS.isinLength, '0');
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static issuerName(): string {
    return `Issuer ${RandomDataUtility.uniqueSuffix()}`;
  }

  static bondName(): string {
    return `Bond ${RandomDataUtility.uniqueSuffix()} Notes`;
  }

  static fileSequence(n: number): string {
    return String(n).padStart(3, '0');
  }
}
