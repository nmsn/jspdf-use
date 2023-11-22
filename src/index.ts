import JsPdf from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";
import { blob2Base64, blobToUrl, loadImage, url2Base64, isBlob } from "./utils";

type AlignType = "left" | "center" | "right";
type PaddingType =
  | number
  | { left: number; top: number; right: number; bottom: number };
type ImgType = "url" | "base64" | "blob";

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
  record: unknown[];
  catalog: string;

  constructor(config) {
    const { pageSize = "a4", unit = "px", orientation = "portrait" } = config;

    const pdf = new JsPdf("p", "px", "a4");
    this.pdf = pdf;

    this.pageWidth = pdf.internal.pageSize.getWidth();
    this.pageHeight = pdf.internal.pageSize.getHeight();

    this.record = [];
  }

  async drawImg(
    img: string | Blob,
    {
      x = this.x,
      y = this.y,
      width,
      align = "center",
      // TODO 后续自动计算图片类型
      type = "base64",
    }: {
      x: number;
      y: number;
      width: number;
      align: AlignType;
      // TODO 后续自动计算图片类型
      type: ImgType;
    }
  ) {
    const _padding =
      typeof this.padding === "object"
        ? this.padding.left + this.padding.right
        : this.padding;
    const validMaxWidth = this.pageWidth - _padding;

    // TODO 和下面流程有冗余
    const _img = await (async () => {
      if (type === "blob" || isBlob(img)) {
        const url = blobToUrl(img);

        return await loadImage(url);
      }

      return await loadImage(img);
    })();

    const imgBase64 = (await (async () => {
      if (type === "base64" && typeof img === "string") {
        return img;
      }

      if (type === "url" && typeof img === "string") {
        return await url2Base64(img);
      }

      if (type === "blob" && isBlob(img)) {
        return await blob2Base64(img);
      }

      throw new Error("Image Error");
    })()) as string;

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

    this.pdf.addImage(imgBase64, "JPEG", x, y, _width, _height, "", "FAST");

    const endY = y + _height;

    this.y = endY;
  }

  drawText(
    text: string,
    {
      x = this.x,
      y = this.y,
      fontSize = this.fontSize,
      align = "center",
      padding = this.padding,
    }: {
      x: number;
      y: number;
      fontSize: number;
      align: AlignType;
      padding: PaddingType;
    }
  ) {
    // TODO ts 类型上没有 pdf.internal.getFontSize 实际可执行
    const textWidth =
      (this.pdf.getStringUnitWidth(text) * this.pdf.getFontSize()) /
      this.pdf.internal.scaleFactor;

    const _x = (() => {
      const paddingLeft = typeof padding === "object" ? padding.left : padding;
      if (align === "center") {
        return this.pageWidth - paddingLeft;
      }

      if (align === "left") {
        return paddingLeft;
      }

      if (align === "right") {
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

  addPage() {
    this.pdf.addPage();
  }

  addRecord(text: string, pageNum: number, level: number) {
    this.record.push({
      text,
      pageNum,
      level: 1,
    });
  }

  drawTable({ theme = "grid", ...tableConfig }: UserOptions, { y }) {
    // FIXME autoTable v4 会修改用法
    autoTable(this.pdf, {
      theme,
      ...tableConfig,
    });

    this.y = (
      this.pdf as any as { lastAutoTable: { finalY: number } }
    ).lastAutoTable.finalY;
  }
}

export default JspdfUse;
