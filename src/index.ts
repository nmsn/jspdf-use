import JsPdf from "jspdf";
import "jspdf-autotable";
import { blob2Base64, blobToUrl, loadImage, url2Base64 } from "./utils";

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

  async drawImg(img: BlobPart, {
    x = this.x,
    y = this.y,
    width,
    align = "center",
    // TODO 后续自动计算图片类型
    type = "base64",
  }: {
    x: number,
    y: number,
    width: number,
    align: AlignType,
    // TODO 后续自动计算图片类型
    type: ImgType,
  }) {
    const _padding = typeof this.padding === 'object' ? (this.padding.left + this.padding.right) : this.padding;
    const validMaxWidth = this.pageWidth - _padding;
    
    const _img = await (async () => {
      if (type === 'blob') {
        const url = blobToUrl(img);
        
        return await loadImage(url);
      }
      
      
      return await loadImage(img);
    })();
    
    const imgBase64 = await (async () => {
      if (type === 'base64') {
        return img;
      }
      
      if (type === 'url') {
        return await url2Base64(img);
      }
      
      if (type === 'blob') {
        return await blob2Base64(img);
      }
      
      throw new Error('Image Error');
    })();

    const { width: imgWidth, height: imgHeight } = _img;
    
    let scale = 1;
    const _width = (() => {
      if (width) {
        return width;
      }

      if (imgWidth > validMaxWidth) {
        // TODO 需要进行缩放
        scale = imgWidth / validMaxWidth;
        return validMaxWidth;
      }

      return imgWidth;
    })();

    const _height = scale > 1 ? imgHeight / scale : imgHeight;

    this.pdf.addImage(imgBase64, 'JPEG', x, y, _width, _height, '', 'FAST');

    const endY = y + _height;

    this.y = endY;
  }

  drawText(
    text: string,
    { x = this.x, y = this.y, fontSize = this.fontSize, align = "center", padding = this.padding }:{
      x: number,
      y: number,
      fontSize: number,
      align: AlignType,
      padding: PaddingType,
    }
  ) {

    // TODO ts 类型上没有 pdf.internal.getFontSize 实际可执行
    const textWidth = this.pdf.getStringUnitWidth(text) * this.pdf.getFontSize() / this.pdf.internal.scaleFactor;

    const _x = (() => {
      const paddingLeft = typeof padding === 'object' ? padding.left : padding;
      if (align === 'center') {
        return this.pageWidth - paddingLeft;
      }

      if (align === 'left') {
        return paddingLeft
      }

      if (align === 'right') {
        return this.pageWidth - paddingLeft - textWidth;
      }

      return x;
    })();

    this.pdf.text(text, _x, y);
    this.pdf.setDrawColor(0, 0, 0);

    const endX = x + textWidth;
    const endY = y + this.pdf.getLineHeightFactor() + this.fontSize;

    this.x = endX;
    this.y = endY;
  }

  drawTitle() {}
}

export default JspdfUse;
