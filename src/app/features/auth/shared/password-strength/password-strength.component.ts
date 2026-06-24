import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { evaluatePasswordPolicy } from '../../../../core/utils/password-policy.util';

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './password-strength.component.html',
  styleUrl: './password-strength.component.less',
})
export class PasswordStrengthComponent {
  readonly password = input('');
  readonly result = computed(() => evaluatePasswordPolicy(this.password()));
  readonly segments = [1, 2, 3, 4];
}
