import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LoginComponent } from './login/login.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ProfileComponent } from './profile/profile.component';
import { CalendarComponent } from './calendar/calendar.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { CompanyListComponent } from './companies/company-list/company-list.component';
import { ContactListComponent } from './contacts/contact-list/contact-list.component';
import { ToastrModule } from 'ngx-toastr';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {NgxPaginationModule} from 'ngx-pagination';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CompanySettingsComponent } from './company-settings/company-settings.component';
import { CompanyNotificationsComponent } from './company-notifications/company-notifications.component';
import { CompanyAuthenticationComponent } from './company-authentication/company-authentication.component';
import { TabsComponent } from './tabs/tabs.component';
import { CompanyViewComponent } from './companies/company-view/company-view.component';
import { DealsComponent } from './deals/deals.component'; // <-- import the module
import { FormsModule } from '@angular/forms';
import { DatepickerModule } from 'ng2-datepicker';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { TargetComponent } from './target/target.component';
import { FranchiseComponent } from './franchise/franchise.component';
import { FranchiseDataComponent } from './franchise-data/franchise-data.component';
import { CustomerDataComponent } from './customer-data/customer-data.component';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details.component';
import { PaymentsComponent } from './payments/payments.component';
import { CreditNotesComponent } from './credit-notes/credit-notes.component';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    ChangePasswordComponent,
    ProfileComponent,
    CalendarComponent,
    UserListComponent,
    CompanyListComponent,
    ContactListComponent,
    SidebarComponent,
    CompanySettingsComponent,
    CompanyNotificationsComponent,
    CompanyAuthenticationComponent,
    TabsComponent,
    CompanyViewComponent,
    DealsComponent,
    ForgotPasswordComponent,
    TargetComponent,
    FranchiseComponent,
    FranchiseDataComponent,
    CustomerDataComponent,
    InvoiceDetailsComponent,
    PaymentsComponent,
    CreditNotesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    NgxPaginationModule,
    FormsModule,
    DatepickerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
