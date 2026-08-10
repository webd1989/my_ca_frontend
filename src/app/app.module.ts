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
import { UserListComponent } from './users/user-list/user-list.component';
import { ContactListComponent } from './contacts/contact-list/contact-list.component';
import { ToastrModule } from 'ngx-toastr';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {NgxPaginationModule} from 'ngx-pagination';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CompanySettingsComponent } from './company-settings/company-settings.component';
import { CompanyNotificationsComponent } from './company-notifications/company-notifications.component';
import { CompanyAuthenticationComponent } from './company-authentication/company-authentication.component';
import { TabsComponent } from './tabs/tabs.component';
import { FormsModule } from '@angular/forms';
import { DatepickerModule } from 'ng2-datepicker';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { TargetComponent } from './target/target.component';
import { QuotationsComponent } from './quotations/quotations.component';
import { ProjectsComponent } from './projects/projects.component';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { AmcComponent } from './amc/amc.component';



@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    ChangePasswordComponent,
    ProfileComponent,
    UserListComponent,
    ContactListComponent,
    SidebarComponent,
    CompanySettingsComponent,
    CompanyNotificationsComponent,
    CompanyAuthenticationComponent,
    TabsComponent,
    ForgotPasswordComponent,
    TargetComponent,
    QuotationsComponent,
    ProjectsComponent,
    AmcComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    NgxPaginationModule,
    FormsModule,
    DatepickerModule,
    CanvasJSAngularChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
