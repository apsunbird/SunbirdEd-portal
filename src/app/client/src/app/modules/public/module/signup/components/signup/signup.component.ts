import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import {
  ResourceService,
  ConfigService,
  ServerResponse,
  ToasterService,
  NavigationHelperService,
  UtilService,
  RecaptchaService
} from '@sunbird/shared';
import { SignupService } from './../../services';
import { TenantService, TncService } from '@sunbird/core';
import { TelemetryService } from '@sunbird/telemetry';
import * as _ from 'lodash-es';
import { IStartEventInput, IImpressionEventInput, IInteractEventEdata } from '@sunbird/telemetry';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ActivatedRoute } from '@angular/router';
import { RecaptchaComponent } from 'ng-recaptcha';

import { ValidationserviceService } from '../../../../../shared/regex/validationservice.service';
import { ConfirmedValidator } from '../../../../../public/js/confirmed.validator';
import { RegistrationService } from '../../../../../public/services/registration/registration.service';
import { HttpClient} from '@angular/common/http';
import { Location } from '@angular/common'
//import { ValidationserviceService } from 'src/app/modules/shared/regex/validationservice.service';
//import { ConfirmedValidator } from 'src/app/modules/public/js/confirmed.validator';



@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('captchaRef', {static: false}) captchaRef: RecaptchaComponent;
  public unsubscribe = new Subject<void>();
  signUpForm: FormGroup;
  sbFormBuilder: FormBuilder;
  showContact = 'phone';
  disableSubmitBtn = true;
  disableForm = true;
  showPassword = false;
  captchaResponse = '';
  googleCaptchaSiteKey: string;
  showSignUpForm = true;
  showUniqueError = '';
  tenantDataSubscription: Subscription;
  logo: string;
  tenantName: string;
  resourceDataSubscription: any;
  telemetryStart: IStartEventInput;
  telemetryImpression: IImpressionEventInput;
  submitInteractEdata: IInteractEventEdata;
  telemetryCdata: Array<{}>;
  instance: string;
  tncLatestVersion: string;
  termsAndConditionLink: string;
  passwordError: string;
  showTncPopup = false;
  birthYearOptions: Array<number> = [];
  isMinor: Boolean = false;
  formInputType: string;
  isP1CaptchaEnabled: any;


  hrmsIDPopup:boolean=true;
  userHrmsIdForm: FormGroup;
  hrmsData: any;
  genericPoup: boolean;
  genericMsg: string;
  userRegForm: boolean;
  userRegistration: FormGroup;
  orgNameList: any;
  userRes: any;
  externaLIDS: any;
  hrmsIDData: { id: any; idType: string; provider: string; operation:string; };
  cfmsIDData: { id: any; idType: string; provider: string; operation:string; };
  secCodeData: { id: any; idType: string; provider: string;  operation:string;};
  secNameData: { id: any; idType: string; provider: string; operation:string;};
  dob: { id: any; idType: string; provider: string; operation:string;};
  jobNameData: { id: any; idType: string; provider: string; operation:string;};
  roleData: { id: any; idType: string; provider: string; operation:string;};
  gender: { name: string; option: string; }[];
  educationData: { id: any; idType: string; provider: string; operation: string; };
  qualificationData: { id: any; idType: string; provider: string; operation: string; };
  emailIdData: { id: any; idType: string; provider: string; operation: string; };
  mobileNumberData: { id: any; idType: string; provider: string; operation: string; };
  disabledMobile: boolean;
  editMobile: boolean=false;
  editName: boolean=false;
  //hrmsIdData: boolean;
  genderData: boolean=false;
  cfmsID: boolean=false;
  SECRETARIAT_NAME: boolean;
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
  emailIdDataCheck: boolean=false;
  hrmsIdDataCheck: boolean=false;
  
  


  constructor(formBuilder: FormBuilder, public resourceService: ResourceService,
    public signupService: SignupService, public toasterService: ToasterService,
    public tenantService: TenantService, public deviceDetectorService: DeviceDetectorService,
    public activatedRoute: ActivatedRoute, public telemetryService: TelemetryService,
    public navigationhelperService: NavigationHelperService, public utilService: UtilService,
    public configService: ConfigService,  public recaptchaService: RecaptchaService,
    public tncService: TncService,private fb: FormBuilder,private http: HttpClient,private _validation:ValidationserviceService,private _httpService:RegistrationService,private location: Location) {
    this.sbFormBuilder = formBuilder;
  }

  ngOnInit() {

    

    this.userHrmsIdForm = this.fb.group({
      addHrmsId: new FormControl(null,Validators.required)
    })


    //this.gender = [{name:'Male',option:'Male'},{name:'Female',option:'Female'}]

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




    this.readOrgData();

    this.getDistrictMandalData(null,null);





    this.tncService.getTncConfig().subscribe((data: ServerResponse) => {
      this.telemetryLogEvents('fetch-terms-condition', true);
        const response = _.get(data, 'result.response.value');
        if (response) {
          try {
            const tncConfig = this.utilService.parseJson(response);
            this.tncLatestVersion = _.get(tncConfig, 'latestVersion') || {};
            this.termsAndConditionLink = tncConfig[this.tncLatestVersion].url;
          } catch (e) {
            this.toasterService.error(_.get(this.resourceService, 'messages.fmsg.m0004'));
          }
        }
      }, (err) => {
      this.telemetryLogEvents('fetch-terms-condition', false);
        this.toasterService.error(_.get(this.resourceService, 'messages.fmsg.m0004'));
      }
    );
    this.instance = _.upperCase(this.resourceService.instance || 'SUNBIRD');
    this.tenantDataSubscription = this.tenantService.tenantData$.subscribe(
      data => {
        if (data && !data.err) {
          this.logo = data.tenantData.logo;
          this.tenantName = data.tenantData.titleName;
        }
      }
    );

    try {
      this.googleCaptchaSiteKey = (<HTMLInputElement>document.getElementById('googleCaptchaSiteKey')).value;
    } catch (error) {
      this.googleCaptchaSiteKey = '';
    }
    this.initializeFormFields();
    this.setInteractEventData();

    // Telemetry Start
    this.signUpTelemetryStart();

    this.initiateYearSelecter();
    // disabling the form as age should be selected
    this.signUpForm.disable();
    this.isP1CaptchaEnabled = (<HTMLInputElement>document.getElementById('p1reCaptchaEnabled'))
      ? (<HTMLInputElement>document.getElementById('p1reCaptchaEnabled')).value : 'true';


     // this.gethrmsData();
  }


 hrmsIdSubmit(){
    let data:any;
    data= {
      "HRMS_ID":this.userHrmsIdForm.value['addHrmsId'],
      "KEY":'F5FC9F4A7EEDF37C93FFBDCFB34C5D1829984C5B3A6FDB3B95457CD324'
      }
    this.http.post('https://apgsws.in/learner/user/v1/gethrmsData?HRMS_ID='+this.userHrmsIdForm.value['addHrmsId'], data).subscribe(res => {
      console.log(res);
      console.log(res['status']);
    
     if(res['status']==true)
     {
     this.userRegForm = true;
     this.genericPoup = false;
     this.hrmsIDPopup = false;

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
      'MOBILE':res['result'][0]['MOBILE']!=null ? res['result'][0]['MOBILE'] : '',
      'EMP_MAIL_ID':res['result'][0]['EMP_MAIL_ID']!=null ? res['result'][0]['EMP_MAIL_ID']: '',
      'EMP_NAME':res['result'][0]['EMP_NAME']!=null ? res['result'][0]['EMP_NAME']: '',
      'GENDER':res['result'][0]['GENDER']!=null ? res['result'][0]['GENDER']: '',
      'QUALIFICATION':res['result'][0]['QUALIFICATION']!=null ? res['result'][0]['QUALIFICATION']: '',
      'DESIGNATION':res['result'][0]['DESIGNATION']!=null ? res['result'][0]['DESIGNATION']: '',
      'DEPARTMENT':res['result'][0]['DEPARTMENT']!=null ? res['result'][0]['DEPARTMENT']: '',
      "SECRETARIAT_NAME": res['result'][0]['SECRETARIAT_NAME']!=null ? res['result'][0]['SECRETARIAT_NAME']: '',
      "SECRETARIAT_CODE": res['result'][0]['SECRETARIAT_CODE']!=null ? res['result'][0]['SECRETARIAT_CODE']: '',
      "MANDAL_NAME": res['result'][0]['MANDAL_NAME']!=null ? res['result'][0]['MANDAL_NAME']: '',
      "DISTRICT_NAME": res['result'][0]['DISTRICT_NAME']!=null ? res['result'][0]['DISTRICT_NAME']: '',
      "HRMS_ID":res['result'][0]['HRMS_ID']!=null ? res['result'][0]['HRMS_ID']: '',
      "CFMS_ID":res['result'][0]['CFMS_ID']!=null ? res['result'][0]['CFMS_ID']: ''
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

     if(this.hrmsData.HRMS_ID!=null)
     {
      // this.hrmsIdData = true;
     }
     else{
      //this.hrmsIdData = false;
     }

     if(this.hrmsData.HRMS_ID!=null)
     {
       this.hrmsIdDataCheck = true;
     }
     else{
      this.hrmsIdDataCheck = false;
     }


     if(this.hrmsData.EMP_MAIL_ID!=null)
     {
       this.emailIdDataCheck = true;
     }
     else{
      this.emailIdDataCheck = false;
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
   else if(res['status']==false)
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

  back(): void {
    this.location.back()
  }

  hrmsIdSubmit1()
  {

    console.log(this.userHrmsIdForm.value['addHrmsId'])

    const headers = { 'key': 'F5FC9F4A7EEDF37C93FFBDCFB34C5D1829984C5B3A6FDB3B95457CD324'}  
    let data:any;
    data= {
      "HRMS_ID":this.userHrmsIdForm.value['addHrmsId'],
      "KEY":'F5FC9F4A7EEDF37C93FFBDCFB34C5D1829984C5B3A6FDB3B95457CD324'
      }
    this.http.post('https://gramawardsachivalayam.ap.gov.in/GSWSAPI/api/thirdparty/GSWSHRMSDATA', data,{'headers':headers}).subscribe(res => {
      console.log(res);
      
      console.log("datat");
      console.log(res['result']);
      //console.log(res['result'][0]['DEPARTMENT']);
      if(res['Status'] == true)
      {
        this.hrmsData = res['result'];
        
        this.userRegForm = true;
        this.genericPoup = false;
        this.hrmsIDPopup = false;
        console.log('first========');




       this.hrmsData= {
          'MOBILE':'9177057488',
          'EMP_MAIL_ID':'chakshu303@gmail.com',
          'EMP_NAME':'chakshu',
          'GENDER':'Male',
          'QUALIFICATION':'B-Tech',
          'DESIGNATION':'Software Eng',
          'DEPARTMENT':'Health, Medical & Family Welfare',
          "SECRETARIAT_NAME": "KOTAVURU",
          "SECRETARIAT_CODE": "11090984",
          "MANDAL_NAME": "B KOTHAKOTA",
          "DISTRICT_NAME": "CHITTOOR",
          "AGE":"10"


        }

      /*  this.hrmsData= {
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
          "HRMS_ID":res['result'][0]['DISTRICT_NAME'],
          "CFMS_ID":res['result'][0]['CFMS_ID']
          
        }*/

        if(this.hrmsData.MOBILE!=null)
        {
          this.editMobile = true;
        }

        if(this.hrmsData.EMP_NAME!=null)
        {
          this.editName = true;
        }

        if(this.hrmsData.HRMS_ID!=null)
        {
          //this.hrmsIdData = true;
        }


        if(this.hrmsData.GENDER!=null)
        {
          this.genderData = true;
        }

        if(this.hrmsData.CFMS_ID!=null)
        {
          this.cfmsID = true;
        }

        if(this.hrmsData.SECRETARIAT_NAME!=null)
        {
          this.secName = true;
        }

        if(this.hrmsData.SECRETARIAT_CODE!=null)
        {
          this.secCode = true;
        }

        if(this.hrmsData.MANDAL_NAME!=null)
        {
          this.mandalName = true;
        }

        


        if(this.hrmsData.DISTRICT_NAME!=null)
        {
          this.districtName  = true;
        }

        if(this.hrmsData.QUALIFICATION!=null)
        {
          this.qualificationlist  = true;
        }

        if(this.hrmsData.DESIGNATION!=null)
        {
          this.designation  = true;
        }

        


        

        

        


        


        






       /* this.hrmsData= {
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
          "HRMS_ID":res['result'][0]['DISTRICT_NAME'],
          "CFMS_ID":res['result'][0]['CFMS_ID']
          
        }*/
      }
      else if(res['Status'] == false)
      {
        this.genericPoup = true;
        this.hrmsIDPopup = false;
        this.genericMsg ="Invalid HRMS ID";
        console.log('second========');
      }
      console.log("datat========");
  },err => {
    console.log("errrorrrrrr===");
    console.log(err.message);
})
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
   "lastName": '$$$$$'+this.userRegistration.value['hrmsID']+'$#$#'+this.userRegistration.value['cfmsID']+'$#$#'+this.userRegistration.value['secCode']+'$#$#'+this.userRegistration.value['secName']+'$#$#'+this.userRegistration.value['ageap']+'$#$#'+this.userRegistration.value['jobName']+'$#$#'+this.userRegistration.value['education']+'$#$#'+this.userRegistration.value['departmentap']+'$#$#'+this.userRegistration.value['mandalULB']+'$#$#'+this.userRegistration.value['revDiv']+'$#$#'+this.userRegistration.value['district']+'$#$#'+this.userRegistration.value['emailId']+'$#$#'+this.userRegistration.value['mobileNumber']+'$#$#'+this.userRegistration.value['dob']+'$#$#'+this.userRegistration.value['joinDate']+'$#$#'+this.userRegistration.value['gender'],
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
    this.userRegForm= false;
    this.hrmsIDPopup = false;
    this.genericPoup = true;
    this.genericMsg ="User Registered Sucessfully!";
  },err => {
    console.log("error===========");
      console.log(err);
      console.log(err.params);

   
    this.userRegForm= false;
    this.hrmsIDPopup = false;
    this.genericPoup = true;
    this.genericMsg =err.error.params.errmsg;

    //this.genericMsg ="User Registered Sucessfully!";
   // this.toasterService.error(_.get(this.resourceService, 'messages.fmsg.m0004'));
    });
  }
  ngDoCheck() {
    const invalid = [];
    const controls = this.userRegistration.controls;
    for (const name in controls) {
        if (controls[name].invalid) {
            invalid.push(name);
        }
    }
    console.log(invalid);
  }

  closepopup()
  {
    this.genericPoup = false;
    this.hrmsIDPopup = false;
    this.userRegForm = false;

  }


  changeBirthYear(selectedBirthYear) {
    this.signUpForm.enable();
    this.disableForm = false;
    const currentYear = new Date().getFullYear();
    const userAge = currentYear - selectedBirthYear;
    this.isMinor = userAge < this.configService.constants.SIGN_UP.MINIMUN_AGE;
  }

  initiateYearSelecter() {
    const endYear = new Date().getFullYear();
    const startYear = endYear - this.configService.constants.SIGN_UP.MAX_YEARS;
    for (let year = endYear; year > startYear; year--) {
      this.birthYearOptions.push(year);
    }
  }

  signUpTelemetryStart() {
    const deviceInfo = this.deviceDetectorService.getDeviceInfo();
    this.telemetryStart = {
      context: {
        env: this.activatedRoute.snapshot.data.telemetry.env,
        cdata: this.telemetryCdata,
      },
      edata: {
        type: this.activatedRoute.snapshot.data.telemetry.type,
        pageid: this.activatedRoute.snapshot.data.telemetry.pageid,
        mode: this.activatedRoute.snapshot.data.telemetry.mode,
        uaspec: {
          agent: deviceInfo.browser,
          ver: deviceInfo.browser_version,
          system: deviceInfo.os_version,
          platform: deviceInfo.os,
          raw: deviceInfo.userAgent
        }
      }
    };
  }

  signUpTelemetryImpression() {
    this.telemetryImpression = {
      context: {
        env: this.activatedRoute.snapshot.data.telemetry.env,
        cdata: this.telemetryCdata,
      },
      edata: {
        type: this.activatedRoute.snapshot.data.telemetry.type,
        pageid: this.activatedRoute.snapshot.data.telemetry.pageid,
        uri: this.activatedRoute.snapshot.data.telemetry.uri,
        duration: this.navigationhelperService.getPageLoadTime()
      }
    };
  }

  initializeFormFields() {
    this.signUpForm = this.sbFormBuilder.group({
      name: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl(null, [Validators.required, Validators.minLength(8)]),
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
      email: new FormControl(null, [Validators.email]),
      contactType: new FormControl('phone'),
      uniqueContact: new FormControl(null, [Validators.required]),
      tncAccepted: new FormControl(false, [Validators.requiredTrue])
    }, {
      validator: (formControl) => {
        const passCtrl = formControl.controls.password;
        const conPassCtrl = formControl.controls.confirmPassword;
        const nameCtrl = formControl.controls.name;
        this.onPasswordChange(passCtrl);
        if (_.trim(nameCtrl.value) === '') { nameCtrl.setErrors({ required: true }); }
        if (_.trim(passCtrl.value) === '') { passCtrl.setErrors({ required: true }); }
        if (_.trim(conPassCtrl.value) === '') { conPassCtrl.setErrors({ required: true }); }
        if (passCtrl.value !== conPassCtrl.value) {
          conPassCtrl.setErrors({ validatePasswordConfirmation: true });
        } else { conPassCtrl.setErrors(null); }
        return null;
      }
    });
    this.onContactTypeValueChanges();
    this.enableSignUpSubmitButton();
  }

  onPasswordChange(passCtrl: FormControl): void {
    let emailVal;
    if (this.showContact === 'email') {
      emailVal = this.signUpForm.get('email').value;
    }
    const val = _.get(passCtrl, 'value');
    const specRegex = new RegExp('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[~.,)(}{\\[!"#$%&\'()*+,-./:;<=>?@[^_`{|}~\\]])(?=\\S+$).{8,}');
    if (!specRegex.test(val)) {
      this.passwordError = _.get(this.resourceService, 'frmelmnts.lbl.passwd');
      passCtrl.setErrors({ passwordError: this.passwordError });
    } else if (emailVal === val || this.signUpForm.controls.name.value === val) {
      this.passwordError = _.get(this.resourceService, 'frmelmnts.lbl.passwderr');
      passCtrl.setErrors({ passwordError: this.passwordError });
    } else {
      this.passwordError = _.get(this.resourceService, 'frmelmnts.lbl.passwd');
      passCtrl.setErrors(null);
    }
  }

  onContactTypeValueChanges(): void {
    const emailControl = this.signUpForm.get('email');
    const phoneControl = this.signUpForm.get('phone');
    this.signUpForm.get('contactType').valueChanges.subscribe(
      (mode: string) => {
        this.setInteractEventData();
        this.signUpForm.controls['uniqueContact'].setValue('');
        if (mode === 'email') {
          this.signUpForm.controls['phone'].setValue('');
          emailControl.setValidators([Validators.required, Validators.email]);
          phoneControl.clearValidators();
        } else if (mode === 'phone') {
          this.signUpForm.controls['email'].setValue('');
          emailControl.clearValidators();
          phoneControl.setValidators([Validators.required, Validators.pattern('^\\d{10}$')]);
        }
        emailControl.updateValueAndValidity();
        phoneControl.updateValueAndValidity();
      });
  }

  enableSignUpSubmitButton() {
    this.signUpForm.valueChanges.subscribe(val => {
      if (this.signUpForm.status === 'VALID') {
        this.disableSubmitBtn = false;
      } else {
        this.disableSubmitBtn = true;
      }
    });
  }

  vaidateUserContact(captchaResponse?) {
    const value = this.signUpForm.controls.contactType.value === 'phone' ?
      this.signUpForm.controls.phone.value.toString() : this.signUpForm.controls.email.value;
    const uri = this.signUpForm.controls.contactType.value.toString() + '/' + value + '?captchaResponse=' + captchaResponse;
    this.signupService.checkUserExists(uri).subscribe(
      (data: ServerResponse) => {
        if (_.get(data, 'result.exists')) {
          this.signUpForm.controls['uniqueContact'].setValue('');
          this.showUniqueError = this.signUpForm.controls.contactType.value === 'phone' ?
            this.resourceService.frmelmnts.lbl.uniquePhone : this.resourceService.frmelmnts.lbl.uniqueEmail;
        } else {
          this.signUpForm.controls['uniqueContact'].setValue(true);
          this.showUniqueError = '';
        }
      },
      (err) => {
        if (_.get(err, 'error.params.status') && err.error.params.status === 'USER_ACCOUNT_BLOCKED') {
          this.showUniqueError = this.resourceService.frmelmnts.lbl.blockedUserError;
        } else if (err.status === 418) {
          this.signUpForm.controls['uniqueContact'].setValue(true);
          this.showUniqueError = this.resourceService.frmelmnts.lbl.captchaValidationFailed;
        } else {
          this.signUpForm.controls['uniqueContact'].setValue(true);
          this.showUniqueError = '';
        }
      }
    );
  }

  displayPassword() {
    if (this.showPassword) {
      this.showPassword = false;
    } else {
      this.showPassword = true;
    }
  }
  /**
   * @param  {string} inputType : User input type `email` or `phone`
   * @description : Function to trigger reCaptcha for onBlur event of user input
   * @since - release-3.0.1
   */
  getReCaptchaToken(inputType: string) {
    if (this.isP1CaptchaEnabled === 'true') {
      this.resetGoogleCaptcha();
      this.formInputType = inputType;
      const emailControl = this.signUpForm.get('email');
      const phoneControl = this.signUpForm.get('phone');
      if (inputType === 'email' && emailControl.status === 'VALID' && emailControl.value !== '') {
         this.signUpForm.controls['uniqueContact'].setValue('');
        this.captchaRef.execute();
      } else if (inputType === 'phone' && phoneControl.status === 'VALID' && phoneControl.value !== '') {
         this.signUpForm.controls['uniqueContact'].setValue('');
        this.captchaRef.execute();
      }
    } else {
      this.vaidateUserContact();
    }
  }

  /**
   * @description - Intermediate function to get captcha token and submit sign up form
   * @since - release-3.0.3
   */
  submitSignupForm() {
    if (this.isP1CaptchaEnabled === 'true') {
      this.resetGoogleCaptcha();
      this.captchaRef.execute();
    } else {
      this.onSubmitSignUpForm();
    }
  }

  resolved(captchaResponse: string) {
    if (captchaResponse) {
      if (this.formInputType) {
        this.vaidateUserContact(captchaResponse);
        this.formInputType = undefined;
      } else {
        this.onSubmitSignUpForm(captchaResponse);
      }
    }
  }

  onSubmitSignUpForm(captchaResponse?) {
    this.disableSubmitBtn = true;
    this.generateOTP(captchaResponse);
  }

  generateOTP(captchaResponse?) {
    const request = {
      'request': {
        'key': this.signUpForm.controls.contactType.value === 'phone' ?
          this.signUpForm.controls.phone.value.toString() : this.signUpForm.controls.email.value,
        'type': this.signUpForm.controls.contactType.value.toString()
      }
    };
    if (this.isMinor) {
      request.request['templateId'] = this.configService.constants.TEMPLATES.VERIFY_OTP_MINOR;
    }
    this.signupService.generateOTPforAnonymousUser(request, captchaResponse).subscribe(
      (data: ServerResponse) => {
        this.showSignUpForm = false;
        this.disableSubmitBtn = false;
      },
      (err) => {
        const failedgenerateOTPMessage = (_.get(err, 'error.params.status') && err.error.params.status === 'PHONE_ALREADY_IN_USE') ||
          (_.get(err, 'error.params.status') &&
            err.error.params.status === 'EMAIL_IN_USE') ? err.error.params.errmsg : this.resourceService.messages.fmsg.m0085;
        this.toasterService.error(failedgenerateOTPMessage);
        if (this.isP1CaptchaEnabled === 'true') { this.resetGoogleCaptcha(); }
        this.disableSubmitBtn = false;
      }
    );
  }

  resetGoogleCaptcha() {
    const element: HTMLElement = document.getElementById('resetGoogleCaptcha') as HTMLElement;
    element.click();
  }

  showParentForm(event) {
    if (event === 'true') {
      this.initializeFormFields();
      this.showSignUpForm = true;
    }
  }

  ngAfterViewInit () {
    setTimeout(() => {
      this.telemetryCdata = [{ 'type': 'signup', 'id': this.activatedRoute.snapshot.data.telemetry.uuid }];
      this.signUpTelemetryImpression();
    });
  }

  ngOnDestroy() {
    if (this.tenantDataSubscription) {
      this.tenantDataSubscription.unsubscribe();
    }
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  setInteractEventData() {
    this.submitInteractEdata = {
      id: 'submit-signup',
      type: 'click',
      pageid: 'signup',
      extra: {
        'contactType': this.signUpForm.controls.contactType.value.toString()
      }
    };
  }

  generateTelemetry(e) {
    const selectedType = e.target.checked ? 'selected' : 'unselected';
    const interactData = {
      context: {
        env: 'self-signup',
        cdata: [
          {id: 'user:tnc:accept', type: 'Feature'},
          {id: 'SB-16663', type: 'Task'}
        ]
      },
      edata: {
        id: 'user:tnc:accept',
        type: 'click',
        subtype: selectedType,
        pageid: 'self-signup'
      }
    };
    this.telemetryService.interact(interactData);
  }

  telemetryLogEvents(api: any, status: boolean) {
    let level = 'ERROR';
    let msg = api + ' failed';
    if (status) {
      level = 'SUCCESS';
      msg = api + ' success';
    }
    const event = {
      context: {
        env: 'self-signup'
      },
      edata: {
        type: api,
        level: level,
        message: msg
      }
    };
    this.telemetryService.log(event);
  }

  showAndHidePopup(mode: boolean) {
    this.showTncPopup = mode;
  }
}
