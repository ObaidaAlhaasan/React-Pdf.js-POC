export default class PDFJs {
    init = (source, element) => {
        const iframe = document.createElement('iframe');

        iframe.src = `/pdfjs-2.9.359-dist/web/viewer.html?file=${source}`;
        iframe.width = '100%';
        iframe.height = '800px';

        element.appendChild(iframe);
    }
}