import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type PdfMode = 'print' | 'download'

// function pxToPt(px: number) {
//   return (px * 72) / 96
// }

/**
 * Generate a PDF from a DOM node (same design as the modal).
 * - Uses html2canvas to capture the DOM
 * - Uses jsPDF to paginate and download/print
 */
export async function generateInvoicePdf(
  el: HTMLElement,
  fileName: string,
  mode: PdfMode
) {
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: el.scrollWidth,
    windowHeight: el.scrollHeight,
  })

  const imgData = canvas.toDataURL('image/png')
  // Keep classic A4 portrait width and add explicit margins.
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const marginX = 24
  const marginY = 24

  // Force-fit whole invoice into a single page while preserving aspect ratio.
  const contentWidth = pageWidth - marginX * 2
  const contentHeight = pageHeight - marginY * 2
  const widthScale = contentWidth / canvas.width
  const heightScale = contentHeight / canvas.height
  const scale = Math.min(widthScale, heightScale)
  const imgWidth = canvas.width * scale
  const imgHeight = canvas.height * scale

  const x = marginX + (contentWidth - imgWidth) / 2
  const y = marginY

  // Always render as a single-page PDF.
  pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)

  if (mode === 'download') {
    pdf.save(fileName)
    return
  }

  const blobUrl = pdf.output('bloburl')
  const w = window.open(blobUrl, '_blank', 'noopener,noreferrer')
  if (!w) return
  // Give browser time to load PDF before printing
  setTimeout(() => {
    try {
      w.focus()
      w.print()
    } catch {
      // ignore
    }
  }, 400)
}

