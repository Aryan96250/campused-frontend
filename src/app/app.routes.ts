import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PricingComponent } from './pages/pricing/pricing.component';
import { ExamsComponent } from './pages/exams/exams.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
// import { AuthGuard } from './helpers/auth/auth.guards';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password/forgot-password.component';
import { OtpComponent } from './pages/auth/otp/otp/otp.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { ChatComponent } from './pages/chat/chat.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'exams', component: ExamsComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'forgot', component: ForgotPasswordComponent },
  { path: 'otp', component: OtpComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '**', redirectTo: '' }
];
// ,canActivate: [AuthGuard]