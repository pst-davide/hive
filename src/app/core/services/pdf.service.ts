import { Injectable } from '@angular/core';
import _ from 'lodash';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  public exportPDF(json: any[], pdfFileName: string, headerName: string = ''): void {
    /*******************
     * Header
     ******************/
    let header: string[] = [];
    Object.keys(json[0]).forEach(x => {
      header = [...header, ...[x]];
    });

    /*******************
     * Body
     ******************/
    let content: any[] = [];
    json.forEach(x => {
      let r: string[] = [];
      Object.keys(x).forEach(y => {
        r = [...r, ...[x[y]]];
      });
      content = _.cloneDeep([...content, ...[r]]);
    });

    /*******************
     * Pdf
     ******************/
    const doc: jsPDF = new jsPDF({
      orientation: header.length > 8 ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    doc.setFontSize(14);
    doc.setTextColor('#ffffff');
    doc.text(headerName, 15, 15);

    /* table */
    autoTable(doc, {
      head: [header],
      body: content,
      theme: 'striped',
      headStyles: {fillColor: '#94a3b8'},
      startY: 25,
      horizontalPageBreak: true
    });
    doc.save(pdfFileName + '.pdf');
  }
}
