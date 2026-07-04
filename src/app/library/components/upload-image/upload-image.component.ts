import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedService } from '../../../shared/shared.service';
import { FileUploadService } from '../../services/file-upload.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrl: './upload-image.component.less',
})
export class UploadImageComponent {
  private host = environment.apiUrl.replace(/\/api\/?$/, '/') ;
  @Input() description: string = ''; // Optional description
  @Input() showDescription: boolean = false;
  @Input() width: number = 100;
  @Input() widthUnit: 'px' | '%' | 'rem' | 'em' = 'px';
  @Input() height: number = 100;
  @Input() heightUnit: 'px' | '%' | 'rem' | 'em' = 'px';
  @Input() uploadTitle: string = 'Upload';
  @Output() uploadImage = new EventEmitter();
  @Output() getImageData = new EventEmitter();
  @Output() emitErrorMessage = new EventEmitter();
  @Input() fileNameText: string = '';
  @Input() imageWidth: string = '56px';
  @Input() imageHeight: string = '56px';
  @Input() imageRadius: string = '50%';
  @Input() helpText?: string;
  @Input() fieldTitle?: string;
  @Input() required: boolean = false;
  @Input() readOnly: boolean = false;
  @Input() showbackdrop: boolean = false;
  @Input() isBanner: boolean = false;
  @Input() margin: string = '0%';
  @Input() isObjectFitCover: boolean = false;
  @Input() deviceTypeName?: string;
  @Input() uplodedImageUrl?: string;
  @Input() rounded: boolean = false;
  @Input() backgroundColor: string = '#FFFFFF';
  @Input() uploadButtonWidth: number = 71;
  @Input() removeButtonWidth: number = 78;
  @Input() changeButtonWidth: number = 77;
  @Input() uploadButtonHeight: number = 32;
  @Input() fileIcon?: string;
  @Input() defaultImage: string =
    '/assets/images/icons/user-access/Avatar_dark.png';
  fileDetails: any = {};
  error: boolean = false;
  errorMessage: string = '';
  fieldId = Date.now();

  constructor(
    private fileUploadService: FileUploadService,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {}
  removePhoto() {
    this.fileIcon = undefined;
    this.uploadImage.emit(null);
  }
  triggerFileInput() {
    const fileInput = document.querySelector('.upload-image--file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
  onClick(event: Event) {
    const targetElement = event.target as HTMLInputElement;
    // this.sharedService.toggleGlobalLoader(true);
    if (targetElement.files && targetElement.files[0]) {
      const file = targetElement.files[0];
      this.fileIcon = URL.createObjectURL(file);
      // this.fileNameText = targetElement.files[0].name;
      this.fileUploadService.uploadFile(targetElement).subscribe({
        next: (file: any) => {
          this.fileDetails = file;
          const request = {
            file_name: file.name,
            file_type: file.type,
            subfolder: 'members/images/',
          };
          this.upLoadImage(request);
        },
        error: (reason) => {
          this.sharedService.toggleGlobalLoader(false);
        },
      });
    } else {
      this.sharedService.toggleGlobalLoader(false);
      // this.sharedService.showToastMessage('Something went wrong', 'error')
    }
  }
  upLoadImage(request: any) {
    this.fileUploadService.upLoadImage(request, this.host).subscribe({
      next: (data: any) => {
        this.uploadImage.emit(data.file_key);
        let file = { ...this.fileDetails };
        this.getImageData.emit({ data, request, file });
        // this.postImage(data, request);
      },
      error: (reason) => {
        this.emitErrorMessage.emit(reason.error);
        this.sharedService.toggleGlobalLoader(false);
      },
    });
  }
}
