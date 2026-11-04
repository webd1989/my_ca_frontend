import { Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

/*
 * In-app PDF viewer (works on iPhone, Android and desktop)
 * - Renders the PDF with pdf.js (assets/pdfjs) so it shows inside the page on every phone
 * - Share  : native share sheet with the PDF file attached (WhatsApp, Gmail, Telegram ...)
 * - Download / Open / WhatsApp client / Copy link
 *
 * Usage (parent component):
 *   <app-pdf-viewer #pdfViewer></app-pdf-viewer>
 *   @ViewChild('pdfViewer') pdfViewer!: PdfViewerComponent;
 *   this.pdfViewer.open({ title, fileName, request$: this.appService.postData(...), ... });
 * The API response must contain pdf_base64 (preferred) or download_url.
 */
export interface PdfViewerOptions {
  title: string;              // e.g. "Invoice #224"
  subtitle?: string;          // e.g. "RIFF Film Club · ₹ 10,000"
  fileName: string;           // e.g. "Invoice-224-RIFF-Film-Club.pdf"
  shareText?: string;         // message sent along with the file
  phone?: string;             // client mobile for "WhatsApp client"
  request$: Observable<any>;  // API call that returns { success, pdf_base64?, download_url? }
}

declare var window: any;

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css']
})
export class PdfViewerComponent implements OnDestroy {

  @ViewChild('pages') pagesRef?: ElementRef<HTMLDivElement>;

  private static pdfJsLoader: Promise<any> | null = null;

  visible = false;
  loading = false;
  rendering = false;
  error = '';
  opts: PdfViewerOptions | null = null;

  file: File | null = null;
  blobUrl = '';
  downloadUrl = '';
  pageCount = 0;
  zoom = 1;
  canShareFiles = false;
  fallbackFrame = false;
  copied = false;

  private bytes: Uint8Array | null = null;
  private pdfDoc: any = null;
  private sub?: Subscription;
  private renderSeq = 0;

  constructor(private zone: NgZone) { }

  ngOnDestroy(): void {
    this.close();
  }

  /* pop-up closes only with the cross button: outside click just "bumps" it */
  nudging = false;
  nudge(){
    this.nudging = false;
    setTimeout(() => { this.nudging = true; setTimeout(() => this.nudging = false, 300); }, 10);
  }

  /* ---------------- open / close ---------------- */
  open(opts: PdfViewerOptions){
    this.reset();
    this.opts = opts;
    this.visible = true;
    this.loading = true;
    document.body.style.overflow = 'hidden';
    this.loadPdfJs().catch(() => null); // warm up pdf.js while the server builds the PDF

    this.sub = opts.request$.subscribe((res: any) => {
      if(!res || !res.success){
        this.fail((res && res.message) || 'Could not generate the PDF.');
        return;
      }
      this.downloadUrl = res.download_url || '';
      if(res.pdf_base64){
        this.setBytes(this.base64ToBytes(res.pdf_base64));
      }else if(this.downloadUrl){
        // older backend without pdf_base64: try to fetch the file directly
        fetch(this.downloadUrl, { cache: 'no-store' })
          .then(r => { if(!r.ok){ throw new Error('HTTP ' + r.status); } return r.arrayBuffer(); })
          .then(buf => this.zone.run(() => this.setBytes(new Uint8Array(buf))))
          .catch(() => this.zone.run(() => this.fail('Preview not available here. Use "Open" or "Download" to view the PDF.')));
      }else{
        this.fail('Could not generate the PDF.');
      }
    }, () => this.fail('Server error while generating the PDF.'));
  }

  close(){
    this.visible = false;
    document.body.style.overflow = '';
    this.reset();
  }

  private reset(){
    if(this.sub){ this.sub.unsubscribe(); this.sub = undefined; }
    if(this.pdfDoc){ try { this.pdfDoc.destroy(); } catch(e){} this.pdfDoc = null; }
    if(this.blobUrl){ URL.revokeObjectURL(this.blobUrl); }
    this.blobUrl = '';
    this.file = null;
    this.bytes = null;
    this.downloadUrl = '';
    this.error = '';
    this.loading = false;
    this.rendering = false;
    this.pageCount = 0;
    this.zoom = 1;
    this.fallbackFrame = false;
    this.copied = false;
    this.renderSeq++;
    if(this.pagesRef){ this.pagesRef.nativeElement.innerHTML = ''; }
  }

  private fail(msg: string){
    this.loading = false;
    this.rendering = false;
    this.error = msg;
  }

  /* ---------------- file prep ---------------- */
  private setBytes(bytes: Uint8Array){
    this.bytes = bytes;
    const name = this.opts ? this.opts.fileName : 'document.pdf';
    const blob = new Blob([bytes], { type: 'application/pdf' });
    try {
      this.file = new File([blob], name, { type: 'application/pdf', lastModified: Date.now() });
    } catch(e) {
      this.file = Object.assign(blob, { name }) as any;
    }
    this.blobUrl = URL.createObjectURL(blob);
    this.canShareFiles = !!(navigator as any).canShare && (() => {
      try { return (navigator as any).canShare({ files: [this.file] }); } catch(e){ return false; }
    })();
    this.loading = false;
    setTimeout(() => this.render(), 30);
  }

  private base64ToBytes(b64: string): Uint8Array {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for(let i = 0; i < bin.length; i++){ out[i] = bin.charCodeAt(i); }
    return out;
  }

  /* ---------------- pdf.js rendering ---------------- */
  private loadPdfJs(): Promise<any> {
    if(window.pdfjsLib){ return Promise.resolve(window.pdfjsLib); }
    if(!PdfViewerComponent.pdfJsLoader){
      PdfViewerComponent.pdfJsLoader = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'assets/pdfjs/pdf.min.js';
        s.async = true;
        s.onload = () => {
          const lib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
          if(!lib){ reject('pdf.js missing'); return; }
          lib.GlobalWorkerOptions.workerSrc = 'assets/pdfjs/pdf.worker.min.js';
          resolve(lib);
        };
        s.onerror = () => { PdfViewerComponent.pdfJsLoader = null; reject('pdf.js load failed'); };
        document.head.appendChild(s);
      });
    }
    return PdfViewerComponent.pdfJsLoader;
  }

  async render(){
    if(!this.bytes || !this.pagesRef){ return; }
    const seq = ++this.renderSeq;
    const host = this.pagesRef.nativeElement;
    this.rendering = true;
    try {
      const lib = await this.loadPdfJs();
      if(!this.pdfDoc){
        this.pdfDoc = await lib.getDocument({ data: this.bytes.slice(), isEvalSupported: false }).promise;
      }
      if(seq !== this.renderSeq){ return; }
      this.pageCount = this.pdfDoc.numPages;
      const avail = Math.max(260, host.clientWidth - 24);
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const frag = document.createDocumentFragment();
      for(let n = 1; n <= this.pdfDoc.numPages; n++){
        const page = await this.pdfDoc.getPage(n);
        if(seq !== this.renderSeq){ return; }
        const base = page.getViewport({ scale: 1 });
        const cssW = Math.round(avail * this.zoom);
        const scale = cssW / base.width;
        const vp = page.getViewport({ scale: scale * dpr });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        canvas.style.width = cssW + 'px';
        canvas.style.height = Math.round(base.height * scale) + 'px';
        canvas.className = 'pdfv-page';
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        frag.appendChild(canvas);
      }
      if(seq !== this.renderSeq){ return; }
      host.innerHTML = '';
      host.appendChild(frag);
      this.zone.run(() => { this.rendering = false; this.fallbackFrame = false; });
    } catch(e) {
      // pdf.js not available: fall back to the browser's own viewer
      if(seq !== this.renderSeq){ return; }
      this.zone.run(() => { this.rendering = false; this.fallbackFrame = true; });
    }
  }

  zoomIn(){ if(this.zoom < 3){ this.zoom = Math.round((this.zoom + 0.25) * 100) / 100; this.render(); } }
  zoomOut(){ if(this.zoom > 0.5){ this.zoom = Math.round((this.zoom - 0.25) * 100) / 100; this.render(); } }
  zoomReset(){ this.zoom = 1; this.render(); }

  /* ---------------- actions (all run inside the tap, so phones allow them) ---------------- */
  async share(){
    if(!this.file){ return; }
    const o = this.opts!;
    if(this.canShareFiles){
      try {
        await (navigator as any).share({ files: [this.file], title: o.title, text: o.shareText || o.title });
      } catch(e: any) {
        if(e && e.name === 'AbortError'){ return; } // user closed the share sheet
        this.download();
      }
      return;
    }
    // no file sharing (most desktops): share a link instead
    if((navigator as any).share && this.downloadUrl){
      try { await (navigator as any).share({ title: o.title, text: o.shareText || o.title, url: this.downloadUrl }); return; } catch(e: any) { if(e && e.name === 'AbortError'){ return; } }
    }
    this.whatsapp(false);
  }

  download(){
    const href = this.blobUrl || this.downloadUrl;
    if(!href){ return; }
    const a = document.createElement('a');
    a.href = href;
    a.download = this.opts ? this.opts.fileName : 'document.pdf';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  openTab(){
    const href = this.blobUrl || this.downloadUrl;
    if(!href){ return; }
    const w = window.open(href, '_blank');
    if(!w){ window.location.href = href; }
  }

  /* toClient = open chat with the client's number (message + download link) */
  whatsapp(toClient = true){
    const o = this.opts!;
    const text = (o.shareText || o.title) + (this.downloadUrl ? '\n\nDownload: ' + this.downloadUrl : '');
    const phone = toClient ? this.waPhone : '';
    const url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text);
    const w = window.open(url, '_blank');
    if(!w){ window.location.href = url; }
  }

  get waPhone(): string {
    const d = String((this.opts && this.opts.phone) || '').replace(/\D/g, '');
    if(d.length === 10){ return '91' + d; }
    if(d.length === 11 && d.charAt(0) === '0'){ return '91' + d.slice(1); }
    return d.length >= 11 ? d : '';
  }

  copyLink(){
    if(!this.downloadUrl){ return; }
    const done = () => this.zone.run(() => { this.copied = true; setTimeout(() => this.copied = false, 1800); });
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(this.downloadUrl).then(done, () => this.copyFallback(done));
    }else{
      this.copyFallback(done);
    }
  }
  private copyFallback(done: () => void){
    const t = document.createElement('textarea');
    t.value = this.downloadUrl;
    t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); done(); } catch(e){}
    document.body.removeChild(t);
  }

  get ready(): boolean { return !!this.file && !this.loading; }
}
