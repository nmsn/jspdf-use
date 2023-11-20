import JsPdf from "jspdf";
import "jspdf-autotable";

type AlignType = "left" | "center" | "right";
type PaddingType = number | { left: number; top: number; right: number; bottom: number };
type ImgType = 'url' | 'base64' | 'blob'

class JspdfUse {
  pdf: JsPdf;
  pageNum: number;
  pageWidth: number;
  pageHeight: number;
  padding:
    | number
    | { left: number; top: number; right: number; bottom: number };
  gap: number;
  x: number;
  y: number;
  fontSize: number;

  constructor(config) {
    const { pageSize = "a4", unit = "px", orientation = "portrait" } = config;

    const pdf = new JsPdf("p", "px", "a4");
    this.pdf = pdf;

    this.pageWidth  = pdf.internal.pageSize.getWidth();
    this.pageHeight = pdf.internal.pageSize.getHeight();
  }

  drawImg(img, {
    x = this.x,
    y = this.y,
    width,
    align: AlignType = "center",
    // TODO 后续自动计算图片类型
    type: ImgType = "base64",
  }) {
    const _padding = typeof this.padding === 'object' ? (this.padding.left + this.padding.right) : this.padding;
    const validWidth = this.pageWidth - _padding;
    
    let _img;
    
    if ()
    
  }

  drawText(
    text: string,
    {
      x = this.x,
      y = this.y,
      fontSize = this.fontSize,
      align: AlignType = "center",
      padding = this.padding,
    }
  ) {
    
    const textWidth = this.pdf.getStringUnitWidth(text) * this.pdf.internal.getFontSize() / this.pdf.internal.scaleFactor;
  }

  drawTitle() {}
}

export default JspdfUse;
