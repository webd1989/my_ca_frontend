import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private SiteUrl = environment.serviceUrl;

  constructor(
    private http:HttpClient
  ) { }

  deleteData(url: string) {
    const headers = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`
      })
    };
    return this.http.delete(this.SiteUrl+url,headers);
  }

  putData(url: string, data:any) {
    const headers = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`
      })
    };
    return this.http.put(this.SiteUrl + url, data, headers);
  } 

  getData(url: string) {
    const headers = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`
      })
    };
    return this.http.get(this.SiteUrl + url, headers);
  }

  postData(url: string, data:any) {
    const headers = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`
      })
    };
    return this.http.post(this.SiteUrl + url, data, headers);
  } 

  login(url:any,data: any){
    return this.http.post(this.SiteUrl + url, data);
  }
}
