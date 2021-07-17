import { Injectable } from '@angular/core';
import { ConfigService } from '@sunbird/shared';
import { LearnerService } from '@sunbird/core';
import { HttpClient } from '@angular/common/http';
import { PublicDataService } from '../../../core/services/public-data/public-data.service';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  constructor(public publicDataService: PublicDataService,private http: HttpClient,private learnerService: LearnerService, public configService: ConfigService) { }


  getorgData(data) {
    const options = {
      url: this.configService.urlConFig.URLS.ADMIN.ORG_SEARCH,
      data: data
    };
    //return this.learnerService.post(options);
    return this.publicDataService.post(options);
  }




  createUserDetailSave(data) {
    console.log(data);
    const options = {
      url: this.configService.urlConFig.URLS.USER.SIGNUP,
      data: data
    };
   return this.learnerService.post(options);
    //return this.publicDataService.post(options);

    
  }

 
  getHrmsData()
  {
    let tempArray:any;
    tempArray = {
      "HRMS_ID":"1176123",
      "KEY":"F5FC9F4A7EEDF37C93FFBDCFB34C5D1829984C5B3A6FDB3B95457CD324"
    }
    //return this.learnerService.post(options);
   // return this.http.post('https://gramawardsachivalayam.ap.gov.in/GSWSAPI/api/thirdparty/GSWSHRMSDATA',tempArray);

    const headers = { 'key': 'F5FC9F4A7EEDF37C93FFBDCFB34C5D1829984C5B3A6FDB3B95457CD324'}  
    return this.http.post('http://20.204.66.174:7788/userapi', tempArray,{'headers':headers})
  }



}
