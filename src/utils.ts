export const blobToUrl = (data: BlobPart) => {
  const blob = new Blob([data], { type: "image/jpeg" }); // 假设 data 包含图像数据，类型为 image/jpeg
  const url = URL.createObjectURL(blob);

  return url;
};

export const blob2Base64 = (blob: Blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // 读取文件完成时的回调函数
    reader.onloadend = function () {
      // 读取结果是一个 base64 字符串
      const base64data = reader.result;
      resolve(base64data);
    };

    reader.onerror = function (e) {
      reject(e);
    };

    // 读取二进制文件
    reader.readAsDataURL(blob);

    // resolve(reader.result);
  });
};

export const url2Base64 = (url) => {
  // Image对象转base64
  function imageToBase64(image) {
    const canvas = document.createElement("canvas");
    const width = image.width;
    const height = image.height;

    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  }
  // 回调方式
  function urlToBase64(
    imgUrl: string,
    callback: (url: string) => void | null = null
  ) {
    let image = new Image();

    image.setAttribute("crossOrigin", "Anonymous");
    image.src = imgUrl + "?v=" + Math.random();

    image.onload = function () {
      let dataURL = imageToBase64(image);
      if (callback) {
        callback?.(dataURL);
      }
    };
  }
  return new Promise((resolve) => {
    urlToBase64(url, (data) => {
      resolve(data);
    });
  });
};

export const loadImage = (src: string) => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = function () {
      resolve(image);
    };

    image.onerror = function () {
      reject(new Error("Load failed."));
    };

    image.src = src;
  });
};
