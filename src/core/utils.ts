export const toRadian = (a: number) => (a * Math.PI) / 180;

export const hexToRgb = (hex: string) => {
  hex = hex.replace(/^#/, "");

  if (!/^(?:[0-9a-fA-F]{3}){1,2}$/.test(hex)) {
    throw new Error("Hex string Invalid");
  }

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const bigint = parseInt(hex, 16);

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return [r / 255, g / 255, b / 255] as [number, number, number];
};
