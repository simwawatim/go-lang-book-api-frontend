const cloths = ["#2f5d4e", "#7a2e2e", "#26476b", "#9a7424", "#4b3f63", "#3e5c3a", "#6b3f2a"];

export const SHELF_ROW = 250;

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

export function spineStyle(title: string, author: string) {
  const h = hash(title + author);
  const height = 190 + (h % 7) * 9;
  return {
    background: cloths[h % cloths.length],
    height: `${height}px`,
    width: `${46 + (Math.min(title.length, 40) % 5) * 5}px`,
    marginTop: `${SHELF_ROW - height}px`,
  };
}
