import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type PdfMode = 'print' | 'download'

function pxToPt(px: number) {
  return (px * 72) / 96
}

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
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  // Fit image to page width, keep aspect ratio
  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let position = 0
  let remaining = imgHeight

  // Add first page
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  remaining -= pageHeight

  // Add extra pages by shifting y-position upward
  while (remaining > 0) {
    pdf.addPage()
    position -= pageHeight
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    remaining -= pageHeight
  }

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

