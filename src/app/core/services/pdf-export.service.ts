import {
  ApplicationRef,
  EnvironmentInjector,
  Injectable,
  Type,
  createComponent,
  inject,
} from '@angular/core';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface RenderComponentPdfOptions {
  component: Type<unknown>;
  inputs: Record<string, unknown>;
  selector: string;
  filename: string;
  width?: string;
}

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);

  async renderComponentAsPdf(options: RenderComponentPdfOptions): Promise<void> {
    const host = document.createElement('div');
    host.style.position = 'fixed';
    host.style.left = '-10000px';
    host.style.top = '0';
    host.style.width = options.width ?? '920px';
    host.style.background = '#ffffff';
    document.body.appendChild(host);

    try {
      const compRef = createComponent(options.component, {
        environmentInjector: this.injector,
        hostElement: host,
      });

      for (const [key, value] of Object.entries(options.inputs)) {
        compRef.setInput(key, value);
      }

      compRef.changeDetectorRef.detectChanges();
      this.appRef.attachView(compRef.hostView);
      compRef.changeDetectorRef.detectChanges();

      await new Promise(resolve => setTimeout(resolve, 150));

      const element = host.querySelector(options.selector) as HTMLElement | null;
      if (!element) {
        throw new Error('Document element could not be rendered for PDF export.');
      }

      await this.saveElementAsPdf(element, options.filename);

      this.appRef.detachView(compRef.hostView);
      compRef.destroy();
    } finally {
      document.body.removeChild(host);
    }
  }

  async saveElementAsPdf(element: HTMLElement, filename: string): Promise<void> {
    const blob = await this.elementToPdfBlob(element);
    const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    this.downloadBlob(blob, safeName);
  }

  async renderComponentAsPdfBlob(options: RenderComponentPdfOptions): Promise<Blob> {
    const host = document.createElement('div');
    host.style.position = 'fixed';
    host.style.left = '-10000px';
    host.style.top = '0';
    host.style.width = options.width ?? '920px';
    host.style.background = '#ffffff';
    document.body.appendChild(host);

    try {
      const compRef = createComponent(options.component, {
        environmentInjector: this.injector,
        hostElement: host,
      });

      for (const [key, value] of Object.entries(options.inputs)) {
        compRef.setInput(key, value);
      }

      compRef.changeDetectorRef.detectChanges();
      this.appRef.attachView(compRef.hostView);
      compRef.changeDetectorRef.detectChanges();

      await new Promise(resolve => setTimeout(resolve, 150));

      const element = host.querySelector(options.selector) as HTMLElement | null;
      if (!element) {
        throw new Error('Document element could not be rendered for PDF export.');
      }

      const blob = await this.elementToPdfBlob(element);

      this.appRef.detachView(compRef.hostView);
      compRef.destroy();
      return blob;
    } finally {
      document.body.removeChild(host);
    }
  }

  async renderManyComponentsAsSinglePdf(
    items: RenderComponentPdfOptions[],
    filename: string,
  ): Promise<void> {
    if (!items.length) {
      throw new Error('No documents to export.');
    }

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let index = 0; index < items.length; index++) {
      const host = document.createElement('div');
      host.style.position = 'fixed';
      host.style.left = '-10000px';
      host.style.top = '0';
      host.style.width = items[index].width ?? '920px';
      host.style.background = '#ffffff';
      document.body.appendChild(host);

      try {
        const compRef = createComponent(items[index].component, {
          environmentInjector: this.injector,
          hostElement: host,
        });

        for (const [key, value] of Object.entries(items[index].inputs)) {
          compRef.setInput(key, value);
        }

        compRef.changeDetectorRef.detectChanges();
        this.appRef.attachView(compRef.hostView);
        compRef.changeDetectorRef.detectChanges();
        await new Promise(resolve => setTimeout(resolve, 120));

        const element = host.querySelector(items[index].selector) as HTMLElement | null;
        if (!element) {
          throw new Error('Document element could not be rendered for PDF export.');
        }

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (index > 0) {
          pdf.addPage();
        }

        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          pdf.addPage();
          position = heightLeft - imgHeight;
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pageHeight;
        }

        this.appRef.detachView(compRef.hostView);
        compRef.destroy();
      } finally {
        document.body.removeChild(host);
      }
    }

    const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    this.downloadBlob(pdf.output('blob'), safeName);
  }

  async elementToPdfBlob(element: HTMLElement): Promise<Blob> {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    return pdf.output('blob');
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
