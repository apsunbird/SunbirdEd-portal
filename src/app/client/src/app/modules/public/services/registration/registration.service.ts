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







  getUserDetailByID(data)
  {
    const option = {
      url: this.configService.urlConFig.URLS.USER.READ +'/'+data
    };
    return this.learnerService.get(option);
  }




 
  addroleRootOrganization(data)
  {
    const options = {
      url: this.configService.urlConFig.URLS.ADMIN.UPDATE_USER_ORG_ROLES,
      data: data
    };
    return this.learnerService.post(options);
  }

  userSearch(data) {
    const options = {
      url: this.configService.urlConFig.URLS.USER.SEARCH_USER,
      data: data
    };
    return this.learnerService.post(options);
  }


  getUserDetailById(data)
  {
    const option = {
      url: this.configService.urlConFig.URLS.USER.READ +'/'+data
    };
    return this.learnerService.get(option);
  }






  userBlock(data)
  {      
   
    const options = {
      url: this.configService.urlConFig.URLS.ADMIN.DELETE_USER,
      data: data
    };
    return this.learnerService.post(options);
  
}
userUnBlock(data)
{  
 
  const options = {
    url: this.configService.urlConFig.URLS.ADMIN.UNDELETE_USER,
    data: data
  };
  return this.learnerService.post(options);

}

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
  
  
  editUserDetail(data) {
    console.log(data);
    const options = {
      url: this.configService.urlConFig.URLS.USER.UPDATE_USER_PROFILE,
      data: data
    };
   return this.learnerService.patch(options);
  }



}
