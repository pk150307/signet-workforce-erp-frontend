export interface PasswordPolicyCheck {
  label: string;
  passed: boolean;
}

export interface PasswordPolicyResult {
  valid: boolean;
  score: number;
  label: string;
  checks: PasswordPolicyCheck[];
  errors: string[];
}

const COMMON_PASSWORDS = new Set(['password', 'admin123', '12345678', 'qwerty123']);

export function evaluatePasswordPolicy(password: string): PasswordPolicyResult {
  const checks: PasswordPolicyCheck[] = [
    { label: 'At least 8 characters', passed: password.length >= 8 },
    { label: 'One uppercase letter', passed: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', passed: /[a-z]/.test(password) },
    { label: 'One number', passed: /[0-9]/.test(password) },
    { label: 'One special character', passed: /[^A-Za-z0-9]/.test(password) },
  ];

  const errors: string[] = [];
  for (const check of checks) {
    if (!check.passed) {
      errors.push(check.label);
    }
  }
  if (password && COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('Password is too common');
    checks.push({ label: 'Not a common password', passed: false });
  } else if (password) {
    checks.push({ label: 'Not a common password', passed: true });
  }

  const passedCount = checks.filter((c) => c.passed).length;
  const score = password ? Math.min(4, Math.floor((passedCount / checks.length) * 4)) : 0;

  let label = 'Weak';
  if (score >= 4) label = 'Strong';
  else if (score >= 3) label = 'Good';
  else if (score >= 2) label = 'Fair';

  return {
    valid: errors.length === 0 && password.length > 0,
    score,
    label,
    checks,
    errors,
  };
}
