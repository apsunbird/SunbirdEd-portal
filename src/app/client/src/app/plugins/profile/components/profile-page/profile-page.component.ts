import {ProfileService} from '../../services';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, Inject } from '@angular/core';
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
} from '@sunbird/shared';
import * as _ from 'lodash-es';
import {Subject, Subscription} from 'rxjs';
import {IImpressionEventInput, IInteractEventEdata, IInteractEventObject, TelemetryService} from '@sunbird/telemetry';
import {ActivatedRoute, Router} from '@angular/router';
import {CacheService} from 'ng2-cache-service';
import {takeUntil} from 'rxjs/operators';
import { CertificateDownloadAsPdfService } from 'sb-svg2pdf';
import { CsCourseService } from '@project-sunbird/client-services/services/course/interface';
import { FieldConfig, FieldConfigOption } from 'common-form-elements';
import {RegistrationService} from '../../../../modules/public/services/registration/registration.service';
import { FormBuilder, FormControl, FormGroup,Validators } from '@angular/forms';
import { ValidationserviceService } from '../../../../modules/shared/regex/validationservice.service';

@Component({
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
  providers: [CertificateDownloadAsPdfService]
})
export class ProfilePageComponent implements OnInit, OnDestroy, AfterViewInit {
  [x: string]: any;
  private static readonly SUPPORTED_PERSONA_LIST_FORM_REQUEST =
  { formType: 'config', formAction: 'get', contentType: 'userType', component: 'portal' };
  private static readonly DEFAULT_PERSONA_LOCATION_CONFIG_FORM_REQUEST =
  { formType: 'profileConfig', contentType: 'default', formAction: 'get' };
  @ViewChild('profileModal', {static: false}) profileModal;
  @ViewChild('slickModal', {static: false}) slickModal;
  userProfile: any;
  contributions = [];
  totalContributions: Number;
  attendedTraining: Array<object>;
  roles: Array<string>;
  showMoreRoles = true;
  showMoreTrainings = true;
  showMoreCertificates = true;
  isCustodianOrgUser = true; // set to true to avoid showing icon before api return value
  showMoreRolesLimit = this.configService.appConfig.PROFILE.defaultShowMoreLimit;
  courseLimit = this.configService.appConfig.PROFILE.defaultViewMoreLimit;
  otherCertificateLimit = this.configService.appConfig.PROFILE.defaultViewMoreLimit;
  showEdit = false;
  userSubscription: Subscription;
  orgDetails: any = [];
  showContactPopup = false;
  showEditUserDetailsPopup = false;
  userFrameWork: any;
  telemetryImpression: IImpressionEventInput;
  myFrameworkEditEdata: IInteractEventEdata;
  editProfileInteractEdata: IInteractEventEdata;
  editMobileInteractEdata: IInteractEventEdata;
  editEmailInteractEdata: IInteractEventEdata;
  downloadCertificateEData: IInteractEventEdata;
  editRecoveryIdInteractEdata: IInteractEventEdata;
  addRecoveryIdInteractEdata: IInteractEventEdata;
  submitTeacherDetailsInteractEdata: IInteractEventEdata;
  updateTeacherDetailsInteractEdata: IInteractEventEdata;
  showRecoveryId = false;
  otherCertificates: Array<object>;
  otherCertificatesCounts: number;
  downloadOthersCertificateEData: IInteractEventEdata;
  udiseObj: { idType: string, provider: string, id: string };
  phoneObj: { idType: string, provider: string, id: string };
  emailObj: { idType: string, provider: string, id: string };
  teacherObj: { idType: string, provider: string, id: string };
  stateObj;
  districtObj;
  externalIds: {};
  schoolObj: { idType: string, provider: string, id: string };
  instance: string;
  layoutConfiguration: any;
  public unsubscribe$ = new Subject<void>();
  nonCustodianUserLocation: object = {};
  declarationDetails;
  tenantInfo;
  selfDeclaredInfo = [];
  selfDeclaredErrorTypes = [];
  scrollToId;
  isDesktopApp;
  userLocation: {};
  persona: {};
  subPersona: string;
  isConnected = true;
  nameArr: any;
  districtName: any;
  gender: any=null;
  dob: any=null;
  hrmsId: any=null;
  cfmsId: any=null;
  mandal: any=null;
  revDiv: any=null;
  rolesData: any=null;
  secName: any=null;
  secCode: any=null;
  ageCode: any=null;
  emailld:any=null;
  mobileNumber:any=null;
  age:any=null;
  dobdata:any=null;
  joinDate:any=null;
  genderData:any=null;
  logedInUserId:any=null;
  userEditRegistration: FormGroup;
  departMentAp:any;
  genericPoup:boolean=false;
  editUserPopup:boolean=false;
  public districtList: Array<any> = [];
  public divList: Array<any> = [];
  public mandalList: Array<any> = [];
  public mandalListNew: Array<any> = [];

  constructor(@Inject('CS_COURSE_SERVICE') private courseCService: CsCourseService, private cacheService: CacheService,
  public resourceService: ResourceService, public coursesService: CoursesService,
    public toasterService: ToasterService, public profileService: ProfileService, public userService: UserService,
    public configService: ConfigService, public router: Router, public utilService: UtilService, public searchService: SearchService,
    private playerService: PlayerService, private activatedRoute: ActivatedRoute, public orgDetailsService: OrgDetailsService,
    public navigationhelperService: NavigationHelperService, public certRegService: CertRegService,
    private telemetryService: TelemetryService, public layoutService: LayoutService, private formService: FormService,
    private certDownloadAsPdf: CertificateDownloadAsPdfService, private connectionService: ConnectionService,private _httpService:RegistrationService,private fb: FormBuilder,private _validation:ValidationserviceService) {
    this.getNavParams();
  }

  getNavParams() {
    this.scrollToId = _.get(this.router.getCurrentNavigation(), 'extras.state.scrollToId');
  }

  ngOnInit() {

    this.userEditRegistration = this.fb.group({
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
      designation: new FormControl(null),
      qualification: new FormControl(null),
      departmentap: new FormControl(null),
      ageap: new FormControl(null),
      userId:new FormControl(null)
      
    })



    this.isDesktopApp = this.utilService.isDesktopApp;
    if(this.isDesktopApp) {
      this.connectionService.monitor()
      .pipe(takeUntil(this.unsubscribe$)).subscribe(isConnected => {
        this.isConnected = isConnected;
      });
    }
    this.initLayout();
    this.instance = _.upperFirst(_.toLower(this.resourceService.instance || 'SUNBIRD'));
    this.getCustodianOrgUser();
    this.userSubscription = this.userService.userData$.subscribe((user: IUserData) => {
      /* istanbul ignore else */
      if (user.userProfile) {
        this.userProfile = user.userProfile;
        console.log("User Profile data==================");
        console.log(this.userProfile);
        console.log(this.userProfile.lastName);
        this.gender = this.userProfile.gender;
        this.dob = this.userProfile.dob;
        console.log(this.userProfile['organisations'][0]['roles']);
        console.log(this.userProfile['organisations'][0]['roles'].join(", "));

        this.rolesData = this.userProfile['organisations'][0]['roles'].join(", ");
       this.logedInUserId   =  this.userProfile.userId;
        if(this.userProfile.lastName!=null)
        {
        this.nameArr = this.userProfile.lastName.split('$#$#')


        if(this.nameArr[11]!=null && this.nameArr[11]!="undefined")
        {
          this.emailld = this.nameArr[11];
        }
        else
        {
          this.emailld = null;
        }



        if(this.nameArr[12]!=null && this.nameArr[12]!="undefined")
        {
          this.mobileNumber = this.nameArr[12];
        }
        else
        {
          this.mobileNumber = null;
        }


        if(this.nameArr[4]!=null && this.nameArr[4]!="undefined")
        {
          this.age = this.nameArr[4];
        }
        else
        {
          this.age = null;
        }


        if(this.nameArr[13]!=null && this.nameArr[13]!="undefined")
        {
          this.dobdata = this.nameArr[13];
        }
        else
        {
          this.dobdata = null;
        }


        if(this.nameArr[14]!=null && this.nameArr[14]!="undefined")
        {
          this.joinDate = this.nameArr[14];
        }
        else
        {
          this.joinDate = null;
        }


        if(this.nameArr[15]!=null && this.nameArr[15]!="undefined")
        {
          this.genderData = this.nameArr[15];
        }
        else
        {
          this.genderData = null;
        }



        if(this.nameArr[0]!=null && this.nameArr[0]!="undefined")
        {
          this.hrmsId =   this.nameArr[0].replace('$$$$$', '');
        }
        else
        {
          this.hrmsId = null;
        }

        if(this.nameArr[1]!=null && this.nameArr[1]!="undefined")
        {
          this.cfmsId = this.nameArr[1];
        }
        else
        {
          this.cfmsId = null;
        }

        if(this.nameArr[8]!=null && this.nameArr[8]!="undefined")
        {
          this.mandal = this.nameArr[8];
        }
        else
        {
          this.mandal = null;
        }


        if(this.nameArr[3]!=null && this.nameArr[3]!="undefined")
        {
          this.secName = this.nameArr[3];
        }
        else
        {
          this.secName = null;
        }


        if(this.nameArr[2]!=null && this.nameArr[2]!="undefined")
        {
          this.secCode = this.nameArr[2];
        }
        else
        {
          this.secCode = null;
        }


        if(this.nameArr[4]!=null && this.nameArr[4]!="undefined") 
        {
          this.ageCode = this.nameArr[4];
        }
        else
        {
          this.ageCode = null;
        }
       console.log("age==================");
       console.log(this.age);
       console.log(this.ageCode);

        if(this.nameArr[5]!=null && this.nameArr[5]!="undefined")
        {
          this.jobProfileCode = this.nameArr[5];
        }
        else
        {
          this.jobProfileCode = null;
        }


        if(this.nameArr[6]!=null && this.nameArr[6]!="undefined")
        {
          this.eduCation = this.nameArr[6];
        }
        else
        {
          this.eduCation = null;
        }


        if(this.nameArr[7]!=null && this.nameArr[7]!="undefined")
        {
          this.departMentAp = this.nameArr[7];
        }
        else
        {
          this.departMentAp = null;
        }




        if(this.nameArr[9]!=null && this.nameArr[9]!="undefined")
        {
          this.revDiv = this.nameArr[9];
        }
        else
        {
          this.revDiv = null;
        }



        if(this.nameArr[10]!=null && this.nameArr[10]!="undefined")
        {
          this.districtName = this.nameArr[10];
        }
        else
        {
          this.districtName = null;
        }
        }
        const role: string = (!this.userProfile.userType ||
          (this.userProfile.userType && this.userProfile.userType === 'OTHER')) ? '' : this.userProfile.userType;
        this.userLocation = this.getUserLocation(this.userProfile);
        this.getPersonaConfig(role).then((val) => {
          this.persona = val;
        });
        this.getSubPersonaConfig(this.userProfile.userSubType, role.toLowerCase(), this.userLocation).then((val) => {
          this.subPersona = val;
        });
        this.userFrameWork = this.userProfile.framework ? _.cloneDeep(this.userProfile.framework) : {};
        this.getOrgDetails();
        this.getContribution();
        this.getOtherCertificates(_.get(this.userProfile, 'userId'), 'all');
        this.getTrainingAttended();
        this.setNonCustodianUserLocation();
        /* istanbul ignore else */
        if (_.get(this.userProfile, 'declarations') && this.userProfile.declarations.length > 0) {
          this.declarationDetails = _.get(this.userProfile, 'declarations')[0];
          if (this.declarationDetails.errorType) {
            this.selfDeclaredErrorTypes = this.declarationDetails.errorType.split(',');
          }
          this.getSelfDeclaredDetails();
        }
      }
    });
    this.setInteractEventData();
    this.getDistrictMandalData(null,null);
  }
  closepopupgeneric()
  {
    this.genericPoup = false;
    window.location.reload();
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
       this.divList = [];
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
  editUserFrm()
  {
    this.editUser();
    this.editUserPopup = true;
  }

  closepopup()
  {
    this.editUserPopup = false;
  }
  onChange(frmDistrictVal) {
     sessionStorage.setItem("frmDistrictVal", frmDistrictVal);
     localStorage.setItem('frmDistrictVal', frmDistrictVal);
     this.getDistrictMandalData(frmDistrictVal,null);
 }
 onChange1(frmDivVal)
 {
   this.frmDistrictVal = localStorage.getItem('frmDistrictVal')
   this.getDistrictMandalData(this.frmDistrictVal,frmDivVal);
 }

  editUser( )
  {
    this._httpService.getUserDetailByID(this.logedInUserId).subscribe(response => { 
    console.log("User Response ==============================");
    this.userDetailData = response;
    this.userDetailDataAry = this.userDetailData.result.response;
    console.log(this.userDetailDataAry);
    if(this.userDetailDataAry.firstName!=null)
    {
    this.fullName = this.userDetailDataAry.firstName;
    }
    else{
      this.fullName = null;
    }
    if(this.userDetailDataAry.lastName!=null)
        {
        this.nameArr = this.userDetailDataAry.lastName.split('$#$#')
        if(this.nameArr[0]!=null && this.nameArr[0]!="undefined")
        {
          this.hrmsIdData =   this.nameArr[0].replace('$$$$$', '');
        }
        else
        {
          this.hrmsIdData = null;
        }

        if(this.nameArr[11]!=null && this.nameArr[11]!="undefined")
        {
          this.editEmailld = this.nameArr[11];
        }
        else
        {
          this.editEmailld = null;
        }
        if(this.nameArr[12]!=null && this.nameArr[12]!="undefined")
        {
          this.editMobileNumber = this.nameArr[12];
        }
        else
        {
          this.editMobileNumber = null;
        }
        if(this.nameArr[4]!=null && this.nameArr[4]!="undefined")
        {
          this.editAge = this.nameArr[4];
        }
        else
        {
          this.editAge = null;
        }


        if(this.nameArr[13]!=null && this.nameArr[13]!="undefined")
        {
          this.editDob = this.nameArr[13];
        }
        else
        {
          this.editDob = null;
        }


        if(this.nameArr[14]!=null && this.nameArr[14]!="undefined")
        {
          this.editJoinDate = this.nameArr[14];
        }
        else
        {
          this.editJoinDate = null;
        }
        if(this.nameArr[15]!=null && this.nameArr[15]!="undefined")
        {
          this.editGender = this.nameArr[15];
        }
        else
        {
          this.editGender = null;
        }
        if(this.nameArr[0]!=null && this.nameArr[0]!="undefined")
        {
          this.editHrmsIdData =   this.nameArr[0].replace('$$$$$', '');
        }
        else
        {
          this.editHrmsIdData = null;
        }

        if(this.nameArr[1]!=null && this.nameArr[1]!="undefined")
        {
          this.editCfmsId = this.nameArr[1];
        }
        else
        {
          this.editCfmsId = null;
        }

        if(this.nameArr[8]!=null && this.nameArr[8]!="undefined")
        {
          this.editMandal = this.nameArr[8];
        }
        else
        {
          this.editMandal = null;
        }


        if(this.nameArr[3]!=null && this.nameArr[3]!="undefined")
        {
          this.editSecName = this.nameArr[3];
        }
        else
        {
          this.editSecName = null;
        }


        if(this.nameArr[2]!=null && this.nameArr[2]!="undefined")
        {
          this.editSecCode = this.nameArr[2];
        }
        else
        {
          this.editSecCode = null;
        }


        if(this.nameArr[4]!=null && this.nameArr[4]!="undefined") 
        {
          this.editAgeCode = this.nameArr[4];
        }
        else
        {
          this.editAgeCode = null;
        }

        if(this.nameArr[5]!=null && this.nameArr[5]!="undefined")
        {
          this.editJobProfile = this.nameArr[5];
        }
        else
        {
          this.editJobProfile = null;
        }


        if(this.nameArr[6]!=null && this.nameArr[6]!="undefined")
        {
          this.editEduCation = this.nameArr[6];
        }
        else
        {
          this.editEduCation = null;
        }
        if(this.nameArr[10]!=null && this.nameArr[10]!="undefined")
        {
          this.editDistrictName = this.nameArr[10];
          this.onChange(this.editDistrictName);
        }
        else
        {
          this.editDistrictName = null;
        }
        if(this.nameArr[9]!=null && this.nameArr[9]!="undefined")
        {
          this.editRevDiv = this.nameArr[9];
          this.onChange1(this.editRevDiv);
        }
        else
        {
          this.editRevDiv = null;
        }
        }

    }, (err) => {
    console.log(err);
    });
    this.editUserPopup= true;
   
  }

  editUserDetail()
{
let tempArray1:any;
  tempArray1 = 
  {
  "request":{
     "firstName": this.userEditRegistration.value['fName'], //required
    "lastName": '$$$$$'+this.userEditRegistration.value['hrmsID']+'$#$#'+this.userEditRegistration.value['cfmsID']+'$#$#'+this.userEditRegistration.value['secCode']+'$#$#'+this.userEditRegistration.value['secName']+'$#$#'+this.userEditRegistration.value['ageap']+'$#$#'+this.userEditRegistration.value['jobName']+'$#$#'+this.userEditRegistration.value['education']+'$#$#'+this.userEditRegistration.value['departmentap']+'$#$#'+this.userEditRegistration.value['mandalULB']+'$#$#'+this.userEditRegistration.value['revDiv']+'$#$#'+this.userEditRegistration.value['district']+'$#$#'+this.userEditRegistration.value['emailId']+'$#$#'+this.userEditRegistration.value['mobileNumber']+'$#$#'+this.userEditRegistration.value['dob']+'$#$#'+this.userEditRegistration.value['joinDate']+'$#$#'+this.userEditRegistration.value['gender'],
    "userId":this.logedInUserId
  }
  } 
  this._httpService.editUserDetail(tempArray1).subscribe(res => {
 console.log(res);
 console.log("userIDS===========");
 console.log(this.logedInUserId);
 this.editUserPopup= false;
 this.genericPoup = true;
 this.genericMsg ="User Edit  Sucessfully!";
  },err => {
    console.log("error===========");
    this.genericPoup = true;
    this.genericMsg =err.error.params.errmsg;

    });


}

  initLayout() {
    this.layoutConfiguration = this.layoutService.initlayoutConfig();
    this.layoutService.switchableLayout().pipe(takeUntil(this.unsubscribe$)).subscribe(layoutConfig => {
      /* istanbul ignore else */
      if (layoutConfig != null) {
        this.layoutConfiguration = layoutConfig.layout;
      }
    });
  }

  setNonCustodianUserLocation() {
    const subOrgs = _.filter(this.userProfile.organisations, (org) => {
      /*istanbul ignore else */
      if (this.userProfile.rootOrgId !== org.organisationId) {
        return org;
      }
    });
    /*istanbul ignore else */
    if (!_.isEmpty(subOrgs)) {
      const sortedSubOrgs = _.reverse(_.sortBy(subOrgs, 'orgjoindate'));
      /*istanbul ignore else */
      if (!_.isEmpty(sortedSubOrgs[0]) && !_.isEmpty(sortedSubOrgs[0].locations)) {
        _.forEach(sortedSubOrgs[0].locations, (location) => {
          this.nonCustodianUserLocation[location.type] = location.name;
        });
      }
    }
  }

  getOrgDetails() {
    let orgList = [];
    this.roles = [];
    _.forEach(this.userProfile.organisations, (org, index) => {
      if (this.userProfile.rootOrgId !== org.organisationId) {
        if (org.locations && org.locations.length === 0) {
          if (this.userProfile.organisations[0].locationIds && this.userProfile.organisations[0].locations) {
            org.locationIds = this.userProfile.organisations[0].locationIds;
            org.locations = this.userProfile.organisations[0].locations;
          }
        }
        if (org.orgjoindate) {
          org.modifiedJoinDate = new Date(org.orgjoindate).getTime();
        }
        orgList.push(org);
      } else {
        if (org.locations && org.locations.length !== 0) {
          if (org.orgjoindate) {
            org.modifiedJoinDate = new Date(org.orgjoindate).getTime();
          }
          orgList.push(org);
        }
      }
      _.forEach(org.roles, (value, key) => {
        if (value !== 'PUBLIC') {
          const roleName = _.find(this.userProfile.roleList, { id: value });
          if (roleName) {
            this.roles.push(roleName['name']);
          }
        }
      });
    });
    this.roles = _.uniq(this.roles).sort();
    orgList = _.sortBy(orgList, ['modifiedJoinDate']);
    this.orgDetails = _.last(orgList);
  }

  convertToString(value) {
    return _.isArray(value) ? _.join(value, ', ') : undefined;
  }

  getLocationDetails(locations, type) {
    const location: any = _.find(locations, { type: type });
    return location ? location.name : false;
  }

  getContribution(): void {
    const { constantData, metaData, dynamicFields } = this.configService.appConfig.Course.otherCourse;
      const searchParams = {
        status: ['Live'],
        contentType: this.configService.appConfig.WORKSPACE.contentType,
        params: { lastUpdatedOn: 'desc' }
      };
      const inputParams = { params: this.configService.appConfig.PROFILE.contentApiQueryParams };
      this.searchService.searchContentByUserId(searchParams, inputParams).subscribe((data: ServerResponse) => {
        this.contributions = this.utilService.getDataForCard(data.result.content, constantData, dynamicFields, metaData);
        this.totalContributions = _.get(data, 'result.count') || 0;
      });
  }

  getTrainingAttended() {
    this.coursesService.enrolledCourseData$.pipe().subscribe(data => {
      this.attendedTraining = _.reverse(_.sortBy(data.enrolledCourses, val => {
        return _.isNumber(_.get(val, 'completedOn')) ? _.get(val, 'completedOn') : Date.parse(val.completedOn);
      })) || [];
    });
  }

/**
 * @param userId
 *It will fetch certificates of user, other than courses
 */
  getOtherCertificates(userId, certType) {
    const requestParam = { userId,  certType };
    if (this.otherCertificatesCounts) {
      requestParam['limit'] = this.otherCertificatesCounts;
    }
    this.certRegService.fetchCertificates(requestParam).subscribe((data) => {
      this.otherCertificatesCounts = _.get(data, 'result.response.count');
      this.otherCertificates = _.map(_.get(data, 'result.response.content'), val => {
        const certObj: any =  {
          certificates: [{
            url: _.get(val, '_source.pdfUrl')
          }],
          issuingAuthority: _.get(val, '_source.data.badge.issuer.name'),
          issuedOn: _.get(val, '_source.data.issuedOn'),
          courseName: _.get(val, '_source.data.badge.name'),
        };
        if (_.get(val, '_id') && _.get(val, '_source.data.badge.name')) {
          certObj.issuedCertificates = [{identifier: _.get(val, '_id'), name: _.get(val, '_source.data.badge.name') }];
        }
        return certObj;
      });
      if (this.otherCertificates && this.otherCertificates.length && this.scrollToId) {
        this.triggerAutoScroll();
      }
    });
  }

  downloadCert(course) {
    if (this.isDesktopApp && !this.isConnected) {
      this.toasterService.error(this.resourceService.messages.desktop.emsg.cannotAccessCertificate);
      return;
    }
    // Check for V2
    if (_.get(course, 'issuedCertificates.length')) {
      this.toasterService.success(_.get(this.resourceService, 'messages.smsg.certificateGettingDownloaded'));
      const certificateInfo = course.issuedCertificates[0];
      const courseName = course.courseName || _.get(course, 'issuedCertificates[0].name') || 'certificate';
      if (_.get(certificateInfo, 'identifier')) {
        this.courseCService.getSignedCourseCertificate(_.get(certificateInfo, 'identifier'))
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((resp) => {
          if (_.get(resp, 'printUri')) {
            this.certDownloadAsPdf.download(resp.printUri, null, courseName);
          } else if (_.get(course, 'certificates.length')) {
            this.downloadPdfCertificate(course.certificates[0]);
          } else {
            this.toasterService.error(this.resourceService.messages.emsg.m0076);
          }
        }, error => {
          this.downloadPdfCertificate(certificateInfo);
        });
      } else {
        this.downloadPdfCertificate(certificateInfo);
      }
    } else if (_.get(course, 'certificates.length')) { // For V1 - backward compatibility
      this.toasterService.success(_.get(this.resourceService, 'messages.smsg.certificateGettingDownloaded'));
      this.downloadPdfCertificate(course.certificates[0]);
    } else {
      this.toasterService.error(this.resourceService.messages.emsg.m0076);
    }
  }

  downloadPdfCertificate(value) {
    if (_.get(value, 'url')) {
      const request = {
        request: {
          pdfUrl: _.get(value, 'url')
        }
      };
      this.profileService.downloadCertificates(request).subscribe((apiResponse) => {
        const signedPdfUrl = _.get(apiResponse, 'result.signedUrl');
        if (signedPdfUrl) {
          window.open(signedPdfUrl, '_blank');
        } else {
          this.toasterService.error(this.resourceService.messages.emsg.m0076);
        }
      }, (err) => {
        this.toasterService.error(this.resourceService.messages.emsg.m0076);
      });
    } else {
      this.toasterService.error(this.resourceService.messages.emsg.m0076);
    }
  }

  toggle(showMore) {
    if (showMore === true) {
      this.showMoreRolesLimit = this.roles.length;
      this.showMoreRoles = false;
    } else {
      this.showMoreRoles = true;
      this.showMoreRolesLimit = this.configService.appConfig.PROFILE.defaultShowMoreLimit;
    }
  }

  toggleCourse(showMoreCourse, courseLimit) {
    if (showMoreCourse === true) {
      this.courseLimit = courseLimit;
      this.showMoreTrainings = false;
    } else {
      this.showMoreTrainings = true;
      this.courseLimit = 3;
    }
  }

  updateProfile(data) {
    this.profileService.updateProfile({ framework: data }).subscribe(res => {
      this.userProfile.framework = data;
      this.toasterService.success(this.resourceService.messages.smsg.m0046);
      this.profileModal.modal.deny();
      this.showEdit = false;
    }, err => {
      this.showEdit = false;
      this.toasterService.warning(this.resourceService.messages.emsg.m0012);
      this.profileModal.modal.deny();
      this.cacheService.set('showFrameWorkPopUp', 'installApp');
    });
  }

  openContent(content) {
    this.playerService.playContent(content.data.metaData);
  }

  public prepareVisits(event) {
    const inViewLogs = _.map(event, (content, index) => ({
      objid: content.metaData.courseId ? content.metaData.courseId : content.metaData.identifier,
      objtype: 'course', index: index,
      section: content.section,
    }));
    if (this.telemetryImpression) {
      this.telemetryImpression.edata.visits = inViewLogs;
      this.telemetryImpression.edata.subtype = 'pageexit';
      this.telemetryImpression = Object.assign({}, this.telemetryImpression);
    }
  }
  private getCustodianOrgUser() {
    this.orgDetailsService.getCustodianOrgDetails().subscribe(custodianOrg => {
      if (_.get(this.userService, 'userProfile.rootOrg.rootOrgId') === _.get(custodianOrg, 'result.response.value')) {
        this.isCustodianOrgUser = true;
      } else {
        this.isCustodianOrgUser = false;
      }
    });
  }

  setInteractEventData() {
    this.myFrameworkEditEdata = {
      id: 'profile-edit-framework',
      type: 'click',
      pageid: 'profile-read'
    };
    this.editProfileInteractEdata = {
      id: 'profile-edit',
      type: 'click',
      pageid: 'profile-read'
    };
    this.editMobileInteractEdata = {
      id: 'profile-edit-mobile',
      type: 'click',
      pageid: 'profile-read'
    };
    this.editEmailInteractEdata = {
      id: 'profile-edit-emailId',
      type: 'click',
      pageid: 'profile-read'
    };
    this.downloadCertificateEData = {
      id: 'profile-download-certificate',
      type: 'click',
      pageid: 'profile-read'
    };
    this.editRecoveryIdInteractEdata = {
      id: 'profile-edit-recoveryId',
      type: 'click',
      pageid: 'profile-read'
    };
    this.addRecoveryIdInteractEdata = {
      id: 'profile-add-recoveryId',
      type: 'click',
      pageid: 'profile-read'
    };
    this.downloadOthersCertificateEData = {
      id: 'profile-download-others-certificate',
      type: 'click',
      pageid: 'profile-read'
    };
    this.submitTeacherDetailsInteractEdata = {
      id: 'add-teacher-details',
      type: 'click',
      pageid: 'profile-read'
    };
    this.updateTeacherDetailsInteractEdata = {
      id: 'edit-teacher-details',
      type: 'click',
      pageid: 'profile-read'
    };
  }

  navigate(url, formAction) {
    this.router.navigate([url], {queryParams: {formaction: formAction}});
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.telemetryImpression = {
        context: {
          env: this.activatedRoute.snapshot.data.telemetry.env
        },
        object: {
          id: this.userService.userid,
          type: 'User',
          ver: '1.0'
        },
        edata: {
          type: this.activatedRoute.snapshot.data.telemetry.type,
          pageid: 'profile-read',
          subtype: this.activatedRoute.snapshot.data.telemetry.subtype,
          uri: this.router.url,
          duration: this.navigationhelperService.getPageLoadTime()
        }
      };
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * @since - #SH-19
   * @param  {object} coursedata - data of the course which user will click from the courses section
   * @description - This method will redirect to the courses page which enrolled by the user
   */
  navigateToCourse(coursedata) {
    const courseId = _.get(coursedata, 'courseId');
    const interactData = {
      context: {
        env: _.get(this.activatedRoute.snapshot.data.telemetry, 'env'),
        cdata: [{
          type: 'batch',
          id: _.get(coursedata, 'batchId')
        }]
      },
      edata: {
        id: 'course-play',
        type: 'click',
        pageid: 'profile-read',
      },
      object: {
        id: courseId,
        type: _.get(coursedata, 'content.contentType'),
        ver: '1.0',
        rollup: {},
      }
    };
    this.telemetryService.interact(interactData);
    this.router.navigate([`learn/course/${courseId}`]);
  }

  toggleOtherCertific(showMore) {
    if (showMore) {
      if (this.otherCertificates.length !== this.otherCertificatesCounts) {
        this.getOtherCertificates(_.get(this.userProfile, 'userId'), 'all');
      }
      this.otherCertificateLimit = this.otherCertificatesCounts;
      this.showMoreCertificates = false;
    } else {
      this.otherCertificateLimit = this.configService.appConfig.PROFILE.defaultViewMoreLimit;
      this.showMoreCertificates = true;
    }
  }

  /**
   * @since - #SH-920
   * @description - This method will map self declared values with teacher details dynamic fields to display on profile page
   */
  getSelfDeclaredDetails() {
    this.selfDeclaredInfo = [];
    this.profileService.getPersonaTenantForm().pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
      const tenantConfig: any = res.find(config => config.code === 'tenant');
      this.tenantInfo = _.get(tenantConfig, 'templateOptions.options').find(tenant => tenant.value === this.declarationDetails.orgId);

      this.profileService.getSelfDeclarationForm(this.declarationDetails.orgId).pipe(takeUntil(this.unsubscribe$)).subscribe(formConfig => {
        const externalIdConfig = formConfig.find(config => config.code === 'externalIds');
        (externalIdConfig.children as FieldConfig<any>[]).forEach(config => {
          if (this.declarationDetails.info[config.code]) {
            this.selfDeclaredInfo.push({ label: config.fieldName, value: this.declarationDetails.info[config.code], code: config.code });
          }
        });
      });
    });
  }

  copyToClipboard(userName) {
    const textElement = document.createElement('textarea');
    textElement.style.position = 'fixed';
    textElement.value = userName;
    document.body.appendChild(textElement);
    textElement.select();
    document.execCommand('copy');
    document.body.removeChild(textElement);
    this.toasterService.success((this.resourceService.messages.profile.smsg.m0041).replace('{instance}', this.instance));
  }

  triggerAutoScroll() {
    setTimeout(() => {
      const element = document.getElementById(this.scrollToId);
      if (!element) { return; }
      var elementPosition = element.getBoundingClientRect().top;
      var offsetPosition = elementPosition - 144;

      window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
      });
    });
  }

  private getUserLocation(profile: any) {
   const userLocation = {};
    if (profile && profile.userLocations && profile.userLocations.length) {
        profile.userLocations.forEach((d) => {
            userLocation[d.type] = d;
        });
    }
    return userLocation;
}

private async getPersonaConfig(persona: string) {
  const formFields = await this.formService.getFormConfig(ProfilePageComponent.SUPPORTED_PERSONA_LIST_FORM_REQUEST).toPromise();
  return formFields.find(config => config.code === persona);
}

private async getSubPersonaConfig(subPersonaCode: string, persona: string, userLocation: any): Promise<string> {
  if (!subPersonaCode || !persona) {
      return undefined;
  }
  let formFields;
  try {
      const state = userLocation.state;
      formFields = await this.formService.getFormConfig({
        ...ProfilePageComponent.DEFAULT_PERSONA_LOCATION_CONFIG_FORM_REQUEST,
        ...(state ? {contentType: state.code} : {})
      }).toPromise();
  } catch (e) {
      formFields = await this.formService.getFormConfig(ProfilePageComponent.DEFAULT_PERSONA_LOCATION_CONFIG_FORM_REQUEST).toPromise();
  }

  const personaConfig = formFields.find(formField => formField.code === 'persona');

  const personaChildrenConfig: FieldConfig<any>[] = personaConfig['children'][persona];
  const subPersonaConfig = personaChildrenConfig.find(formField => formField.code === 'subPersona');
  if (!subPersonaConfig) {
      return undefined;
   }
  const subPersonaFieldConfigOption = (subPersonaConfig.templateOptions.options as FieldConfigOption<any>[]).
              find(option => option.value === subPersonaCode);
  return subPersonaFieldConfigOption ? subPersonaFieldConfigOption.label : undefined;
}

}
