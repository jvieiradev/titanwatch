import { Jaeger } from '../entities/Jaeger';
import { Pilot } from '../entities/Pilot';

/**
 * Jaeger Validation Service
 * Contains domain validation logic
 */
export class JaegerValidationService {
  /**
   * Validate if a Jaeger can be deployed
   */
  static canDeploy(jaeger: Jaeger): { valid: boolean; reason?: string } {
    if (!jaeger.canDeploy()) {
      const reasons: string[] = [];

      if (jaeger.integrityLevel.value < 70) {
        reasons.push('Integrity level below 70%');
      }

      if (!jaeger.pilots || jaeger.pilots.length === 0) {
        reasons.push('No pilots assigned');
      }

      if (jaeger.status !== 'active') {
        reasons.push(`Status is ${jaeger.status}`);
      }

      return {
        valid: false,
        reason: reasons.join(', '),
      };
    }

    return { valid: true };
  }

  /**
   * Validate pilot compatibility for drift
   */
  static validatePilotCompatibility(pilot1: Pilot, pilot2: Pilot): { valid: boolean; reason?: string } {
    if (!pilot1.canPilot()) {
      return {
        valid: false,
        reason: `${pilot1.name} cannot pilot (status: ${pilot1.status}, compatibility: ${pilot1.driftCompatibility})`,
      };
    }

    if (!pilot2.canPilot()) {
      return {
        valid: false,
        reason: `${pilot2.name} cannot pilot (status: ${pilot2.status}, compatibility: ${pilot2.driftCompatibility})`,
      };
    }

    if (!pilot1.isCompatibleWith(pilot2)) {
      return {
        valid: false,
        reason: 'Pilots are not drift compatible',
      };
    }

    return { valid: true };
  }

  /**
   * Validate if Jaeger name is valid
   */
  static validateJaegerName(name: string): { valid: boolean; reason?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, reason: 'Name cannot be empty' };
    }

    if (name.length < 3) {
      return { valid: false, reason: 'Name must be at least 3 characters long' };
    }

    if (name.length > 50) {
      return { valid: false, reason: 'Name cannot exceed 50 characters' };
    }

    // Check for valid characters (letters, numbers, spaces, hyphens)
    const validNameRegex = /^[a-zA-Z0-9\s-]+$/;
    if (!validNameRegex.test(name)) {
      return {
        valid: false,
        reason: 'Name can only contain letters, numbers, spaces, and hyphens',
      };
    }

    return { valid: true };
  }

  /**
   * Validate Jaeger specs
   */
  static validateJaegerSpecs(height: number, weight: number): { valid: boolean; reason?: string } {
    if (height < 50 || height > 300) {
      return {
        valid: false,
        reason: 'Height must be between 50 and 300 meters',
      };
    }

    if (weight < 1000 || weight > 10000) {
      return {
        valid: false,
        reason: 'Weight must be between 1,000 and 10,000 tons',
      };
    }

    return { valid: true };
  }
}
