import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LoginComponent } from './login/login.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ProfileComponent } from './profile/profile.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { CompanySettingsComponent } from './company-settings/company-settings.component';
import { CompanyNotificationsComponent } from './company-notifications/company-notifications.component';
import { CompanyAuthenticationComponent } from './company-authentication/company-authentication.component';
import { ContactListComponent } from './contacts/contact-list/contact-list.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import {HashLocationStrategy, LocationStrategy} from "@angular/common";
import { TargetComponent } from './target/target.component';
import { QuotationsComponent } from './quotations/quotations.component';
import { ProjectsComponent } from './projects/projects.component';
import { AmcComponent } from './amc/amc.component';

const routes: Routes = [
  {
    path:'',component:LoginComponent
  },
  {
    path:'forgot-password',component:ForgotPasswordComponent
  },
  {
    path:'dashboard',component:DashboardComponent
  },
  {
    path:'profile',component:ProfileComponent
  },
  {
    path:'users',component:UserListComponent
  },
  {
    path:'change-password',component:ChangePasswordComponent
  },
  {
    path:'company-settings',component:CompanySettingsComponent
  },
  {
    path:'company-notifications',component:CompanyNotificationsComponent
  },
  {
    path:'company-authentication',component:CompanyAuthenticationComponent
  },
  {
    path:'contacts',component:ContactListComponent
  },
  {
    path:'invoices',component:TargetComponent
  },
  {
    path:'quotations',component:QuotationsComponent
  },
  {
    path:'projects',component:ProjectsComponent
  },
  {
    path:'amc',component:AmcComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' , preloadingStrategy: PreloadAllModules})],
    exports: [RouterModule],
    providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  
  })
  export class AppRoutingModule { }
