import { Injectable } from '@angular/core';
import { SharedService } from '../../shared/shared.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  constructor(private http: HttpClient, private sharedService:SharedService) {}

  upLoadImage(request: any, host: any) {
    let requestUrl = host + "sign-s3/";
    return this.http.post(requestUrl, request);
  }
  uploadFile(inputElement: HTMLInputElement) {
    return new Observable((observer) => {
      if (inputElement.files && inputElement.files.length > 0) {
        let files = new DataTransfer();
        files.items.add(
          new File(
            [inputElement.files[0]],
            inputElement.files[0].name
              .split(" ")
              .join("")
              .replace(/[^a-zA-Z0-9_.]/g, ""),
            {
              type: inputElement.files[0].type,
              lastModified: inputElement.files[0].lastModified,
            },
          ),
        );
        inputElement.files = files.files;
        let reader = new FileReader();
        reader.onload = (data: any) => {
          const file = {
            lastModified: inputElement.files![0].lastModified,
            lastModifiedDate: inputElement.files![0].lastModified,
            name: inputElement
              .files![0].name.split(" ")
              .join("")
              .replace(/[^a-zA-Z0-9_.]/g, ""),
            size: inputElement.files![0].size,
            type: inputElement.files![0].type,
            data: data.target.result,
          };
          observer.next(file);
        };
        reader.onerror = (err) => {
          observer.error(err);
        };
        if (inputElement.files && inputElement.files[0] instanceof Blob) {
          reader.readAsDataURL(inputElement.files[0]);
        }
      } else {
        observer.error("File Not Found");
      }
    });
  }

    postImage(val: any, request: any, fileDetails:any) {
    let xhr = new XMLHttpRequest();
    xhr.open("PUT", val.upload_url);
    xhr.setRequestHeader("Content-Type", request.content_type);
    // xhr.onload = () => {
    //   if (xhr.status === 200) {
    //     // this.uplodedImageUrl = val.file_key;
    //     // this.uploadImage.emit(val.file_key);
    //     // setTimeout((): void => {
    //     //   this.sharedService.toggleGlobalLoader(false);
    //     // }, 3000);
    //   }
    // };
    xhr.onerror = (reason: any) => {
      // this.error = true;
      // this.emitErrorMessage.emit(reason.error);
      // this.errorMessage = reason.error.error[0].message;
      // this.fileDetails.error = this.error;
      // this.fileDetails.errorMessage = this.errorMessage;
      this.sharedService.toggleGlobalLoader(false);
      // this.sharedService.showToastMessage('Something went wrong. Please try again later.', 'error')
    };
    let blob = this.dataURItoBlob(fileDetails.data);
    xhr.send(blob);
  }

  dataURItoBlob(dataURI?: any) {
    let byteString: any = atob(dataURI.split(",")[1]);
    let mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }
}
