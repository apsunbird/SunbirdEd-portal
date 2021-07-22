import { Component, Input, OnInit } from '@angular/core';
import { ResourceService } from '@sunbird/shared';
import * as _ from 'lodash-es';

@Component({
  selector: 'app-course-info',
  templateUrl: './course-info.component.html',
  styleUrls: ['./course-info.component.scss']
})
export class CourseInfoComponent implements OnInit {

  @Input() courseHierarchy;
  showContentCreditsModal = false;
  showCredits = false;
  instance: string;
  splittedAry: any;
  fullName: any;

  constructor(public resourceService: ResourceService) { }

  ngOnInit() {
    this.instance = _.upperCase(this.resourceService.instance || 'SUNBIRD');
    console.log("Creator info========================");
    console.log(this.courseHierarchy.creator);
    if(this.courseHierarchy.creator!=null)
    {
      this.splittedAry =  this.courseHierarchy.creator.split("$$$$$");
      this.fullName = this.splittedAry[0]; 
     
    }
  }

  ngOnChanges() {
    this.checkContentCreditAvailability();
  }

  checkContentCreditAvailability() {
    /* istanbul ignore else */
    const { copyright, creators, attributions, originData, contentType } = this.courseHierarchy;
    if (copyright || creators || attributions || (!_.isEmpty(originData) && contentType === 'Course')) {
      this.showCredits = true;
    }
  }
}
