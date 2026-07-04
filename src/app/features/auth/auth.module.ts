import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AuthModuleRoutingModule } from './auth-routing.module';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthLayoutComponent } from './shared/auth-layout/auth-layout.component';
import { PasswordStrengthComponent } from './shared/password-strength/password-strength.component';

@NgModule({
  declarations: [
    ChangePasswordComponent,
    ForgotPasswordComponent,
    LoginComponent,
    ProfileComponent,
    ResetPasswordComponent,
    AuthLayoutComponent,
    PasswordStrengthComponent,
  ],
  imports: [
    SharedModule,
    AuthModuleRoutingModule,
  ],
})
export class AuthModule {}
