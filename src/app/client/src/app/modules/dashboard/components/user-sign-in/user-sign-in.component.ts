import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup,Validators } from '@angular/forms';
//import { UserService } from '../../../core/services';
import {RegistrationService} from '../../../public/services/registration/registration.service';
import { ValidationserviceService } from '../../../shared/regex/validationservice.service';
import { ConfirmedValidator } from '../../../public/js/confirmed.validator';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common'
import * as moment from 'moment';
import { UserSearchService } from '../../../search/services';
import {Subject, Subscription} from 'rxjs';

import {
  CertRegService,
  CoursesService,
  OrgDetailsService,
  PlayerService,
  SearchService,
  UserService,
  FormService
} from '@sunbird/core';
import {
  ConfigService,
  IUserData, LayoutService,
  NavigationHelperService,
  ResourceService,
  ServerResponse,
  ToasterService,
  UtilService,
  ConnectionService
} from '@sunbird/shared'
export interface showUserData {
  id,
  rootOrgId,
  createdDate,
  status,
  firstName,
  lastName,
  email,
  phone,
  userOrglengths,
  uStatus,
  hrmsId,
  cfmsId,
  mandal,
  revDiv,
  district,
  emailId,
  mobile
}

export interface User {
  firstName;
  lastName;
  email;
  phone;
}


@Component({
  selector: 'app-user-sign-in',
  templateUrl: './user-sign-in.component.html',
  styleUrls: ['./user-sign-in.component.scss']
})
export class UserSignInComponent implements OnInit {

  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
  userRegistration: FormGroup;
  userRegForm:boolean = false;
  gender:any;
  orgNameList:any;
  getOrgData: any;
  externaLIDS = [];
    hrmsIDData: { id: any; idType: string; provider: string; operation:string; };
  cfmsIDData: { id: any; idType: string; provider: string; operation:string; };
  secCodeData: { id: any; idType: string; provider: string;  operation:string;};
  secNameData: { id: any; idType: string; provider: string; operation:string;};
  dob: { id: any; idType: string; provider: string; operation:string;};
  jobNameData: { id: any; idType: string; provider: string; operation:string;};
  roleData: { id: any; idType: string; provider: string; operation:string;};
  passwordNotMatch: boolean = false;
  hrmsData: any;
  date: Date;
  dobData: string;
  jobProfileDate: string;
  userRes: any;
  errorMsg: any;
  genericMsg: any;
  genericPoup: boolean = false;
  userData: any;
  //showUserData: any[] = new Array();
   showUserData: showUserData[];
  colsUser: any[];
  filteredValuesLength: any;
  countUserRecord: any;
  users: User[]
  rolePopup:boolean = false;
  //selectedItems: { roleName: number; role: string; }[];
  roleDataArr: any;
  orgId: any;
  userId: any = null;
  findePublic: boolean;
  allRoles: any[];
  selectedRole1: any[];
  publicRoleExist: boolean;
  gridUserId: string;
  gridOrgID: string;
  userEditRoleResponse: any;
  status: string;


  selectedRoles1: any[];



  roles: any[];
  userRoleForm: FormGroup;
  subOrgPopup: boolean;
  userDetail: any;
  getUserRoles: any = new Array()
  getUserorgId: any;
  orgListArr: any = new Array()
  public getOrgMentorList: Array<any> = [];
  addOrgForm: FormGroup;
  userOrgLength: any;
  gridOrgUserId: any;
  addOrgId: any;
  onchangeaddOrgName: any;
  onchangeaddOrgId: any;
  removeOrgUserId: any;
  removeOrgUserdataAll: any;
  orgDeletePopup: boolean=false;
  genericForm: FormGroup;
  removeOrgFormId: any;
  blockUserid: any;
  blockId: any;
  confirmPopup: boolean=false;
  confirmPopupMsg: string;
  confirmUserForm: FormGroup;
  private userSearchService: UserSearchService;

  orgData: any;
  userLoginData: any;
  userLoginDataChannel: any = null;
  orgDataRole: any;
  userTab: boolean = false;
  organizationTab: boolean  = false;
  UploadTemplate:boolean  = false;
  checkRootOrg: boolean;
  systemVar: string;
  isrootOrganization: string;
  organisationId: any;
  public mentorList: Array<any> = [];
  subOrgName: any;
  userEditBlockUnblockResponse: any;
 
  hrmsIDPopup: boolean;
  userHrmsIdForm: FormGroup;
  qualificationData: { id: any; idType: string; provider: string; operation: string; };
  educationData: { id: any; idType: string; provider: string; operation: string; };
  emailIdData: { id: any; idType: string; provider: string; operation: string; };
  mobileNumberData: { id: any; idType: string; provider: string; operation: string; };


  disabledMobile: boolean;
  editMobile: boolean=false;
  editName: boolean=false;
 // hrmsIdData: boolean;
  genderData: boolean=false;
  cfmsID: boolean=false;
  SECRETARIAT_NAME: boolean=false;
  secName: boolean=false;
  secCode: boolean=false;
  mandalName: boolean=false;
  revDivNane: boolean=false;
  districtName: boolean=false;
  qualificationlist: boolean=false;
  designation: boolean=false;
 // districtAry: any;
  divAry: { divName: string; divVal: string; }[];
  divisionval: any;
  divisionvalk: { key: any; }[];
  districtAry: { districtName: string; districtVal: string; }[];
  public districtList: Array<any> = [];
  public divList: Array<any> = [];
  public mandalList: Array<any> = [];
  public mandalListNew: Array<any> = [];
  frmDistrictVal: string = null;
  revDivVal: string;
  districtKey: string;
  joinDateData: { id: any; idType: string; provider: string; operation: string; };
  hrmsResponse: Response;
  userProfile: any;
  userSubscription: Subscription;
  userDataDistrictWise: any[];
  userDataDistrictWiseAry: any;
  userDataDistrictWiseAryData: any[] = new Array();
  userDataRevenuetWise: any[];
  userDataRevenuetWiseAry: any;
  userDataRevenuetWiseAryData: any[] = new Array();
  userDataMandalWise: any[];
  userDataMandalWiseAry: any;
  userDataMandalWiseAryData: any[] = new Array();
  orgRolesAry: any;
  showUserRecords: boolean=false;
  orgAdmin: boolean=false;
  hrmsIdDataCheck: boolean=false;
  emailIdDataCheck: boolean=false;
  userRolesAry: any= new Array()
  userIds: string[];

   /**
	 * Constructor to create injected service(s) object
	 *
	 * Default method of DeleteComponent class
	 *
   * @param {UserSearchService} userSearchService Reference of UserSearchService
   * @param {ActivatedRoute} activatedRoute Reference of ActivatedRoute
   * @param {ResourceService} resourceService Reference of ResourceService
   * @param {ToasterService} toasterService Reference of ToasterService
   * @param {RouterNavigationService} routerNavigationService Reference of routerNavigationService
	 */
  
  constructor(private userService: UserService,userSearchService: UserSearchService,public resourceService: ResourceService,public toasterService: ToasterService,public datepipe: DatePipe,private http: HttpClient,private _validation:ValidationserviceService,private _httpService:RegistrationService,  private fb: FormBuilder) { 
    
  }

  ngOnInit() {
    this.userSubscription = this.userService.userData$.subscribe((user: IUserData) => {
      /* istanbul ignore else */
      if (user.userProfile) {
        this.userProfile = user.userProfile;
        console.log("User Profile data==================");
        console.log(this.userProfile);
        this.orgRolesAry = this.userProfile.organisations[0].roles;
        console.log(this.orgRolesAry);
        if(this.orgRolesAry.includes("ORG_ADMIN") || this.orgRolesAry.includes("SYSTEM_ADMINISTRATION"))
        {
           this.showUserRecords = true;
           console.log("first=======");

        }
        else{
          this.showUserRecords = false;
          console.log("second=========");
          //this.genericPoup = true;
          this.hrmsIDPopup = false;
          //this.genericMsg ="You don't have any permission!";
        }

        if(this.orgRolesAry.includes("ORG_ADMIN"))
        {
          this.orgAdmin = true;
          console.log("third==============");
        }

        }
      
       
    });

    this.dropdownList = [
      {"id":1,"itemName":"PUBLIC"},
      {"id":2,"itemName":"CONTENT_CREATOR"},
      {"id":3,"itemName":"CONTENT_REVIEWER"},
      {"id":4,"itemName":"COURSE_MENTOR"},
      {"id":5,"itemName":"ORG_ADMIN"},
      {"id":6,"itemName":"ORG_MODERATOR"},
      {"id":7,"itemName":"ORG_MANAGEMENT"},
      {"id":8,"itemName":"SYSTEM_ADMINISTRATION"}

    ];
this.dropdownSettings = { 
          singleSelection: false, 
          text:"Select Roles",
          selectAllText:'Select All',
          unSelectAllText:'UnSelect All',
          enableSearchFilter: true,
          classes:"myclass custom-class"
        };  
   
    this.gender = [{name:'Male',option:'Male'},{name:'Female',option:'Female'}]
   // this.orgNameList = [{name:'org name 1',option:'org option 1'},{name:'org name 1',option:'org option 2'}]
   this.userRegistration = this.fb.group({
    mobileNumber: new FormControl(null,[Validators.required,Validators.pattern(this._validation.mobileno)]),
    emailId: new FormControl(null,[Validators.required,Validators.pattern(this._validation.emailRegex)]),
    fName: new FormControl(null,Validators.required),
    lName: new FormControl(null),
    dob: new FormControl(null,Validators.required),
    gender: new FormControl(null,Validators.required),
    education: new FormControl(null,Validators.required),
    jobName: new FormControl(null,Validators.required),
    orgName: new FormControl(null),
    joinDate: new FormControl(null,Validators.required),
    hrmsID: new FormControl(null,[Validators.required,Validators.pattern(this._validation.alphanumericRegex)]),
    cfmsID: new FormControl(null,[Validators.required,Validators.pattern(this._validation.alphanumericRegex)]),
    secName: new FormControl(null,Validators.required),
    secCode: new FormControl(null,Validators.required),
    mandalULB: new FormControl(null,Validators.required),
    revDiv: new FormControl(null,Validators.required),
    district: new FormControl(null,Validators.required),
    password: new FormControl(null,[Validators.required,Validators.minLength(8)]),
    confirmpassword: new FormControl(null,[Validators.required,Validators.minLength(8)]),
    designation: new FormControl(null),
    qualification: new FormControl(null),
    departmentap: new FormControl(null),
    ageap: new FormControl(null)
    
  },{ 
    validator: ConfirmedValidator('password', 'confirmpassword')
  })


    this.userRoleForm = this.fb.group({
      role:new FormControl(null)
    })


    this.addOrgForm = this.fb.group({
      addOrgname: new FormControl(null,Validators.required),
      addOrgrole: new FormControl(null,Validators.required),
      gridOrgUserId: new FormControl(null),
    })

    this.genericForm = new FormGroup({
      genericId: new FormControl(null),
      genericUserId: new FormControl(null),
     })



     this.confirmUserForm = new FormGroup({
      blockUserid: new FormControl(null),
      blockid: new FormControl(null),
     })


     this.userHrmsIdForm = this.fb.group({
      addHrmsId: new FormControl(null,Validators.required)
    })
    this.readOrgData();
    this.populateUserSearch();
    this.initializeColumns();
    this.getDistrictMandalData(null,null);

  }
  hrmsIdSubmit(){
    //this.orgAdmin = true
    console.log("org Admin status===========");
    console.log(this.orgAdmin);
    let data:any;
    data= {
      "HRMS_ID":this.userHrmsIdForm.value['addHrmsId'],
      "KEY":'F5FC9F4A7EEDF37C93FFBDCFB34C5D1829984C5B3A6FDB3B95457CD324'
      }
    this.http.post('https://apgsws.in/learner/user/v1/gethrmsData?HRMS_ID='+this.userHrmsIdForm.value['addHrmsId'], data).subscribe(res => {
      console.log(res);
      console.log(res['status']);
   
    
     if(res['status']==true || this.orgAdmin == true)
     {
     this.userRegForm = true;
     this.genericPoup = false;
     this.hrmsIDPopup = false;
  

    if(res['status']==true)
    {

     /* this.hrmsData= {
        'MOBILE':'9177057488',
        'EMP_MAIL_ID':'chakshu303@gmail.com',
        'EMP_NAME':'chakshu',
        'GENDER':'MALE',
        'QUALIFICATION':'B-Tech',
        'DESIGNATION':'Software Eng',
        'DEPARTMENT':'Health, Medical & Family Welfare',
        "SECRETARIAT_NAME": "KOTAVURU",
        "SECRETARIAT_CODE": "11090984",
        "MANDAL_NAME": "B KOTHAKOTA",
        "DISTRICT_NAME": "CHITTOOR",
        "AGE":"10"
  
  
      }*/

    this.hrmsData= {
      'MOBILE':res['result'][0]['MOBILE'],
      'EMP_MAIL_ID':res['result'][0]['EMP_MAIL_ID'],
      'EMP_NAME':res['result'][0]['EMP_NAME'],
      'GENDER':res['result'][0]['GENDER'],
      'QUALIFICATION':res['result'][0]['QUALIFICATION'],
      'DESIGNATION':res['result'][0]['DESIGNATION'],
      'DEPARTMENT':res['result'][0]['DEPARTMENT'],
      "SECRETARIAT_NAME": res['result'][0]['SECRETARIAT_NAME'],
      "SECRETARIAT_CODE": res['result'][0]['SECRETARIAT_CODE'],
      "MANDAL_NAME": res['result'][0]['MANDAL_NAME'],
      "DISTRICT_NAME": res['result'][0]['DISTRICT_NAME'],
      "HRMS_ID":res['result'][0]['HRMS_ID'],
      "CFMS_ID":res['result'][0]['CFMS_ID']
      
    }


  }
    else
    {
      this.hrmsData= {
        'MOBILE':null,
        'EMP_MAIL_ID':null,
        'EMP_NAME':null,
        'GENDER':null,
        'QUALIFICATION':null,
        'DESIGNATION':null,
        'DEPARTMENT':null,
        "SECRETARIAT_NAME": null,
        "SECRETARIAT_CODE":null,
        "MANDAL_NAME": null,
        "DISTRICT_NAME": null,
        "HRMS_ID":null,
        "CFMS_ID":null
        
      }
    }
     if(this.hrmsData.MOBILE!=null)
     {
       this.editMobile = true;
     }
     else{
      this.editMobile = false;
     }

     if(this.hrmsData.EMP_NAME!=null)
     {
       this.editName = true;
     }
     else{
      this.editName = false;
     }
      console.log("Test=============Emp name==");
     console.log(this.hrmsData.EMP_NAME);
     console.log(this.editName);

    // this.editName

    if(this.hrmsData.EMP_MAIL_ID!=null)
    {
      this.emailIdDataCheck = true;
    }
    else{
     this.emailIdDataCheck = false;
    }


     if(this.hrmsData.HRMS_ID!=null)
     {
       this.hrmsIdDataCheck = true;
     }
     else{
      this.hrmsIdDataCheck = false;
     }


     if(this.hrmsData.GENDER!=null)
     {
       this.genderData = true;
     }
     else{
      this.genderData = false;
     }

     if(this.hrmsData.CFMS_ID!=null)
     {
       this.cfmsID = true;
     }
     else{
      this.cfmsID = false;
     }

     if(this.hrmsData.SECRETARIAT_NAME!=null)
     {
       this.secName = true;
     }
     else{
      this.secName = false;
     }

     if(this.hrmsData.SECRETARIAT_CODE!=null)
     {
       this.secCode = true;
     }
     else{
      this.secCode = false;
     }

     if(this.hrmsData.MANDAL_NAME!=null)
     {
       this.mandalName = true;
     }
     else{
      this.mandalName = false;
     }
     if(this.hrmsData.DISTRICT_NAME!=null)
     {
       this.districtName  = true;
     }
     else{
      this.districtName = false;
     }

     if(this.hrmsData.QUALIFICATION!=null)
     {
       this.qualificationlist  = true;
     }
     else{
      this.qualificationlist = false;
     }

     if(this.hrmsData.DESIGNATION!=null)
     {
       this.designation  = true;
     }
     else{
      this.designation = false;
     }

   
    }
   else if(res['status']==false && this.orgAdmin== false)
    {


      this.hrmsData= {
        'MOBILE':null,
        'EMP_MAIL_ID':null,
        'EMP_NAME':null,
        'GENDER':null,
        'QUALIFICATION':null,
        'DESIGNATION':null,
        'DEPARTMENT':null,
        "SECRETARIAT_NAME": null,
        "SECRETARIAT_CODE":null,
        "MANDAL_NAME": null,
        "DISTRICT_NAME": null,
        "HRMS_ID":null,
        "CFMS_ID":null
        
      }
      this.genericPoup = true;
      this.hrmsIDPopup = false;
      this.genericMsg ="Invalid HRMS ID";
      console.log('second========');
    }

      console.log("datat");
      console.log("datat========");
  },err => {
    console.log("errrorrrrrr===");
    console.log(err.message);
})

  }

 



onItemSelect(item:any){
console.log(item);
console.log(this.selectedItems);
}
OnItemDeSelect(item:any){
    console.log(item);
    console.log(this.selectedItems);
}
onSelectAll(items: any){
    console.log(items);
}
onDeSelectAll(items: any){
    console.log(items);
}



removeOrg(orgUserId:any)
{ 
  this.removeOrgUserId=orgUserId;
  this._httpService.getUserDetailById(this.removeOrgUserId).subscribe(res=>{
    console.log("---remove org data---")
    console.log(res)
    this.orgDeletePopup=true
      if (res.result.response.organisations.length > 0) { 
        if(res.result.response.rootOrgId!=res.result.response.organisations[1].organisationId)  
        {  
        this.removeOrgUserdataAll= res.result.response.organisations[1].organisationId;
        }
        else
        {
         this.removeOrgUserdataAll= res.result.response.organisations[0].organisationId;  
        }
    } 
  }, (err) => {
    console.log(err);
  });


//console.log(this.removeOrgUserdataAll)
}

  addRole(userID,orgID)
  {
    sessionStorage.setItem("userID", userID);
    sessionStorage.setItem("orgID", orgID);
   // this.dropdownList = [];
   // this.selectedRoles1 = [];
   this.dropdownList = [
    {"id":1,"itemName":"PUBLIC"},
    {"id":2,"itemName":"CONTENT_CREATOR"},
    {"id":3,"itemName":"CONTENT_REVIEWER"},
    {"id":4,"itemName":"COURSE_MENTOR"},
    {"id":5,"itemName":"ORG_ADMIN"},
    {"id":6,"itemName":"ORG_MODERATOR"},
    {"id":7,"itemName":"ORG_MANAGEMENT"},
    {"id":8,"itemName":"SYSTEM_ADMINISTRATION"}

  ];
  /* this.selectedItems = [
    {"id":1,"itemName":"PUBLIC"}
  ]  */

  this.selectedItems = [
    {"id":1,"itemName":"PUBLIC"}   
];
  
    this._httpService.getUserDetailByID(userID).subscribe(response => { 
      console.log("User Response ==============================");
     // console.log(response);
      this.userDetail = response;

      this.userRolesAry =  this.userDetail.result.response.organisations[0].roles;
      //console.log(this.userDetail);
      //console.log(this.userRolesAry);
      this.rolePopup = true;

      if( this.userRolesAry.length > 0 ) {
        for( var i = 0; i < this.dropdownList.length; i++ ) {      
         for( var j = 0; j < this.userRolesAry.length; j++ ) {
           if(this.userRolesAry[j] !="PUBLIC"){
           if( this.userRolesAry[j] == this.dropdownList[i].itemName ) {
                   this.selectedItems.push({"id" :this.dropdownList[i].id,"itemName":this.dropdownList[i].itemName});
              } 
            }   
          }
        }
      } 
    
   

}, (err) => {
  console.log(err);

});
  }


  blockConfirmState()
  {
    this.confirmPopup=false;
   this.blockUserid = this.confirmUserForm.value['blockUserid']
   this.blockId = this.confirmUserForm.value['blockid']
   if(this.blockId==1)
   {
       this.userBlock( this.blockUserid);
   }
   if(this.blockId==0)
   {
       this.userUnBlock( this.blockUserid);
   }
  }



  /**
   * This method used for user block
	 */
   userBlock(userIds:any)
   {
    // this.confirmPopup=false;
     console.log(userIds);
     let tempArray : any
     tempArray= {
     "request": {
       "userId": userIds
       }
     }
     console.log(tempArray)
     this._httpService.userBlock(tempArray).subscribe(res=>{
       console.log("block  file");
       if(res.result.response=='SUCCESS')
       {
        // this.populateUserProfile();

        this.populateUserSearch();
        this.confirmPopup=false;
        this.userEditBlockUnblockResponse = res;
        this.genericPoup = true;
        this.genericMsg =this.userEditBlockUnblockResponse.result.response;
        //location.reload();
        //window.location.reload();
       }
       console.log(res);
      },err=>{
      console.log(err)
      this.populateUserSearch();
      this.confirmPopup=false;
      this.genericPoup = true;
      this.genericMsg ==err.error.params.errmsg;
      //window.location.reload();
      //this.sucesErrorPopup=true 
      //this.popupMsg="User registration is incomplete and is already inactive..";
      })
     
   }
   /**
    * This method used for user unblock
    */
   userUnBlock(userIds:any)
   {
    // this.confirmPopup=false;
     console.log(userIds);
     let tempArray : any
     tempArray= {
     "request": {
       "userId": userIds
       }
     }
     console.log(tempArray)
     this._httpService.userUnBlock(tempArray).subscribe(res=>{
       console.log("Unblock  file");
       console.log(res);
 
       if(res.result.response=='SUCCESS')
       {
        // this.populateUserProfile();
        this.populateUserSearch();
        this.userEditBlockUnblockResponse = res;
        this.genericPoup = true;
        this.genericMsg =this.userEditBlockUnblockResponse.result.response;
        //location.reload();
       // window.location.reload();
       }
      },err=>{
      console.log(err)
      //this.populateUserProfile();
      this.populateUserSearch();
      //this.confirmPopup=false;
      this.genericPoup = true;
      this.genericMsg =err.error.params.errmsg;
    //  window.location.reload();

      })
   }

 /**
   * This method used for add org button form submit 
	 */


    /**
   * This method used for fetch org detail
	 */
     addOrg(userID:any,orgID:any)
     {
      this.gridOrgUserId=userID;
       this.selectedItems=[];
       this.selectedItems = [
         {"id":1,"itemName":"PUBLIC"}   
     ];

     sessionStorage.setItem("userID", userID);
     sessionStorage.setItem("orgID", orgID);
     
       this._httpService.getUserDetailById(userID).subscribe(res=>{    
         console.log(res);
         this.userDetail = res.result.response;
         if(this.userDetail.organisations.length == 1)
         {
          this.subOrgPopup = true;
          this.getUserRoles = this.userDetail.organisations[0].roles;
          this.getUserorgId = this.userDetail.organisations[0].organisationId;
          this.getUserOrgList(this.userDetail.channel)
          this.rootOrgAdminRoleList();
         }
         else if(this.userDetail.organisations.length >1)
         {
          this.subOrgPopup = true;
          this.getUserRoles = this.userDetail.organisations[1].roles;
          this.getUserorgId = this.userDetail.organisations[1].organisationId;
          this.subRootOrgRoleList();
         }

     
       }, (err) => {
         console.log(err);
       });
      
     }

rootOrgAdminRoleList()
{
  this.dropdownList = [
    {"id":1,"itemName":"PUBLIC"},
    {"id":2,"itemName":"CONTENT_CREATOR"},
    {"id":3,"itemName":"CONTENT_REVIEWER"},
    {"id":4,"itemName":"COURSE_MENTOR"},
    {"id":5,"itemName":"ORG_ADMIN"},
    {"id":6,"itemName":"ORG_MANAGEMENT"},
    {"id":7,"itemName":"ORG_MODERATOR"},
   
  ];
  return this.dropdownList; 
}
subRootOrgRoleList()
{
  this.dropdownList = [
    {"id":1,"itemName":"PUBLIC"},
    {"id":2,"itemName":"CONTENT_CREATOR"},
    {"id":3,"itemName":"CONTENT_REVIEWER"},
    {"id":4,"itemName":"COURSE_MENTOR"},
    {"id":5,"itemName":"ORG_ADMIN"},
    {"id":6,"itemName":"ORG_MODERATOR"},
   
  ]; 
  return this.dropdownList; 
}

      /**
   * This method used for fetch particular user organization data 
	 */ 

  getUserOrgList(userChannel:any)
  {
    
    let tempArray : any
    tempArray= {
      'request': {
        'query': '',
        'filters': {
          "channel":userChannel,
          isRootOrg: false
        },
        'limit': 1000
      }
    }
      this._httpService.getorgData(tempArray).subscribe(res=>{
      this.orgListArr =res.result.response.content;
     this.getOrgMentorList = this.orgListArr.sort(function(a, b) {
       return b.isRootOrg - a.isRootOrg
      })
     
     },err=>{
     console.log(err)
     })

  }


  onFilter(event, dt) {
    this.filteredValuesLength = event.filteredValue.length;
   // alert(this.filteredValuesLength)
    if( this.filteredValuesLength == this.countUserRecord)
    {
     this.countUserRecord = this.countUserRecord;
    }
    else if( this.filteredValuesLength != this.countUserRecord)
    {
     this.countUserRecord = this.filteredValuesLength;
    }
    else
    {
     this.countUserRecord = this.countUserRecord;
    }
  } 

  initializeColumns() {
    this.colsUser = [
      { field: 'firstName', header: ' Full Name', width: '110px' },
     { field: 'emailId', header: 'Email', width: '212px' },
     { field: 'mobile', header: 'Mobile', width: '118px' },
      //{ field: 'phone', header: 'Mobile', width: '100px' },
      { field: 'district', header: 'District', width: '115px' },
      { field: 'revDiv', header: 'Revenue Division', width: '115px' },
      { field: 'mandal', header: 'Mandal/ULB', width: '115px' },
      { field: 'hrmsId', header: 'HRMS ID', width: '90px' },
      { field: 'cfmsId', header: 'CFMS ID', width: '90px' },
      { field: 'status', header: 'Status', width: '65px' }
      
    ]
  }
  populateUserSearch()
  {

      let tempArray : any
   
        tempArray= {
          'request': {
            'query': '',
            'filters': {
              
            }
          }
        }
      
     this._httpService.userSearch(tempArray).subscribe(res => {
    console.log(res);     
     this.showUserData = [];
     this.userDataDistrictWiseAryData = [];
     this.userDataRevenuetWiseAryData = [];
     this.userDataMandalWiseAryData = [];
     //this.countUserRecord = res.result.response.count;
        res.result.response.content.forEach(element => {
          this.userOrgLength =  element.organisations.length;
          if(element.status==1)
          {
            this.status =   'Active';
          }
          else if(element.status==0)
          {
            this.status =   'Inactive';
          }
          //var names = 'Harry,John,Clark,Peter,Rohn,Alice';
          if(element.lastName!=null)
          {
          var nameArr = element.lastName.split('$#$#')
          console.log(element.lastName);
          console.log(nameArr);
          if(nameArr[0]!=null)
          {
            var hrmsId = nameArr[0];
          }
          else
          {
            var hrmsId = null;
          }
          if(nameArr[1]!=null)
          {
            var cfmsId = nameArr[1];
          }
          else
          {
            var cfmsId = null;
          }
          if(nameArr[8]!=null)
          {
            var mandal = nameArr[8];
          }
          else
          {
            var mandal = null;
          }
          if(nameArr[9]!=null)
          {
            var revDiv = nameArr[9];
          }
          else
          {
            var revDiv = null;
          }
          if(nameArr[10]!=null)
          {
            var districtName = nameArr[10];
          }
          else
          {
            var districtName = null;
          }
          if(nameArr[11]!=null)
          {
            var emailId = nameArr[11];
          }
          else
          {
            var emailId = null;
          }
          if(nameArr[12]!=null)
          {
            var mobile = nameArr[12];
          }
          else
          {
            var mobile = null;
          }
          }
         // "lastName": this.userRegistration.value['hrmsID']+'$#$#'+this.userRegistration.value['cfmsID']+'$#$#'+this.userRegistration.value['secCode']+'$#$#'+this.userRegistration.value['secName']+'$#$#'+this.userRegistration.value['ageap']+'$#$#'+this.userRegistration.value['jobName']+'$#$#'+this.userRegistration.value['education']+'$#$#'+this.userRegistration.value['departmentap']+'$#$#'+this.userRegistration.value['mandalULB']+'$#$#'+this.userRegistration.value['revDiv']+'$#$#'+this.userRegistration.value['district']+'$#$#'+this.userRegistration.value['emailId']+'$#$#'+this.userRegistration.value['mobileNumber']+'$#$#'+this.userRegistration.value['dob']+'$#$#'+this.userRegistration.value['joinDate']+'$#$#'+this.userRegistration.value['gender'],
          this.showUserData.push({"uStatus":element.status,"userOrglengths":this.userOrgLength,"createdDate":element.createdDate,"status":this.status,"id":element.id,"rootOrgId": element.rootOrgId,"firstName": element.firstName,"lastName":element.lastName,"email":element.email,"phone":element.phone,"hrmsId":hrmsId,"cfmsId":cfmsId,"mandal":mandal,"revDiv":revDiv,"district":districtName,"emailId":emailId,"mobile":mobile});
        })

        console.log("users==========");
        //console.log(nameArr);
        console.log(this.showUserData);

       const ids = ['baf6d6a3-194b-4749-a28f-d4d7363a8fcb',"94106546-4c66-49e4-8d96-db676ba5af97"];
        this.showUserData =   this.showUserData.filter( i => ids.includes( i.id ) == false );
        this.countUserRecord = this.showUserData.length;
        this.showUserData =  this.showUserData.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      
        this.userDataDistrictWise = this.showUserData
        .map(item => item.district)
        .filter((value, index, self) => self.indexOf(value) === index)
        this.userDataDistrictWiseAry  = this.userDataDistrictWise.filter(f => f !== undefined && f !== null) as any;
        this.userDataDistrictWiseAry.forEach(element => {
        this.userDataDistrictWiseAryData.push({"label": element,"value":element})
        });


        this.userDataRevenuetWise = this.showUserData
        .map(item => item.revDiv)
        .filter((value, index, self) => self.indexOf(value) === index)
        this.userDataRevenuetWiseAry  = this.userDataRevenuetWise.filter(f => f !== undefined && f !== null) as any;
        this.userDataRevenuetWiseAry.forEach(element => {
        this.userDataRevenuetWiseAryData.push({"label": element,"value":element})
        });


        this.userDataMandalWise = this.showUserData
        .map(item => item.mandal)
        .filter((value, index, self) => self.indexOf(value) === index)
        this.userDataMandalWiseAry  = this.userDataMandalWise.filter(f => f !== undefined && f !== null) as any;
        this.userDataMandalWiseAry.forEach(element => {
        this.userDataMandalWiseAryData.push({"label": element,"value":element})
        });

      });    
  }

show()
{
    //this.userRegForm = true;

    this.hrmsIDPopup = true;
}
 readOrgData()
{

  let tempArray:any;
  tempArray= {
    "request": {
      "filters": {
        isTenant: true
      }
    }
  }
  this._httpService.getorgData(tempArray).subscribe(res => {
    console.log('orgData');
    console.log(res);
    this.orgNameList = res.result.response.content;
  });
}

onSubmitForm()
{
  console.log(this.userRegistration)
  console.log(this.userRegistration.value['orgName']);
  //return false;
  this.externaLIDS = [];
   
    this.hrmsIDData = 
    {
      "id":this.userRegistration.value['hrmsID'], 
      "idType":"HRMSID", 
      "provider": "GSWS-test",
      "operation":"add"
    }
  

  
   
    this.cfmsIDData = 
    {
      "id":this.userRegistration.value['cfmsID'], 
      "idType":"CFMSID", 
      "provider": "GSWS-test",
      "operation":"add"
    }
 
   
    this.secCodeData = 
    {
      "id":this.userRegistration.value['secCode'], 
      "idType":"SECCODE", 
      "provider": "GSWS-test",
      "operation":"add"
    }
 
   
    this.secNameData = 
    {
      "id":this.userRegistration.value['secName'], 
      "idType":"SECNAME", 
      "provider": "GSWS-test",
      "operation":"add"
    }


    this.dob = 
    {
      "id":this.userRegistration.value['dob'], 
      "idType":"DOB", 
      "provider": "GSWS-test",
      "operation":"add"
    }
  

    this.jobNameData = 
    {
      "id":this.userRegistration.value['jobName'], 
      "idType":"JOBNAME", 
      "provider": "GSWS-test",
      "operation":"add"
    }


    this.roleData = 
    {
      "id":this.userRegistration.value['designation'], 
      "idType":"DESIGNTAION", 
      "provider": "GSWS-test",
      "operation":"add"
    }


    this.educationData = 
    {
      "id":this.userRegistration.value['education'], 
      "idType":"EDUCATION", 
      "provider": "GSWS-test",
      "operation":"add"
    }



    


    this.emailIdData = 
    {
      "id":this.userRegistration.value['emailId'], 
      "idType":"EMAILID", 
      "provider": "GSWS-test",
      "operation":"add"
    } 


    this.mobileNumberData = 
    {
      "id":this.userRegistration.value['mobileNumber'], 
      "idType":"MOBILENUMBER", 
      "provider": "GSWS-test",
      "operation":"add"
    } 


    this.joinDateData = 
    {
      "id":this.userRegistration.value['joinDate'], 
      "idType":"JOINDATE", 
      "provider": "GSWS-test",
      "operation":"add"
    } 

    
    
    
  
  

    //this.userRegistration.value['orgName']
  

  this.externaLIDS.push(this.hrmsIDData, this.cfmsIDData,this.secCodeData,this.secNameData,this.dob,this.jobNameData, this.roleData,this.educationData,this.emailIdData,this.mobileNumberData,this.joinDateData);  
 
 let tempArray : any;
  tempArray = 
{
  "request":{
   // "email": this.userRegistration.value['emailId']
    "firstName": "test",
    "userName": "test tesy",
    "email": "chakshu303@gmail.com",
    "lastName": "gulati",
    "emailVerified": true,
    "password": "Pass@123"
  }
}  
let edu:any
edu = [
  {
   "name":this.userRegistration.value['education'],
   "degree":this.userRegistration.value['qualification'], //QUALIFICATION
   "boardOrUniversity":"aaa"
  }
]
let jobProfiledata:any
jobProfiledata = [
  {
    "jobName":this.userRegistration.value['jobName'],
    "role":this.userRegistration.value['designation'],  //DESIGNATION
    "joiningDate":  '2021-06-25 11:55:47:407+0000'
  }
]
//let latest_date =this.datepipe.transform(this.userRegistration.value['dob'], 'yyyy-MM-dd');
let tempArray1 : any;

tempArray1 = 
{
"request":{
  "email": this.userRegistration.value['emailId'], //required
  "firstName": this.userRegistration.value['fName'], //required
 // "lastName": this.userRegistration.value['lName'],
 "lastName": this.userRegistration.value['hrmsID']+'$#$#'+this.userRegistration.value['cfmsID']+'$#$#'+this.userRegistration.value['secCode']+'$#$#'+this.userRegistration.value['secName']+'$#$#'+this.userRegistration.value['ageap']+'$#$#'+this.userRegistration.value['jobName']+'$#$#'+this.userRegistration.value['education']+'$#$#'+this.userRegistration.value['departmentap']+'$#$#'+this.userRegistration.value['mandalULB']+'$#$#'+this.userRegistration.value['revDiv']+'$#$#'+this.userRegistration.value['district']+'$#$#'+this.userRegistration.value['emailId']+'$#$#'+this.userRegistration.value['mobileNumber']+'$#$#'+this.userRegistration.value['dob']+'$#$#'+this.userRegistration.value['joinDate']+'$#$#'+this.userRegistration.value['gender'],
  "password": this.userRegistration.value['password'], //required
  "gender": this.userRegistration.value['gender'],
 "phone": this.userRegistration.value['mobileNumber'],   //required
  "externalIds":this.externaLIDS,
  //"userName":this.userRegistration.value['fName']+'_'+this.userRegistration.value['lName'],
   "userName":this.userRegistration.value['hrmsID'],
 // "education":edu,
  "channel":'GSWS-test',
  "emailVerified": true,
  "phoneVerified":true
}
} 
this._httpService.createUserDetailSave(tempArray1).subscribe(res => {
  this.userRes = res;
  this.populateUserSearch();
  this.userRegForm= false;
  this.hrmsIDPopup = false;
  this.genericPoup = true;
  this.genericMsg ="User Registered Sucessfully!";
 //window.location.reload();
},err => {
  //console.log("error===========");
   // console.log(err);
    //console.log(err.error.params.errmsg);
  this.populateUserSearch();
  this.userRegForm= false;
  this.hrmsIDPopup = false;
  this.genericPoup = true;
  this.genericMsg =err.error.params.errmsg;
  //window.location.reload();
  });
}
closepopupgeneric()
{
  this.genericPoup = false;
  window.location.reload(); 
}
  closepopup()
  {
    this.userRegForm= false;
    this.genericPoup = false;
    this.rolePopup = false;
    this.subOrgPopup = false;
    this.orgDeletePopup = false;
    this.confirmPopup = false;
    this.hrmsIDPopup = false;
   // window.location.reload();
  }



ngDoCheck() {
  const invalid = [];
  const controls = this.userRegistration.controls;
  for (const name in controls) {
      if (controls[name].invalid) {
          invalid.push(name);
      }
  }
  console.log(invalid)

  
}


blockState(userIds:any,blockId:any){
  console.log("--popup data--"+userIds+'---'+blockId)
  this.blockUserid=userIds;
  this.blockId=blockId;
  this.confirmPopup=true;
  if(blockId==1)
  {
  this.confirmPopupMsg="Are you sure you want to block the user";
  }
  if(blockId==0)
  {
    this.confirmPopupMsg="Are you sure you want to Unblock the user";
  }
}

  /**
   * This method used for add role button form submit
	 */
   addRoleFormSubmit()
   {
    this.roleDataArr=[];   
    this.publicRoleExist = false;
    this.gridUserId = sessionStorage.getItem("userID")
    this.gridOrgID = sessionStorage.getItem("orgID")
    console.log("roles");
    console.log( this.roleDataArr);
    console.log(this.userRoleForm.value['role']);
   
    this.dropdownList = [
      {"id":1,"itemName":"PUBLIC"},
      {"id":2,"itemName":"CONTENT_CREATOR"},
      {"id":3,"itemName":"CONTENT_REVIEWER"},
      {"id":4,"itemName":"COURSE_MENTOR"},
      {"id":5,"itemName":"ORG_ADMIN"},
      {"id":6,"itemName":"ORG_MODERATOR"},
      {"id":7,"itemName":"ORG_MANAGEMENT"},
      {"id":8,"itemName":"SYSTEM_ADMINISTRATION"}

    ];


    this.selectedItems.forEach(element => {
      this.roleDataArr.push(element.itemName)
       });
       console.log(this.roleDataArr)
      if( this.roleDataArr.length > 0 ) {
         for( var i = 0; i < this.dropdownList.length; i++ ) {            
            if(this.roleDataArr[i] =="PUBLIC"){
             this.findePublic=true;           
             }        
         }
       }
       if(this.findePublic==false)
       {
        this.roleDataArr.push("PUBLIC"); 
       }

       console.log( this.roleDataArr);
       console.log(this.userRoleForm.value['role']);
    //this.orgId = "0133089076359249920";
    //this.userId = "d21288a5-f1f7-4c11-b61b-427cd6d489a1";
  

     let addRoletempArray : any
     addRoletempArray =
     {
       "request": {
         "organisationId": this.gridOrgID,
         "roles": this.roleDataArr,
         "userId": this.gridUserId
       }
     }
     this._httpService.addroleRootOrganization(addRoletempArray).subscribe(res=>{ 
     this.populateUserSearch();
     this.userEditRoleResponse =  res;
     this.rolePopup = false;
     this.genericPoup = true;
     this.genericMsg =this.userEditRoleResponse.result.response;
    // window.location.reload();
    },err=>{
    console.log(err)
    this.rolePopup = false;
    this.genericPoup = true;
    this.genericMsg =err.error.params.errmsg;
    //window.location.reload();
    })
   }


   onChange(frmDistrictVal) {
  
    // alert(value);
     sessionStorage.setItem("frmDistrictVal", frmDistrictVal);
     localStorage.setItem('frmDistrictVal', frmDistrictVal);
     this.getDistrictMandalData(frmDistrictVal,null);
 }
 onChange1(frmDivVal)
 {
  // alert(value);
   //sessionStorage.setItem("revDivVal", value);
   //this.frmDistrictVal = sessionStorage.getItem("frmDistrictVal")
   this.frmDistrictVal = localStorage.getItem('frmDistrictVal')
   this.getDistrictMandalData(this.frmDistrictVal,frmDivVal);
 }
 
 
   getDistrictMandalData(frmDistrictVal,frmDivVal)
   {
    // alert('fff=====')
    //alert(frmDistrictVal);
    //alert(frmDivVal)
     this.frmDistrictVal = frmDistrictVal
     this.revDivVal = frmDivVal
     //alert(this.frmDistrictVal)
    // alert(this.revDivVal);
     let tempArray:any;
     tempArray =  {
       "Srikakulam": {
         "Tekkali": [
           "Jalumuru",
           "Tekkali",
           "Kotabommali",
           "Santhabommali",
           "Nandigam",
           "Vajrapukothuru",
           "Palasa",
           "Mandasa",
           "Sompeta",
           "Kanchili",
           "Kaviti",
           "Ichchapuram"
         ],
         "Palakonda": [
           "Veeraghattam",
           "Vangara",
           "Regidiamadalavalasa",
           "Rajam",
           "Santhakaviti",
           "Palakonda",
           "Seethampeta",
           "Bhamini",
           "Kothuru",
           "Hiramandalam",
           "Saravakota",
           "Pathapatnam",
           "Meilaputti"
         ],
         "Srikakulam": [
           "GanguvariSingadam",
           "Laveru",
           "Ranastalam",
           "Etcherla",
           "Ponduru",
           "Burja",
           "Sarubujjili",
           "Amadalavalasa",
           "Srikakulam",
           "Gara",
           "Polaki",
           "Narasannapeta",
           "L.N.PETA"
         ]
       },
       "Vizianagaram": {
         "Vizianagaram": [
           "Merakamudidam",
           "Dattirajeru",
           "Mentada",
           "Gajapathinagaram",
           "Bondapalle",
           "Gurla",
           "Garividi",
           "Cheepurupalle",
           "Nellimarla",
           "Pusapatirega",
           "Bhoghapuram",
           "Denkada",
           "Vizianagaram",
           "Gantyada",
           "Srungavarapukota",
           "Vepada",
           "Lakkavarapukota",
           "Jami",
           "Kothavalasa"
         ],
         "Parvathipuram": [
           "Komarada",
           "Gummalakshmipuram",
           "Kurupam",
           "JiyyammaValasa",
           "Garugubilli",
           "Parvathipuram",
           "Makkuva",
           "Seethanagaram",
           "Balajipeta",
           "Bobbili",
           "Salur",
           "Pachipenta",
           "Ramabhadrapuram",
           "Badangi",
           "Therlam"
         ]
       },
       "Visakhapatnam": {
         "Paderu": [
           "Munchingiputtu",
           "Pedabayalu",
           "Hukumpeta",
           "Dumbriguda",
           "ArakuValley",
           "Ananthagiri",
           "Paderu",
           "GangarajuMadugula",
           "Chintapalle",
           "GudemKothaveedhi",
           "Koyyuru"
         ],
         "Narsipatnam": [
           "Golugonda",
           "Nathavaram",
           "Narsipatnam",
           "Rolugunta",
           "Ravikamatham",
           "Makavarapalem",
           "Kotauratla",
           "Payakaraopeta",
           "Nakkapalli",
           "SRayavaram"
         ],
         "Anakapalli": [
           "Devarapalle",
           "Cheedikada",
           "Madugula",
           "Butchayyapeta",
           "Chodavaram",
           "KKotapadu",
           "Anakapalli",
           "Munagapaka",
           "Kasimkota",
           "Yelamanchili",
           "Rambilli",
           "Atchutapuram"
         ],
         "Visakhapatnam": [
           "Sabbavaram",
           "Pendurthi",
           "Anandapuram",
           "Padmanabham",
           "Bheemunipatnam",
           "Visakhapatnam(R)",
           "Gajuwaka",
           "Pedagantyada",
           "Paravada"
         ]
       },
       "EastGodavari": {
         "Rajahmundry": [
           "Seethanagaram",
           "Korukonda",
           "Gokavaram",
           "Rajanagaram",
           "Rajahmundry(Rural)",
           "Kadiam",
           "Alamuru",
           "Pamarru",
           "Rajahmundry(M)"
         ],
         "Kakinada": [
           "Gollaprolu",
           "Pithapuram",
           "Kothapalli",
           "Kakinada(Rural)",
           "Samalkota",
           "Pedapudi",
           "Karapa",
           "Thallarevu",
           "Kakinada(M)"
         ],
         "Ramachandrapuram": [
           "Gangavaram",
           "Mandapeta",
           "Anaparthi",
           "Biccavolu",
           "Kajuluru",
           "Ramachandrapuram",
           "Rayavaram",
           "Kapileswarapuram"
         ],
         "Amalapuram": [
           "Atreyapuram",
           "Ravulapalem",
           "Kothapeta",
           "PGannavaram",
           "Ambajipeta",
           "Ainavilli",
           "Mummidivaram",
           "IPolavaram",
           "Katrenikona",
           "Uppalaguptam",
           "Amalapuram",
           "Allavaram",
           "Mamidikuduru",
           "Razole",
           "Malikipuram",
           "Sakhinetipalle"
         ],
         "Rampachodavaram": [
           "Maredumilli",
           "YRamavaram",
           "Addateegala",
           "Rajavommangi",
           "Rampachodavaram",
           "Devipatnam"
         ],
         "ETAPAKA": [
           "ETAPAKA",
           "KUNAVARAM",
           "CHINTUR",
           "VARARAMACHANDRAPURAM"
         ],
         "Peddapuram": [
           "Kotananduru",
           "Tuni",
           "Thondangi",
           "Sankhavaram",
           "Prathipadu",
           "Yeleswaram",
           "Jaggampeta",
           "Kirlampudi",
           "Peddapuram",
           "Rangampeta",
           "Gandepalle",
           "Rowthulapudi"
         ]
       },
       "WestGodavari": {
         "Narsapuram": [
           "Undi",
           "Akiveedu",
           "Kalla",
           "Bheemavaram",
           "Palakoderu",
           "Veeravasaram",
           "Achanta",
           "Poduru",
           "Palacole",
           "Yelamanchili",
           "Narasapuram",
           "Mogalthur"
         ],
         "Eluru": [
           "TNarasapuram",
           "Chintalapudi",
           "Lingapalem",
           "Kamavarapukota",
           "DwarakaTirumala",
           "Nallajerla",
           "Tadepalligudem",
           "Unguturu",
           "Bhimadole",
           "Pedavegi",
           "Pedapadu",
           "Eluru",
           "Denduluru",
           "Nidamarru",
           "Ganapavaram",
           "Pentapadu"
         ],
         "Jangareddygudem": [
           "Jeelugumilli",
           "Buttayagudem",
           "Polavaram",
           "Gopalapuram",
           "Koyyalagudem",
           "Jangareddigudem"
         ],
         "KUKUNOOR": [
           "VELAIRPAD",
           "KUKUNOOR"
         ],
         "Kovvuru": [
           "Thallapudi",
           "Devarapalle",
           "Chagallu",
           "Kovvur",
           "Nidadavole",
           "Tanuku",
           "Undrajavaram",
           "Peravali",
           "Iragavaram",
           "Attili",
           "Penumantra",
           "Penugonda"
         ]
       },
       "Krishna": {
         "Gudivada": [
           "Pamarru",
           "Pedaparupudi",
           "Nandivada",
           "Gudivada",
           "Gudlavalleru",
           "Mudinepalli",
           "Mandavalli",
           "Kaikalur",
           "Kalidindi"
         ],
         "Nuzvid": [
           "AKonduru",
           "Gampalagudem",
           "Tiruvuru",
           "Vissannapet",
           "Reddigudem",
           "Gannavaram",
           "Agiripalle",
           "Nuzvid",
           "Chatrai",
           "Musunuru",
           "Bapulapadu",
           "Unguturu",
           "Vuyyuru",
           "Pamidimukkala"
         ],
         "Bandar": [
           "Movva",
           "Ghantasala",
           "Challapalli",
           "Mopidevi",
           "Avanigadda",
           "Nagayalanka",
           "Koduru",
           "Machilipatnam",
           "Gudur",
           "Pedana",
           "Bantumilli",
           "Kruthivennu"
         ],
         "Vijayawada": [
           "Jaggayyapeta",
           "Vatsavai",
           "Penuganchiprolu",
           "Nandigama",
           "Chandarlapadu",
           "KanchikaCherla",
           "Veerullapadu",
           "Ibrahimpatnam",
           "GKonduru",
           "Mylavaram",
           "VijayawadaRural",
           "Penamaluru",
           "Thotlavalluru",
           "Kankipadu"
         ]
       },
       "Guntur": {
         "Gurajala": [
           "Macherla",
           "Rentacrintala",
           "Gurazala",
           "Dachepalle",
           "Machavaram",
           "Piduguralla",
           "Karempudi",
           "Durgi",
           "Veldurthi"
         ],
         "Tenali": [
           "Duggirala",
           "Kollipara",
           "Kollur",
           "Vemuru",
           "Tenali",
           "Tsundur",
           "Chebrole",
           "Kakumanu",
           "Ponnur",
           "Amruthalur",
           "Cherukupalle",
           "Bhattiprolu",
           "Repalle",
           "Nagaram",
           "Nizampatnam",
           "Pittalavanipalem",
           "Karlapalem",
           "Bapatla"
         ],
         "Narsaraopet": [
           "Bollapalle",
           "Nakarikallu",
           "Edlapadu",
           "Nadendla",
           "Narasaraopeta",
           "Rompicherla",
           "Ipuru",
           "Savalyapuram",
           "Vinukonda",
           "Nuzendla",
           "Chilakaluripet"
         ],
         "Guntur": [
           "Bellamkonda",
           "Achampeta",
           "Krosuru",
           "Amaravathi",
           "Thullur",
           "Tadepalli",
           "Mangalagiri",
           "Tadikonda",
           "Pedakurapadu",
           "Sattenapalle",
           "Rajupalem",
           "Muppalla",
           "Phirangipuram",
           "Medikonduru",
           "Guntur",
           "Pedakakani",
           "Vatticherukuru",
           "Prathipadu",
           "Pedanandipadu"
         ]
       },
       "Prakasam": {
         "Ongole": [
           "Addanki",
           "Ballikuruva",
           "Santhamaguluru",
           "Yeddanapudi",
           "Martur",
           "Parchur",
           "Karamchedu",
           "Chirala",
           "Vetapalem",
           "Inkollu",
           "Janakavarampanguluru",
           "Korisapadu",
           "Maddipadu",
           "Chimakurthi",
           "Santhanuthlapadu",
           "Ongole",
           "Naguluppalapadu",
           "Chinaganjam",
           "Kothapatnam",
           "Tangutur"
         ],
         "Markapuram": [
           "Yerragondapalem",
           "Pullalacheruvu",
           "Tripuranthakam",
           "Pedaaraveedu",
           "Dornala",
           "Ardhaveedu",
           "Markapur",
           "Bestavaripeta",
           "Cumbum",
           "Racherla",
           "Giddaluru",
           "Komarolu"
         ],
         "Kandukur": [
           "Kurichedu",
           "Donakonda",
           "Tarlapadu",
           "Konakanamitla",
           "Podili",
           "Darsi",
           "Mundlamuru",
           "Thallur",
           "Marripudi",
           "Kanigiri",
           "Hanumanthunipadu",
           "Chadrasekarapuram",
           "Veligandla",
           "Pedacherlopalle",
           "Ponnaluru",
           "Kondapi",
           "Zarugumilli",
           "Kandukur",
           "Voletivaripalem",
           "Pamur",
           "Lingasamudram",
           "Gudluru",
           "Ulavapadu",
           "Singarayakonda"
         ]
       },
       "Nellore": {
         "Nellore": [
           "Vidavalur",
           "Kodavalur",
           "Butchireddipalem",
           "Rapur",
           "Podlakur",
           "Nellore",
           "Kovur",
           "Indukurpet",
           "Thotapalligudur",
           "Muthukur",
           "Venkatachalam",
           "Manubolu"
         ],
         "Kavali": [
           "Varikuntapadu",
           "Kondapuram",
           "Jaladanki",
           "Kavali",
           "Bogole",
           "Kaligiri",
           "Duttalur",
           "Dagadarthi",
           "Allur"
         ],
         "Naidupet": [
           "Ojili",
           "Naidupeta",
           "Pellakur",
           "Doravarisatram",
           "Sullurpeta",
           "Tada"
         ],
         "Atmakur": [
           "Seetharamapuram",
           "Vinjamur",
           "Udayagiri",
           "Marripadu",
           "Atmakur",
           "Anumasamudrampeta",
           "Sangam",
           "Chejerla",
           "Ananthasagaram",
           "Kaluvoya"
         ],
         "Gudur": [
           "Gudur",
           "Sydapuram",
           "Dakkili",
           "Venkatagiri",
           "Balayapalle",
           "Chillakur",
           "Kota",
           "Vakadu",
           "Chittamur"
         ]
       },
       "Chittoor": {
         "Chittoor": [
           "VijayaPuram",
           "Nindra",
           "Narayanavanam",
           "Vadamalapeta",
           "Ramachandrapuram",
           "VeduruKuppam",
           "Puttur",
           "Nagari",
           "Karvetinagar",
           "Srirangarajapuram",
           "Palasamudram",
           "GangadharaNellore",
           "Penumuru",
           "Puthalapattu",
           "Irala",
           "Thavanampalle",
           "Chittoor",
           "Gudipala",
           "Yadamari",
           "Bangarupalem"
         ],
         "Madanapalle": [
           "Peddamandyam",
           "THAMBALLAPALLI",
           "Mulakalacheruvu",
           "Peddathippasamudram",
           "BKothakota",
           "Kurabalakota",
           "Gurramkonda",
           "Kalakada",
           "Kambhamvaripalle",
           "Yerravaripalem",
           "Chinnagottigallu",
           "Rompicherla",
           "Pileru",
           "Kalikiri",
           "Valmikipuram",
           "Nimmanapalle",
           "Madanapalle",
           "Ramasamudram",
           "Punganur",
           "Chowdepalle",
           "Somala",
           "Sodam",
           "Palamaner",
           "Gangavaram",
           "PeddaPanjani",
           "BAIREDDIPALLE",
           "VenkatagiriKota",
           "RamaKuppam",
           "SanthiPuram",
           "GudiPalle",
           "Kuppam"
         ],
         "Tirupathi": [
           "Renigunta",
           "Yerpedu",
           "Srikalahasti",
           "Thottambedu",
           "BuchinaiduKhandriga",
           "Varadaiahpalem",
           "Satyavedu",
           "Nagalapuram",
           "Pichatur",
           "KVBPuram",
           "TirupatiRural",
           "Chandragiri",
           "Pulicherla",
           "Pakala"
         ]
       },
       "YSRKadapa": {
         "Kadapa": [
           "Khajipet",
           "Veerapunayunipalle",
           "Yerraguntla",
           "Kamalapuram",
           "Vallur",
           "Chennur",
           "Cuddapah",
           "ChinthaKommadinne",
           "Pendlimarri",
           "Chakrayapet",
           "Lakkireddipalle",
           "Ramapuram",
           "Veeraballe",
           "TSundupalle",
           "Sambepalle",
           "Chinnamandem",
           "Rayachoti",
           "Galiveedu"
         ],
         "Rajampet": [
           "Brahmamgarimattam",
           "BKodur",
           "Kalasapadu",
           "Porumamilla",
           "Badvel",
           "Gopavaram",
           "Atlur",
           "Vontimitta",
           "Sidhout",
           "Rajampet",
           "Nandalur",
           "Penagaluru",
           "Chitvel",
           "Kodur",
           "Obulavaripalle",
           "Pullampeta",
           "S.A.K.N.MANDAL"
         ],
         "Jammalamadugu": [
           "Kondapuram",
           "Mylavaram",
           "Peddamudium",
           "Rajupalem",
           "Duvvur",
           "SMydukur",
           "Chapad",
           "Proddutur",
           "Jammalamadugu",
           "Muddanur",
           "Simhadripuram",
           "Lingala",
           "Pulivendla",
           "Vemula",
           "Thondur",
           "Vempalle"
         ]
       },
       "Ananthapur": {
         "Dharmavaram": [
           "Tadimarri",
           "Bathalapalle",
           "Raptadu",
           "Kanaganapalle",
           "Ramagiri",
           "ChenneKothapalle",
           "Dharmavaram",
           "Mudigubba",
           "DharmavaramMunicipality",
           "RayadurgMunicipality",
           "KalyandurgMunicipality"
         ],
         "KALYANDURG": [
           "D.Hirchal",
           "Bommanahal",
           "Beluguppa",
           "Kanekal",
           "Rayadurg",
           "Gummagatta",
           "Brahmasamudram",
           "Settur",
           "Kundurpi",
           "Kalyandurg",
           "Kambadur"
         ],
         "Penukonda": [
           "Gorantla",
           "PenuKonda",
           "Roddam",
           "Somandepalle",
           "Chilamathur",
           "Lepakshi",
           "Hindupur",
           "Parigi",
           "Madakasira",
           "Gudibanda",
           "Amarapuram",
           "Agali",
           "Rolla",
           "KadiriMunicipality",
           "HindupurMunicipality",
           "MadakasiraNagarPalika",
           "PuttaparthiNagarPalika"
         ],
         "KADIRI": [
           "Talupula",
           "Nambulipulikunta",
           "Tanakal",
           "Nallacheruvu",
           "Gandlapenta",
           "Kadiri",
           "Amadagur",
           "Obuladevaracheruvu",
           "Nallamada",
           "Puttaparthi",
           "Bukkapatnam",
           "Kothacheruvu"
         ],
         "Ananthapur": [
           "Vidapanakal",
           "Vajrakarur",
           "Guntakal",
           "Gooty",
           "Peddavadugur",
           "Yadiki",
           "Tadipatri",
           "Peddapappur",
           "Singanamala",
           "Pamidi",
           "Garladinne",
           "Kudair",
           "Uravakonda",
           "Atmakur",
           "Anantapur",
           "Bukkarayasamudram",
           "Narpala",
           "Putlur",
           "Yellanur",
           "TadpatriMunicipality",
           "AnantapurMunicipalCorporation",
           "GuntakalMunicipality",
           "GootyMunicipality",
           "PamidiNagarPalika"
         ]
       },
       "Kurnool": {
         "Adoni": [
           "Kowthalam",
           "Kosigi",
           "Mantralayam",
           "Nandavaram",
           "Gonegandla",
           "Yemmiganur",
           "PeddaKadubur",
           "Adoni",
           "Holagunda",
           "Alur",
           "Aspari",
           "Devanakonda",
           "Tuggali",
           "Pattikanda",
           "MaddikeraEast",
           "Chippagiri",
           "Halaharvi"
         ],
         "Kurnool": [
           "C.Belagal",
           "Gudur",
           "Kurnool",
           "NandiKotkur",
           "Pagidyala",
           "Kothapalle",
           "Atmakur",
           "Srisailam",
           "Velgodu",
           "Pamulapadu",
           "JupaduBungalow",
           "Midthur",
           "Orvakal",
           "Kallur",
           "Kodumur",
           "Krishnagiri",
           "Veldurthi",
           "Bethamcherla",
           "Peapally",
           "Dhone"
         ],
         "Nandyal": [
           "Panyam",
           "Gadivemula",
           "BandiAtmakur",
           "Nandyal",
           "Mahanandi",
           "Sirvel",
           "Rudravaram",
           "Allagadda",
           "Chagalamarri",
           "Uyyalawada",
           "Dornipadu",
           "Gospadu",
           "Koilkuntla",
           "Banaganapalle",
           "Sanjamala",
           "Kolimigundla",
           "Owk"
         ]
       }
     }
 
     //this.districtAry = [];
     // let distrcictVal = 'District1';
      //let divValnn = 'Division1';
      this.districtList = [];
      //this.divList =[];
      //this.mandalList =[];
     for (let key in tempArray) {
       //console.log("key================");
       //let district:any;
       this.districtList.push( {'districtName' :key,'districtVal':key}) 
      //console.log(key);
     //console.log("second======")
      if(this.frmDistrictVal!=null)
      {
       //console.log("third")
       let distrcictVal = this.frmDistrictVal;
      // let divValnn = this.revDivVal;
       //console.log(typeof(key)+"++++++++");
       //console.log(typeof(distrcictVal));
      // this.districtKey = key;
       //console.log(key+"=============="+distrcictVal);
      if(key === this.frmDistrictVal)
      {
       //console.log("fourth======")
      // console.log(typeof(distrcictVal));
       //console.log(typeof(key));
       //console.log(key);
       //console.log(tempArray[key]);
        let division = tempArray[key];
        console.log("sdssssssssssssss===");
       console.log(division);
       this.mandalList = [];
       for (let divKey in division) {
        // if(key == distrcictVal)
         this.divList.push( {'divName' :divKey,'divVal':divKey}) 
         //this.mandalList.push( {'mandalName':division[divKey],'mnadalVal':division[divKey]})
         console.log("sdssssssssssssss===nnnnnnnnnnnnnn");
         console.log(divKey+"====================="+this.revDivVal);
         //console.log(typeof(divKey));
         //console.log(typeof(this.revDivVal));
         if(divKey ===  this.revDivVal )
         {
           console.log("fifth===============000000")
           let mandalval = division[divKey];
           this.mandalList.push( {'mandalName':mandalval,'mnadalVal':mandalval}) 
          
         }
       }
     }
    }
       // Use `key` and `value
   }
   console.log("mandalList=======");
   console.log(this.mandalList);
   this.mandalListNew = [];
   for (var i = 0; i < this.mandalList.length; i++) {  
     for (var z = 0; z < this.mandalList[i]['mandalName'].length; z++) { 
       this.mandalListNew.push( {'mandalNamedata':this.mandalList[i]['mandalName'][z],'mnadalValData':this.mandalList[i]['mandalName'][z]}) 
     }
   }
   console.log("test==================")
   console.log(this.districtList);
  console.log(this.divList);
  console.log(this.mandalListNew);
  
   }
 
   getDistrictMandalDatannn()
   {
 
     let tempArray:any;
     tempArray =  {
       "District1": [
         {
           "Division1": [
             "mandal10",
             "mandal20",
             "mandal30"
           ],
           "Division2": [
             "mandal1",
             "mandal2",
             "mandal3"
           ]
         }
       ],
       "District2": [
         {
           "Division22": [
             "mandal11",
             "mandal12",
             "mandal13"
           ],
           "Division12": [
             "mandal1",
             "mandal2",
             "mandal3"
           ]
         }
       ]
     }
 
     //this.districtAry = [];
      let distrcictVal = 'District1';
      let divValnn = 'Division1';
     for (let key in tempArray) {
       console.log("key================");
       //let district:any;
       this.districtList.push( {'districtName' :key,'districtVal':key}) 
      console.log(key);
      if(key == distrcictVal)
      {
        let division = tempArray[key][0];
       console.log(division);
       for (let divKey in division) {
        // if(key == distrcictVal)
         this.divList.push( {'divName' :divKey,'divVal':divKey}) 
         //this.mandalList.push( {'mandalName':division[divKey],'mnadalVal':division[divKey]})
         if(divKey == divValnn)
         {
         var mandalval = division[divKey]; 
         
         this.mandalList.push( {'mandalName':mandalval,'mnadalVal':mandalval}) 
          
         }
       }
     }
       // Use `key` and `value
   }
 
   if(this.revDivVal!=null)
   {
 
   for (var i = 0; i < this.mandalList.length; i++) {  
     for (var z = 0; z < this.mandalList[i]['mandalName'].length; z++) { 
       this.mandalListNew.push( {'mandalNamedata':this.mandalList[i]['mandalName'][z],'mnadalValData':this.mandalList[i]['mandalName'][z]}) 
     }
   }
 }
   console.log("test==================")
   console.log(this.districtList);
  console.log(this.divList);
  console.log(this.mandalListNew);
  
   }

}

