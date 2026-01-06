import { LoreType } from "@/types/loreTypes";

export const conData: { _id: string; next: string[] }[] = [
  { _id: "a", next: ["b"] },
  {
    _id: "b",
    next: ["c", "d"],
  },
  { _id: "c", next: ["e", "f", "j", "k", "l", "m", "n"] },
  { _id: "d", next: ["g"] },
  { _id: "e", next: ["h"] },
  { _id: "f", next: ["i"] },
  { _id: "g", next: ["h"] },
  { _id: "h", next: [] },
  { _id: "i", next: [] },
  { _id: "j", next: [] },
  { _id: "k", next: [] },
  { _id: "l", next: [] },
  { _id: "m", next: [] },
  { _id: "n", next: [] },
];

export const nData: Map<string, LoreType> = new Map([
  [
    "a",
    {
      type: "youtube",
      src: "ShB3vNlSdDA",
    },
  ],
  [
    "b",
    {
      title: "Lore B",
      description: `On the Insert tab, the galleries include items that are designed to coordinate with the overall look of your document. You can use these galleries to insert tables, headers, footers, lists, cover pages, and other document building blocks. When you create pictures, charts, or diagrams, they also coordinate with your current document look.

    You can easily change the formatting of selected text in the document text by choosing a look for the selected text from the Quick Styles gallery on the Home tab. You can also format text directly by using the other controls on the Home tab. Most controls offer a choice of using the look from the current theme or using a format that you specify directly.

    To change the overall look of your document, choose new Theme elements on the Page Layout tab. To change the looks available in the Quick Style gallery, use the Change Current Quick Style Set command. Both the Themes gallery and the Quick Styles gallery provide reset commands so that you can always restore the look of your document to the original contained in your current template.
`,
      type: "youtube",
      src: "ShB3vNlSdDA",
      viewsCount: 123456,
      updatedAt: new Date().toISOString(),
      createdBy: "UserNameHandler",
      createdById: "user123",
      likesCount: 7890,
      tags: ["example", "lore"],
    },
  ],
]) as Map<string, LoreType>;

export const lvlData: string[][] = [
  ["a"],
  ["b"],
  ["c", "d"],
  ["e", "f", "g", "j", "k", "l", "m", "n"],
  ["h", "i"],
];
