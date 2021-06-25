import React, {Component, createRef} from "react";
import {FILESAMPLE,} from "../Consts/Consts";

// @ts-ignore
import * as pdfjsLib   from "pdfjs-dist/build/pdf";

// @ts-ignore
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

class PdfViewer extends Component {
  private canvasRef: React.RefObject<HTMLCanvasElement> = createRef();
  pdfDocument: any
  totalPages: any;
  canvas: any
  private pagerenderinginprogress: number = 0;
  private currentPage: any;

  constructor(props: any) {
    super(props);
  }

  async componentDidMount() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    this.pagerenderinginprogress = 0;
    this.canvas = document.querySelector('#pdf-canvas');

    let self = this;
    document.querySelector("#show-pdf-button")?.addEventListener('click', function (e) {
      // @ts-ignore
      this.style.display = 'none';
      self.showPDF('https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf');
    });

// click on the "Previous" page button
    document.querySelector("#pdf-prev")?.addEventListener('click', () => {
      if (this.currentPage != 1)
        this.showPage(--this.currentPage);
    });

// click on the "Next" page button
    document.querySelector("#pdf-next")?.addEventListener('click', () => {
      if (this.currentPage != this.totalPages)
        this.showPage(++this.currentPage);
    });

    document.querySelector("#rotateLeft")?.addEventListener('click', e => {
      this.rotatePage(-90);
    })

    document.querySelector("#rotateRight")?.addEventListener('click', e => {
      this.rotatePage(-90);
    })
  }

  showPDF = async (pdf_url: any) => {
    const loader: any = document.querySelector("#pdf-loader");
    if (loader)
      loader.style.display = 'block';

    const getDocTask = pdfjsLib.getDocument({data: FILESAMPLE});
    getDocTask.promise.then(async (d: any) => {
      this.pdfDocument = d;
      // total pages in pdf
      this.totalPages = this.pdfDocument.numPages;

      // Hide the pdf loader and show pdf container
      loader.style.display = 'none';
      const contents: any = document.querySelector("#pdf-contents")
      contents.style.display = 'block';

      const totalPages: any = document.querySelector("#pdf-total-pages");

      totalPages.innerHTML = this.totalPages;

      // show the first page
      await this.showPage(1);
    })
  }

  showPage = async (page_no: any) => {
    this.pagerenderinginprogress = 1;
    this.currentPage = page_no ?? 1;

    // disable Previous & Next buttons while page is being loaded

    const next: any = document.querySelector("#pdf-next");

    if (next)
      next.disabled = true;


    const prev: any = document.querySelector("#pdf-prev");

    if (prev)
      prev.disabled = true;

    // while page is being rendered hide the canvas and show a loading message
    const canvas: any = document.querySelector("#pdf-canvas");

    if (canvas)
      canvas.style.display = 'none';


    const loader: any = document.querySelector("#page-loader");

    if (loader)
      loader.style.display = 'block';

    // update current page
    const currentPage = document.querySelector("#pdf-current-page");

    if (currentPage)
      currentPage.innerHTML = page_no;

    // get handle of page
    this.pdfDocument.getPage(page_no).then(async (p: any) => {
      const page = p;
      // original width of the pdf page at scale 1
      const pdf_original_width = page.getViewport({scale: 1}).width;

      // as the canvas is of a fixed width we need to adjust the scale of the viewport where page is rendered
      const scale_required = this.canvas.width / pdf_original_width;

      // get viewport to render the page at required scale
      const viewport = page.getViewport({scale: scale_required});

      this.canvas.height = viewport.height;

      // setting page loader height for smooth experience
      loader.style.height = this.canvas.height + 'px';
      loader.style.lineHeight = this.canvas.height + 'px';

      const renderContext = {
        canvasContext: this.canvas.getContext('2d'),
        viewport: viewport
      };

      // render the page contents in the canvas
      await page.render(renderContext);

      let textContent = await page.getTextContent();

      this.pagerenderinginprogress = 0;

      // re-enable Previous & Next buttons
      next.disabled = false;
      prev.disabled = false;

      // show the canvas and hide the page loader
      canvas.style.display = 'block';
      loader.style.display = 'none';

      // Canvas height
      const canvas_height = canvas.offsetHeight;
      // Canvas width
      const canvas_width = canvas.offsetWidth;

      // Assign CSS to the textLayer element
      const textLayer: any = document.querySelector("#textLayer");

      if (textLayer) {
        textLayer.style.left = canvas.offsetLeft + 'px';
        textLayer.style.top = canvas.offsetTop + 'px';
        textLayer.style.height = canvas_height + 'px';
        textLayer.style.width = canvas_width + 'px';
      }

      pdfjsLib.renderTextLayer({
        textContent: textContent,
        container: textLayer,
        viewport: viewport,
        textDivs: []
      });
    });

  }

  rotatePage = (number: number) => {
    console.log(number);
  }


  render() {
    return (
      <div className="custom-viewer">
        {/*<canvas id="canvas-layer" ref={this.canvasRef}/>*/}
        {/*<div id="textLayer"/>*/}

        <div className="viewer-control">
          <button id="show-pdf-button">Show PDF</button>
          <div id="page-loader">Loading page ...</div>
          <div id="pdf-loader">Loading document ...</div>
          <div id="pdf-buttons">
            <button id="pdf-prev">Previous</button>
            <button id="pdf-next">Next</button>
          </div>
          <div className="rotations">
            <button id="rotateLeft">rotate Left</button>
            <button id="rotateRight">rotate Right</button>
          </div>
        </div>

        <div id="pdf-main-container">
          <div id="pdf-contents">
            <div id="pdf-meta">
              <div id="page-count-container">Page <div id="pdf-current-page"/> of <div id="pdf-total-pages"/></div>
            </div>
            <canvas id="pdf-canvas" width="900"/>
            <div id="textLayer" className="textLayer"/>
          </div>
        </div>
      </div>
    );
  }


}

export default PdfViewer;