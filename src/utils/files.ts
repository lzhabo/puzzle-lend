import BN from "@src/utils/BN";

export function toFile(b64: string) {
  var arr = b64.split(","),
    mime = arr[0].match(/:(.*?);/)![1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], "file", { type: mime });
}

export const toBase64 = (
  file: File
): Promise<string> => // | ProgressEvent<FileReader>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export function compressImage(base64: string): Promise<string> {
  const canvas = document.createElement("canvas");
  const img = document.createElement("img");

  return new Promise((resolve, reject) => {
    img.onload = function () {
      let width = img.width;
      let height = img.height;
      const maxHeight = 800;
      const maxWidth = 900;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height *= maxWidth / width));
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width *= maxHeight / height));
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx!.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = function (err) {
      reject(err);
    };
    img.src = base64;
  });
}

export const getB64FileLength = (base64String: string): string => {
  const stringLength = base64String.length - "data:image/png;base64,".length;
  const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
  return new BN(sizeInBytes).div(1000).toFormat(2);
};
