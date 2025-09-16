import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LoginComponent } from './login/login.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ProfileComponent } from './profile/profile.component';
import { CalendarComponent } from './calendar/calendar.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { CompanySettingsComponent } from './company-settings/company-settings.component';
import { CompanyNotificationsComponent } from './company-notifications/company-notifications.component';
import { CompanyAuthenticationComponent } from './company-authentication/company-authentication.component';
import { CompanyListComponent } from './companies/company-list/company-list.component';
import { ContactListComponent } from './contacts/contact-list/contact-list.component';
import { CompanyViewComponent } from './companies/company-view/company-view.component';
import { DealsComponent } from './deals/deals.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import {HashLocationStrategy, LocationStrategy} from "@angular/common";
import { TargetComponent } from './target/target.component';
import { FranchiseComponent } from './franchise/franchise.component';
import { FranchiseDataComponent } from './franchise-data/franchise-data.component';
import { CustomerDataComponent } from './customer-data/customer-data.component';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details.component';
import { PaymentsComponent } from './payments/payments.component';
import { CreditNotesComponent } from './credit-notes/credit-notes.component';

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
    path:'calendar',component:CalendarComponent
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
    path:'companies',component:CompanyListComponent
  },
  {
    path:'contacts',component:ContactListComponent
  },
  {
    path:'company/:id',component:CompanyViewComponent
  },
  {
    path:'deals',component:DealsComponent
  },
  {
    path:'invoices',component:TargetComponent
  },
  {
    path:'franchises',component:FranchiseComponent
  },
  {
    path:'franchise/:id',component:FranchiseDataComponent
  },
  {
    path:'customer/:id',component:CustomerDataComponent
  },
  {
    path:'invoice-detail/:id',component:InvoiceDetailsComponent
  },
  {
    path:'payments',component:PaymentsComponent
  },
  {
    path:'credit-notes',component:CreditNotesComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' , preloadingStrategy: PreloadAllModules})],
    exports: [RouterModule],
    providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  
  })
  export class AppRoutingModule { }
