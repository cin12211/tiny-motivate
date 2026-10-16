/**
 * Mochi garden icons (generated from the "Mochi Garden Icons" design sheet).
 *
 * 55 hand-drawn plants, 5 mood flowers
 * and the forest icon used for the "all goals" tab.
 * Each `body` is the inner markup of a 32x32 SVG drawn with `currentColor`,
 * so it can be dropped into `<svg viewBox="0 0 32 32">` and tinted with CSS.
 */

export interface GardenIcon {
  id: number | string
  name?: string
  label?: string
  description: string
  body: string
}

export const VIEWBOX = '0 0 32 32'

export const PLANTS: ReadonlyArray<GardenIcon & { id: number, name: string }> = [
  {
    "id": 1,
    "name": "hạt nảy mầm",
    "description": "ngày đầu tiên, hạt vừa nhú",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M10.5 27.6c.2-3 2.5-5 5.5-5s5.3 2 5.5 5\"/><path d=\"M14 25.4l.5.6M18.2 25l-.4.7\"/><path d=\"M16 22.6v-4.2\"/><path d=\"M16 19.4c-.9-2.4-3.3-3.5-5.4-3c.5 2.3 3 3.5 5.4 3z\"/><path d=\"M16 18.6c.9-2.1 3-3.1 4.9-2.6c-.6 2-2.7 3-4.9 2.6z\"/></g>"
  },
  {
    "id": 2,
    "name": "mầm đôi",
    "description": "hai lá non vươn lên",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6c-.3-4 .6-8.2-.2-12.4\"/><path d=\"M15.9 20c-1.9-3.6-5.7-5-9-3.6c1.4 3.6 5.4 5.2 9 3.6z\"/><path d=\"M14.4 19.2l-4.6-2.1\"/><path d=\"M15.8 15.4c1.2-4 5.2-6.3 9-5.4c-1 3.9-5 5.9-9 5.4z\"/><path d=\"M17.4 14.6l5-3.3\"/></g>"
  },
  {
    "id": 3,
    "name": "bụi cỏ",
    "description": "vài ngọn cỏ có nụ nhỏ",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M9 27.4c0-3.6-1-6.5-3.2-8.6\"/><path d=\"M11.4 27.4c-.2-5 1-9.2 3.4-11.8\"/><path d=\"M14.4 27.4c.6-3-.1-5.8-1.8-8\"/><path d=\"M18 27.4c-.3-6.2 1.6-10.6 4.4-13\"/><path d=\"M21.6 27.4c.2-3.6 1.8-6 4.4-7.2\"/><path d=\"M23.6 27.4c-.4-2.6-1.6-4.4-3.4-5.4\"/><circle cx=\"14.8\" cy=\"14.2\" r=\"1.3\"/><circle cx=\"22.8\" cy=\"12.9\" r=\"1\"/></g>"
  },
  {
    "id": 4,
    "name": "hoa cúc",
    "description": "sáu cánh tròn, một lá",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6c-.4-4.4.4-8.6 0-12.6\"/><path d=\"M16.1 23.2c1.8-2.6 4.8-3.3 7-2.3c-1.5 2.6-4.5 3.3-7 2.3z\"/><circle cx=\"16\" cy=\"10.6\" r=\"2\"/><g transform=\"translate(16 10.6)\"><ellipse cx=\"0\" cy=\"-4.6\" rx=\"1.5\" ry=\"2.3\"/><ellipse cx=\"0\" cy=\"-4.6\" rx=\"1.5\" ry=\"2.3\" transform=\"rotate(60)\"/><ellipse cx=\"0\" cy=\"-4.6\" rx=\"1.5\" ry=\"2.3\" transform=\"rotate(120)\"/><ellipse cx=\"0\" cy=\"-4.6\" rx=\"1.5\" ry=\"2.3\" transform=\"rotate(180)\"/><ellipse cx=\"0\" cy=\"-4.6\" rx=\"1.5\" ry=\"2.3\" transform=\"rotate(240)\"/><ellipse cx=\"0\" cy=\"-4.6\" rx=\"1.5\" ry=\"2.3\" transform=\"rotate(300)\"/></g></g>"
  },
  {
    "id": 5,
    "name": "tulip",
    "description": "bông tulip ba cánh",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M11.8 7.6l2.2 2.6l2-3.2l2 3.2l2.2-2.6v4.6c0 3-1.9 4.8-4.2 4.8s-4.2-1.8-4.2-4.8z\"/><path d=\"M16 17v10.6\"/><path d=\"M16 25.4c-.8-3.2-3.4-5.4-6.2-5.8c0 3.2 2.6 5.6 6.2 5.8z\"/><path d=\"M16 22.8c1.1-2.9 3.6-4.7 6.2-5c-.2 2.9-2.8 4.8-6.2 5z\"/></g>"
  },
  {
    "id": 6,
    "name": "hoa hồng",
    "description": "nụ hồng xoắn, có gai",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M12.4 7.6C13.3 6.9 14.6 6.4 16 6.4c3.2 0 5.6 2.4 5.6 5.4c0 3-2.5 5.1-5.6 5.1s-5.6-2.1-5.6-5.1c0-1.1.3-2 .9-2.9\"/><path d=\"M16 8.9c1.6 0 2.7 1.1 2.7 2.5s-1.1 2.4-2.5 2.4c-1.1 0-2-.8-2-1.9c0-.8.6-1.4 1.4-1.4\"/><path d=\"M16 17c.4 3.6-.3 7.1 0 10.6\"/><path d=\"M16.2 20.6l1.4-.9M15.9 24.2l-1.3-.8\"/><path d=\"M16 22.2c-2-1.3-4.7-1-6.1.6c1.7 1.6 4.4 1.4 6.1-.6z\"/></g>"
  },
  {
    "id": 7,
    "name": "nấm",
    "description": "nấm mũ tròn có đốm",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M6.8 15.6C6.8 10.4 11 6.8 16 6.8s9.2 3.6 9.2 8.8c0 .8-.6 1.3-1.4 1.3H8.2c-.8 0-1.4-.5-1.4-1.3z\"/><path d=\"M12.6 16.9c-.2 3.6-.5 7.2-.9 10.7M19.4 16.9c.2 3.6.5 7.2.9 10.7\"/><path d=\"M14 20.6h4\"/><circle cx=\"11.8\" cy=\"11.6\" r=\"1.3\"/><circle cx=\"17.4\" cy=\"9.6\" r=\"1\"/><circle cx=\"20.8\" cy=\"13\" r=\"1.4\"/><circle cx=\"15\" cy=\"13.6\" r=\".7\"/></g>"
  },
  {
    "id": 8,
    "name": "xương rồng",
    "description": "trong chậu, nở một bông",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9.8 21.6h12.4\"/><path d=\"M10.6 21.6l1.3 6.2h8.2l1.3-6.2\"/><path d=\"M12.4 24.4h7.2\"/><path d=\"M14 21.6v-11c0-1.4.9-2.6 2-2.6s2 1.2 2 2.6v11\"/><path d=\"M14 16.4h-1.9c-1 0-1.7-.8-1.7-1.8v-2.4\"/><path d=\"M18 14.2h1.9c1 0 1.7-.8 1.7-1.8v-1.8\"/><path d=\"M15.3 12.4h.01M16.8 15.2h.01M15.4 18.4h.01\"/><circle cx=\"16\" cy=\"6.6\" r=\"1.2\"/></g>"
  },
  {
    "id": 9,
    "name": "cây chậu",
    "description": "cây lá trong chậu",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10.6 21h10.8\"/><path d=\"M11.2 21l1.2 6.8h7.2l1.2-6.8\"/><path d=\"M16 21v-6.4\"/><path d=\"M16 18.6c-2.2-1-4-3.2-4.8-6\"/><path d=\"M16 17.6c2.2-1 4-3.4 5.2-6.2\"/><path d=\"M11.2 12.6c-2.4-.4-3.6-2.8-3.1-5.1c2.4.3 3.7 2.7 3.1 5.1z\"/><path d=\"M21.2 11.4c.1-2.4 2.3-4.1 4.6-3.9c-.1 2.4-2.3 4.1-4.6 3.9z\"/><path d=\"M16 14.6c-1.7-1.9-1.7-4.8 0-6.8c1.7 2 1.7 4.9 0 6.8z\"/></g>"
  },
  {
    "id": 10,
    "name": "cây táo",
    "description": "tán tròn có quả",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 4.4c2.6 0 4.6 1.9 4.9 4.3c2 .6 3.4 2.4 3.4 4.6c0 2.7-2.2 4.8-4.8 4.8h-7c-2.6 0-4.8-2.1-4.8-4.8c0-2.2 1.4-4 3.4-4.6c.3-2.4 2.3-4.3 4.9-4.3z\"/><path d=\"M14.8 18.1c.3 3.2.2 6.4-.4 9.5M17.2 18.1c-.3 3.2-.2 6.4.4 9.5\"/><path d=\"M16.4 21l1.7-1.6\"/><circle cx=\"12.6\" cy=\"11.4\" r=\"1\"/><circle cx=\"18.8\" cy=\"13.4\" r=\"1\"/><circle cx=\"16.4\" cy=\"9\" r=\".8\"/></g>"
  },
  {
    "id": 11,
    "name": "lá non",
    "description": "một chiếc lá vừa xoè",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6c0-3.5.3-6.5 1-9\"/><path d=\"M17 18.6c-2.8-2.4-3.4-7-1-10.4c3.2 1.6 4.6 6.6 1 10.4z\"/><path d=\"M17 18.6c0-3 .1-6-.9-9\"/></g>"
  },
  {
    "id": 12,
    "name": "cỏ ba lá",
    "description": "ba lá tròn, may mắn",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6c0-3.5-.5-6.5 0-10.6\"/><circle cx=\"16\" cy=\"9.4\" r=\"2.7\"/><circle cx=\"12.4\" cy=\"14\" r=\"2.7\"/><circle cx=\"19.6\" cy=\"14\" r=\"2.7\"/><path d=\"M16 12.1v-1M14.3 13.2l-.8-.4M17.7 13.2l.8-.4\"/><path d=\"M16 23.4c1.4-1.4 3.2-1.8 4.8-1.2\"/></g>"
  },
  {
    "id": 13,
    "name": "hướng dương",
    "description": "bông to mười cánh",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 13.6v14\"/><path d=\"M16 22.6c-2-2.2-5-2.6-7-1.4c1.6 2.2 4.6 2.6 7 1.4z\"/><path d=\"M16 19.6c1.8-2.2 4.6-2.8 6.8-1.8c-1.4 2.2-4.2 2.9-6.8 1.8z\"/><circle cx=\"16\" cy=\"9.8\" r=\"2.8\"/><g transform=\"translate(16 9.8)\"><path d=\"M-1.3 -3.8L0 -6.6L1.3 -3.8\" transform=\"rotate(0)\"/><path d=\"M-1.3 -3.8L0 -6.6L1.3 -3.8\" transform=\"rotate(36)\"/><path d=\"M-1.3 -3.8L0 -6.6L1.3 -3.8\" transform=\"rotate(72)\"/><path d=\"M-1.3 -3.8L0 -6.6L1.3 -3.8\" transform=\"rotate(108)\"/><path d=\"M-1.3 -3.8L0 -6.6L1.3 -3.8\" transform=\"rotate(144)\"/><path d=\"M-1.3 -3.8L0 -6.6L1.3 -3.8\" transform=\"rotate(180)\"/><path d=\"M-1.3 -3.8L0 -6.6L1.3 -3.8\" transform=\"rotate(216)\"/><path d=\"M-1.3 -3.8L0 -6.6L1.3 -3.8\" transform=\"rotate(252)\"/><path d=\"M-1.3 -3.8L0 -6.6L1.3 -3.8\" transform=\"rotate(288)\"/><path d=\"M-1.3 -3.8L0 -6.6L1.3 -3.8\" transform=\"rotate(324)\"/></g><path d=\"M15 9.4h.01M17 9.4h.01M16 11h.01\"/></g>"
  },
  {
    "id": 14,
    "name": "oải hương",
    "description": "ba nhánh nụ tím",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6V9\"/><path d=\"M13.8 27.6L11 15.4\"/><path d=\"M18.2 27.6L21 15.4\"/><circle cx=\"16\" cy=\"6.8\" r=\"1\"/><circle cx=\"14.8\" cy=\"9.2\" r=\"1\"/><circle cx=\"17.2\" cy=\"9.2\" r=\"1\"/><circle cx=\"14.8\" cy=\"11.8\" r=\"1\"/><circle cx=\"17.2\" cy=\"11.8\" r=\"1\"/><circle cx=\"10.6\" cy=\"11.8\" r=\".9\"/><circle cx=\"9.9\" cy=\"14\" r=\".9\"/><circle cx=\"11.7\" cy=\"13.6\" r=\".9\"/><circle cx=\"21.4\" cy=\"11.8\" r=\".9\"/><circle cx=\"22.1\" cy=\"14\" r=\".9\"/><circle cx=\"20.3\" cy=\"13.6\" r=\".9\"/></g>"
  },
  {
    "id": 15,
    "name": "cây thông",
    "description": "ba tầng lá kim",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 4.2c-1 2.4-2.8 4.6-5 6.2c1.6.6 3.4.2 5-.6c1.6.8 3.4 1.2 5 .6c-2.2-1.6-4-3.8-5-6.2z\"/><path d=\"M12.8 10.4c-1.4 2.4-3.4 4.4-5.6 5.8c1.8.8 3.8.4 5.4-.4c1.2.8 2.4 1 3.4 1s2.2-.2 3.4-1c1.6.8 3.6 1.2 5.4.4c-2.2-1.4-4.2-3.4-5.6-5.8\"/><path d=\"M11.6 16.4c-1.6 2.2-3.6 4-6 5.2c2 .9 4.2.6 6-.4c1.4.9 2.9 1.2 4.4 1.2s3-.3 4.4-1.2c1.8 1 4 1.3 6 .4c-2.4-1.2-4.4-3-6-5.2\"/><path d=\"M15 22.6c.2 1.7.1 3.4-.1 5M17.2 22.6c-.1 1.7 0 3.4.2 5\"/><path d=\"M14.2 13.8h.01M18.4 19.2h.01M16.6 8.4h.01\"/></g>"
  },
  {
    "id": 16,
    "name": "cây dừa",
    "description": "thân cong, có trái",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M15 27.6c.6-4.6 1.6-9 3.4-13.2\"/><path d=\"M15.4 23.4l1.6.4M16.3 19.4l1.6.5\"/><path d=\"M18.4 14.4c-2.4-2.6-6-3-8.6-1.6\"/><path d=\"M18.4 14.4c-.6-3.4-3.4-5.6-6.6-5.4\"/><path d=\"M18.4 14.4c1.6-3 4.8-4.4 7.6-3.4\"/><path d=\"M18.4 14.4c3-.6 5.8.8 7 3.4\"/><circle cx=\"17.3\" cy=\"16\" r=\".9\"/><circle cx=\"19.3\" cy=\"16.2\" r=\".9\"/></g>"
  },
  {
    "id": 17,
    "name": "bonsai",
    "description": "cây nhỏ trong khay",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8.6 24h14.8l-1.4 3.8h-12z\"/><path d=\"M15.4 24c.4-2.6-.8-4.6.6-7c1.2-2 3.2-2.4 4-4.4\"/><path d=\"M15.8 18.8c-1.6-.8-3.2-.6-4.6.4\"/><ellipse cx=\"10.8\" cy=\"17.4\" rx=\"3.4\" ry=\"1.9\"/><ellipse cx=\"20.2\" cy=\"10.8\" rx=\"4.6\" ry=\"2.4\"/><path d=\"M13.2 22.4h.01\"/></g>"
  },
  {
    "id": 18,
    "name": "dâu tây",
    "description": "quả dâu có hạt",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 13.4c3 0 5.2 1.6 5.2 4.2c0 3.6-3 6.6-5.2 7.4c-2.2-.8-5.2-3.8-5.2-7.4c0-2.6 2.2-4.2 5.2-4.2z\"/><path d=\"M14 17h.01M18 17h.01M16 19.3h.01M14.4 21h.01M17.6 21h.01\"/><path d=\"M12.6 13.8l1.6-1.8l1.8 1.2l1.8-1.2l1.6 1.8\"/><path d=\"M16 12.6c0-2 .6-3.8 2-5\"/><path d=\"M16 25v2.6\"/></g>"
  },
  {
    "id": 19,
    "name": "cà rốt",
    "description": "củ nằm dưới đất",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 20.2c2.5-.9 4.5.6 7 0M20 20.1c2.4-.6 4.6.6 7 0\"/><path d=\"M12.8 20.4h6.4c0 3-1.3 6-3.2 7.8c-1.9-1.8-3.2-4.8-3.2-7.8z\"/><path d=\"M14.4 23h1.4M16.2 25.2h1.2\"/><path d=\"M16 20.4v-4.6\"/><path d=\"M16 17.8c-1.2-2.6-3.4-4-6-4c.6 2.6 3 4 6 4z\"/><path d=\"M16 17.2c1-3 3.4-4.8 6.2-4.8c-.4 2.8-2.8 4.6-6.2 4.8z\"/><path d=\"M16 15.8c-.4-2.6.2-5 1.8-7\"/></g>"
  },
  {
    "id": 20,
    "name": "nấm đôi",
    "description": "nấm lớn và nấm nhỏ",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M7 17.6c0-4 3-6.8 6.6-6.8s6.6 2.8 6.6 6.8c0 .6-.4 1-1 1H8c-.6 0-1-.4-1-1z\"/><path d=\"M11.4 18.6c-.2 3-.4 6-.7 9M15.8 18.6c.2 3 .4 6 .7 9\"/><path d=\"M19 23c0-2.4 1.8-4 4-4s4 1.6 4 4c0 .4-.3.6-.6.6h-6.8c-.3 0-.6-.2-.6-.6z\"/><path d=\"M21.6 23.6l-.3 4M24.4 23.6l.3 4\"/><circle cx=\"11\" cy=\"14.4\" r=\".9\"/><circle cx=\"15.6\" cy=\"13.6\" r=\"1.1\"/><circle cx=\"23\" cy=\"21.2\" r=\".6\"/></g>"
  },
  {
    "id": 21,
    "name": "bồ công anh",
    "description": "hạt sắp bay đi",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6c-.4-5 .4-10 0-14.6\"/><circle cx=\"16\" cy=\"9.4\" r=\"1.2\"/><g transform=\"translate(16 9.4)\"><path d=\"M0 -1.8V-4.4M-.9 -5.2L0 -4.4L.9 -5.2\" transform=\"rotate(0)\"/><path d=\"M0 -1.8V-4.4M-.9 -5.2L0 -4.4L.9 -5.2\" transform=\"rotate(45)\"/><path d=\"M0 -1.8V-4.4M-.9 -5.2L0 -4.4L.9 -5.2\" transform=\"rotate(90)\"/><path d=\"M0 -1.8V-4.4M-.9 -5.2L0 -4.4L.9 -5.2\" transform=\"rotate(135)\"/><path d=\"M0 -1.8V-4.4M-.9 -5.2L0 -4.4L.9 -5.2\" transform=\"rotate(180)\"/><path d=\"M0 -1.8V-4.4M-.9 -5.2L0 -4.4L.9 -5.2\" transform=\"rotate(225)\"/><path d=\"M0 -1.8V-4.4M-.9 -5.2L0 -4.4L.9 -5.2\" transform=\"rotate(270)\"/><path d=\"M0 -1.8V-4.4M-.9 -5.2L0 -4.4L.9 -5.2\" transform=\"rotate(315)\"/></g><path d=\"M16 25c-1.6-.4-2.4-1.8-3.6-1.6c.4-.8-.4-1.6-1.4-2c1-.4 1.6.2 2.4-.4c.8 1.2 2.2 2.4 2.6 4z\"/><path d=\"M24.4 5.6v2.2M23.5 4.8l.9.8l.9-.8\"/></g>"
  },
  {
    "id": 22,
    "name": "cây tre",
    "description": "hai thân có đốt",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M12.4 27.6V6.4M14.6 27.6V6.4M12.4 12.6h2.2M12.4 19h2.2\"/><path d=\"M18.6 27.6V11M20.8 27.6V11M18.6 16.6h2.2M18.6 22.4h2.2\"/><path d=\"M14.6 12.6c2-1.4 4-1.6 6-.6c-2 1.4-4 1.6-6 .6z\"/><path d=\"M12.4 19c-1.8-1.4-4-1.8-6-1c1.6 1.6 4 1.8 6 1z\"/><path d=\"M20.8 16.6c1.6-1 3.4-1 5-.2c-1.6 1.2-3.4 1.2-5 .2z\"/></g>"
  },
  {
    "id": 23,
    "name": "hoa sen",
    "description": "nở trên mặt nước",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 26.4c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M9.4 29.4c2-.6 3.6.4 5.6 0s3.6-.4 5.6 0\"/><path d=\"M16 22.4c-2.2-2.4-2.2-6.4 0-9c2.2 2.6 2.2 6.6 0 9z\"/><path d=\"M16 22.4c-3.2-.2-5.6-2.6-6-6c3 .4 5.4 2.6 6 6z\"/><path d=\"M16 22.4c3.2-.2 5.6-2.6 6-6c-3 .4-5.4 2.6-6 6z\"/><path d=\"M10.6 22.4h10.8c-.6 1.6-2.8 2.6-5.4 2.6s-4.8-1-5.4-2.6z\"/></g>"
  },
  {
    "id": 24,
    "name": "bụi hoa",
    "description": "bụi tròn nở hoa",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M7.4 27.4c-1.4-1.4-1.8-3.8-.6-5.6c-.6-2.4 1-4.6 3.4-4.8c.8-2.4 3.4-3.8 5.8-3c2-1.6 5-1.2 6.4 1c2.4.2 4 2.4 3.6 4.8c1.4 1.8 1.2 4.4-.4 5.8\"/><g stroke-width=\"1.2\" transform=\"translate(11 21.4)\"><circle cx=\"0.00\" cy=\"-1.60\" r=\".75\"/><circle cx=\"1.52\" cy=\"-0.49\" r=\".75\"/><circle cx=\"0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-1.52\" cy=\"-0.49\" r=\".75\"/></g><g stroke-width=\"1.2\" transform=\"translate(16.6 18.4)\"><circle cx=\"0.00\" cy=\"-1.60\" r=\".75\"/><circle cx=\"1.52\" cy=\"-0.49\" r=\".75\"/><circle cx=\"0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-1.52\" cy=\"-0.49\" r=\".75\"/></g><g stroke-width=\"1.2\" transform=\"translate(21.2 22.2)\"><circle cx=\"0.00\" cy=\"-1.60\" r=\".75\"/><circle cx=\"1.52\" cy=\"-0.49\" r=\".75\"/><circle cx=\"0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-1.52\" cy=\"-0.49\" r=\".75\"/></g><path d=\"M15.4 24.4h.01\"/></g>"
  },
  {
    "id": 25,
    "name": "hoa chuông",
    "description": "ba chuông nhỏ rủ xuống",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M11 27.6c0-9.6 2-15.6 6.6-18c3.4-1.6 6.6-.2 7.4 2.8\"/><g transform=\"translate(14.9 13.5)\"><path d=\"M0 -1.8V0\"/><path d=\"M-1.7 2.9c0-1.7.8-2.7 1.7-2.7s1.7 1 1.7 2.7l.6.9h-4.6z\"/></g><g transform=\"translate(22.3 11.1)\"><path d=\"M0 -1.8V0\"/><path d=\"M-1.7 2.9c0-1.7.8-2.7 1.7-2.7s1.7 1 1.7 2.7l.6.9h-4.6z\"/></g><g transform=\"translate(25.0 14.2)\"><path d=\"M0 -1.8V0\"/><path d=\"M-1.7 2.9c0-1.7.8-2.7 1.7-2.7s1.7 1 1.7 2.7l.6.9h-4.6z\"/></g><path d=\"M10.8 27.6c-3-2.4-3.8-7.4-2-10.6c2.6 2.2 3.4 6.8 2 10.6z\"/></g>"
  },
  {
    "id": 26,
    "name": "cây giống",
    "description": "ba lá, buộc cọc",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6v-14\"/><path d=\"M16 14.6c-1.4-2.4-1.4-5 0-7.4c1.4 2.4 1.4 5 0 7.4z\"/><path d=\"M16 18.8c-2.4-.4-4-2.2-4.4-4.6c2.4.2 4.2 2 4.4 4.6z\"/><path d=\"M16 21.6c2.4-.4 4-2.2 4.4-4.6c-2.4.2-4.2 2-4.4 4.6z\"/><path d=\"M22.4 27.6V15.4\"/><path d=\"M16 24.2l6.4-.8\"/></g>"
  },
  {
    "id": 27,
    "name": "sen đá",
    "description": "hoa thị trong chậu",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9.6 21.2c4.2-.4 8.6-.4 12.8 0c-.2 2.4-.8 4.6-1.6 6.4c-3.2.4-6.4.4-9.6 0c-.8-1.8-1.4-4-1.6-6.4z\"/><path d=\"M10.4 23.4c3.8.3 7.4.3 11.2 0\"/><path d=\"M16 21c-1.6-2-1.8-4.6-.2-7.2c1.8 2.3 1.8 5 .2 7.2z\"/><path d=\"M15.4 21c-2.8-.2-4.8-2-5.6-4.6c2.8.2 4.8 2 5.6 4.6z\"/><path d=\"M16.6 21c2.8-.2 4.8-2 5.6-4.6c-2.8.2-4.8 2-5.6 4.6z\"/><path d=\"M14.8 21.2c-3.2.8-6 .2-7.8-1.8c2.8-1 5.4-.4 7.8 1.8z\"/><path d=\"M17.2 21.2c3.2.8 6 .2 7.8-1.8c-2.8-1-5.4-.4-7.8 1.8z\"/><path d=\"M16 18.8v-2.2\"/><path d=\"M13.2 25.4h.01M18.6 25.8h.01\"/></g>"
  },
  {
    "id": 28,
    "name": "hoa anh đào",
    "description": "cây nở đầy hoa",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M15 27.6c.4-3 .2-6-1.4-8.4M17.4 27.6c-.2-3 .4-5.6 2-8\"/><path d=\"M14 20.4c-1.8-.8-3.4-2.4-4-4.4M18.8 20.2c1.6-1.2 3-3 3.4-5.2M16.2 21.6c0-3 .2-6 0-9\"/><g stroke-width=\"1.2\" transform=\"translate(9.4 13.8)\"><circle cx=\"0.00\" cy=\"-1.60\" r=\".75\"/><circle cx=\"1.52\" cy=\"-0.49\" r=\".75\"/><circle cx=\"0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-1.52\" cy=\"-0.49\" r=\".75\"/></g><g stroke-width=\"1.2\" transform=\"translate(13 9.6)\"><circle cx=\"0.00\" cy=\"-1.60\" r=\".75\"/><circle cx=\"1.52\" cy=\"-0.49\" r=\".75\"/><circle cx=\"0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-1.52\" cy=\"-0.49\" r=\".75\"/></g><g stroke-width=\"1.2\" transform=\"translate(16.4 10.6)\"><circle cx=\"0.00\" cy=\"-1.60\" r=\".75\"/><circle cx=\"1.52\" cy=\"-0.49\" r=\".75\"/><circle cx=\"0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-1.52\" cy=\"-0.49\" r=\".75\"/></g><g stroke-width=\"1.2\" transform=\"translate(20.2 7.8)\"><circle cx=\"0.00\" cy=\"-1.60\" r=\".75\"/><circle cx=\"1.52\" cy=\"-0.49\" r=\".75\"/><circle cx=\"0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-1.52\" cy=\"-0.49\" r=\".75\"/></g><g stroke-width=\"1.2\" transform=\"translate(22.6 13.2)\"><circle cx=\"0.00\" cy=\"-1.60\" r=\".75\"/><circle cx=\"1.52\" cy=\"-0.49\" r=\".75\"/><circle cx=\"0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-1.52\" cy=\"-0.49\" r=\".75\"/></g><g stroke-width=\"1.2\" transform=\"translate(12.6 15.4)\"><circle cx=\"0.00\" cy=\"-1.60\" r=\".75\"/><circle cx=\"1.52\" cy=\"-0.49\" r=\".75\"/><circle cx=\"0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-1.52\" cy=\"-0.49\" r=\".75\"/></g></g>"
  },
  {
    "id": 29,
    "name": "hoa dại",
    "description": "ba bông khác nhau",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M11 27.6c0-4-.6-7-2-9.6\"/><path d=\"M16 27.6c0-5 .4-9.4 0-13\"/><path d=\"M21 27.6c0-3.6.8-6.4 2.4-8.6\"/><g stroke-width=\"1.2\" transform=\"translate(8.6 16)\"><circle cx=\"0.00\" cy=\"-1.60\" r=\".75\"/><circle cx=\"1.52\" cy=\"-0.49\" r=\".75\"/><circle cx=\"0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-1.52\" cy=\"-0.49\" r=\".75\"/></g><circle cx=\"16\" cy=\"11.6\" r=\"1.3\"/><g transform=\"translate(16 11.6)\"><path d=\"M0 -2.2c-1 -1 -1 -2.4 0 -3.2c1 .8 1 2.2 0 3.2z\" transform=\"rotate(0)\"/><path d=\"M0 -2.2c-1 -1 -1 -2.4 0 -3.2c1 .8 1 2.2 0 3.2z\" transform=\"rotate(60)\"/><path d=\"M0 -2.2c-1 -1 -1 -2.4 0 -3.2c1 .8 1 2.2 0 3.2z\" transform=\"rotate(120)\"/><path d=\"M0 -2.2c-1 -1 -1 -2.4 0 -3.2c1 .8 1 2.2 0 3.2z\" transform=\"rotate(180)\"/><path d=\"M0 -2.2c-1 -1 -1 -2.4 0 -3.2c1 .8 1 2.2 0 3.2z\" transform=\"rotate(240)\"/><path d=\"M0 -2.2c-1 -1 -1 -2.4 0 -3.2c1 .8 1 2.2 0 3.2z\" transform=\"rotate(300)\"/></g><g transform=\"translate(23.8 17.8)\"><path d=\"M-1.6 1.6c0-1.6.7-2.6 1.6-2.6s1.6 1 1.6 2.6l.6.9h-4.4z\"/></g><path d=\"M16 22.4c-1.6-1.4-3.6-1.6-5-.8\"/><path d=\"M21.2 24.4c1.2-1 2.6-1.2 3.8-.6\"/></g>"
  },
  {
    "id": 30,
    "name": "đậu leo",
    "description": "dây leo quanh cọc",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6V5.2\"/><path d=\"M16 26c3-1 3-3.4 0-4.4s-3-3.4 0-4.4s3-3.4 0-4.4s-3-3 0-4\"/><path d=\"M18.6 24.2c1.6-.4 3 .2 3.6 1.4c-1.6.6-3 .2-3.6-1.4z\"/><path d=\"M13.4 19.6c-1.6-.4-3 .2-3.6 1.4c1.6.6 3 .2 3.6-1.4z\"/><path d=\"M18.6 15.4c1.6-.4 3 .2 3.6 1.4c-1.6.6-3 .2-3.6-1.4z\"/><path d=\"M13.4 10.8c-1.6-.4-3 .2-3.6 1.4c1.6.6 3 .2 3.6-1.4z\"/><path d=\"M16 8.8c1.4-.4 2.2-1.6 1.6-2.8\"/></g>"
  },
  {
    "id": 31,
    "name": "loa kèn",
    "description": "một bông cuộn tròn",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6c0-5 .2-9.6 0-13.6\"/><path d=\"M16 14c-3-1-4.4-4.4-3.2-7.8c2.6.4 5 1.8 6.4 4.2c.8 1.4.6 2.8-.4 3.6z\"/><path d=\"M15.4 12.2l1.4-3.6\"/><path d=\"M16 24.4c-2.8-.6-4.6-3-4.6-6c2.8.4 4.6 2.8 4.6 6z\"/></g>"
  },
  {
    "id": 32,
    "name": "xương rồng tròn",
    "description": "nở hoa trên đỉnh",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 22h12l-1.4 5.8h-9.2z\"/><path d=\"M11 22c-.6-1.4-1-2.8-1-4.4c0-3.6 2.8-6 6-6s6 2.4 6 6c0 1.6-.4 3-1 4.4\"/><path d=\"M14 21.8c-.6-2.4-.6-5 .4-7.6M18 21.8c.6-2.4.6-5-.4-7.6\"/><g stroke-width=\"1.2\" transform=\"translate(16 9.6)\"><circle cx=\"0.00\" cy=\"-1.60\" r=\".75\"/><circle cx=\"1.52\" cy=\"-0.49\" r=\".75\"/><circle cx=\"0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-1.52\" cy=\"-0.49\" r=\".75\"/></g><path d=\"M12.2 17.4h.01M20 18h.01M16 19.6h.01\"/></g>"
  },
  {
    "id": 33,
    "name": "lá phong",
    "description": "lá năm thuỳ",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6v-8\"/><path d=\"M16 19.6l-1.2-2.6l-3.4 1l.8-2.8l-3.2-2l2.6-.8l-.6-3l2.8 1.2l.6-2l1.8 2.2l.4-4l1.4 2.4l1.4-2.4l.4 4l1.8-2.2l.6 2l2.8-1.2l-.6 3l2.6.8l-3.2 2l.8 2.8l-3.4-1z\"/><path d=\"M16 19.6v-8.4\"/></g>"
  },
  {
    "id": 34,
    "name": "cây bắp",
    "description": "có trái và cờ bắp",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6V8\"/><path d=\"M16 24c-3-1-6-.4-8.6 1.6\"/><path d=\"M16 18.4c3-1.6 6-1.6 8.6-.2\"/><path d=\"M16 12.4c-2.4-1.4-5-1.6-7-.8\"/><ellipse cx=\"19.2\" cy=\"13.4\" rx=\"1.8\" ry=\"3.4\" transform=\"rotate(25 19.2 13.4)\"/><path d=\"M18.4 12.2l1.6.6M17.9 14l1.6.6\"/><path d=\"M16 8l-1.4-2.4M16 8l1.4-2.4M16 8V5\"/></g>"
  },
  {
    "id": 35,
    "name": "cà chua",
    "description": "hai quả chín",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6c0-4 .4-8 0-13\"/><path d=\"M16 21c-1.8-1-3.8-.8-5 .6\"/><path d=\"M16 17.4c1.8-1 3.8-.8 5 .6\"/><path d=\"M16 15c-1.2-.4-2.2-1-3.2-2\"/><circle cx=\"11.6\" cy=\"14.8\" r=\"2.4\"/><path d=\"M11.6 12.4l-.8-1M11.6 12.4l.9-.9\"/><circle cx=\"21.2\" cy=\"20.4\" r=\"2.2\"/><path d=\"M21.2 18.2l-.7-.9M21.2 18.2l.8-.8\"/><path d=\"M16 14.6c1.4-.4 2.4-1.4 3-2.6\"/></g>"
  },
  {
    "id": 36,
    "name": "cẩm tú cầu",
    "description": "chùm hoa tròn",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6v-10.4\"/><path d=\"M16 23c-2-1.6-4.6-1.8-6.4-.6c1.8 1.6 4.4 1.8 6.4.6z\"/><path d=\"M16 21.6c2-1.6 4.6-1.8 6.4-.6c-1.8 1.6-4.4 1.8-6.4.6z\"/><circle cx=\"16\" cy=\"11.2\" r=\"6\"/><path d=\"M12.299999999999999 9h1.8M13.2 8.1v1.8\"/><path d=\"M15.499999999999998 7.8h1.8M16.4 6.8999999999999995v1.8\"/><path d=\"M18.1 10h1.8M19 9.1v1.8\"/><path d=\"M13.5 12.4h1.8M14.4 11.5v1.8\"/><path d=\"M16.700000000000003 13.4h1.8M17.6 12.5v1.8\"/><path d=\"M11.7 14.4h1.8M12.6 13.5v1.8\"/><path d=\"M19.1 14h1.8M20 13.1v1.8\"/></g>"
  },
  {
    "id": 37,
    "name": "bông lúa",
    "description": "hạt trĩu cong",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6c0-6 .6-12 2.6-17\"/><ellipse cx=\"17.6\" cy=\"11.8\" rx=\"0.9\" ry=\"1.7\" transform=\"rotate(-30 17.6 11.8)\"/><ellipse cx=\"19.6\" cy=\"12.8\" rx=\"0.9\" ry=\"1.7\" transform=\"rotate(40 19.6 12.8)\"/><ellipse cx=\"17.1\" cy=\"14.8\" rx=\"0.9\" ry=\"1.7\" transform=\"rotate(-35 17.1 14.8)\"/><ellipse cx=\"19.2\" cy=\"15.8\" rx=\"0.9\" ry=\"1.7\" transform=\"rotate(35 19.2 15.8)\"/><ellipse cx=\"18.9\" cy=\"9.2\" rx=\"0.9\" ry=\"1.7\" transform=\"rotate(10 18.9 9.2)\"/><path d=\"M16 22c-2.4-2-5-2.6-7.6-2\"/><path d=\"M13 27.6c0-4-.6-7-2-10\"/><ellipse cx=\"10.6\" cy=\"16.2\" rx=\"0.8\" ry=\"1.5\" transform=\"rotate(-20 10.6 16.2)\"/></g>"
  },
  {
    "id": 38,
    "name": "cây liễu",
    "description": "cành rủ xuống",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M15 27.6c.6-3.6.4-7-.6-10M17.4 27.6c-.2-3.4.2-6.6 1.2-9.6\"/><path d=\"M7 15c1.6-5.6 5-8.6 9-8.6s7.4 3 9 8.6\"/><path d=\"M9 14v6M11.6 11.2v8.2M14 9.6v6M18 9.6v6M20.4 11.2v8.2M23 14v6\"/></g>"
  },
  {
    "id": 39,
    "name": "chậu treo",
    "description": "dây leo buông xuống",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M16 3.4v2.2\"/><path d=\"M16 5.6L10.6 15M16 5.6l5.4 9.4\"/><path d=\"M10 15h12l-1.6 5.4h-8.8z\"/><path d=\"M11.8 20.4c-.6 2.6-.2 5 1 7\"/><path d=\"M20.2 20.4c.8 2.4.6 4.6-.6 6.6\"/><path d=\"M12 23.6c-1.2-.2-2-1-2.2-2c1.2.1 2 .9 2.2 2z\"/><path d=\"M13 27c-1.2.2-2.2-.2-2.8-1c1-.4 2.2 0 2.8 1z\"/><path d=\"M20.8 23.6c1.2-.2 2-1 2.2-2c-1.2.1-2 .9-2.2 2z\"/><path d=\"M13.2 15c-.4-1.4 0-2.6 1.2-3.2c.4 1.2 0 2.4-1.2 3.2z\"/><path d=\"M18.8 15c.4-1.4 0-2.6-1.2-3.2c-.4 1.2 0 2.4 1.2 3.2z\"/></g>"
  },
  {
    "id": 40,
    "name": "mầm trên đá",
    "description": "mọc từ khe đá",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M7 27.6c-.4-3 1.4-6 4.4-7c1.6-2 4.6-2.6 7-1.6c2.8-.2 5.4 1.8 6 4.6c.6 1.4.6 2.8.2 4\"/><path d=\"M10.4 22.4l.6-.8l.6.8M13.6 20.4l.6-.8l.6.8M21.4 21.4l.6-.8l.6.8\"/><path d=\"M18.6 18.6v-4\"/><path d=\"M18.6 15c-.8-2.2-3-3.2-5-2.6c.6 2 2.8 3 5 2.6z\"/><path d=\"M18.6 14.6c.8-2 2.8-3 4.6-2.4c-.6 1.8-2.6 2.8-4.6 2.4z\"/><path d=\"M16.4 24.6l1.4-1.6l-.6-1.6\"/></g>"
  },
  {
    "id": 41,
    "name": "bình hoa",
    "description": "ba bông trong bình",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12.6 18h6.8c.4 1.6.2 2.6-.6 3.6c1.6 1.6 2 3.6 1.2 6.2h-7.4c-.8-2.6-.4-4.6 1.2-6.2c-.8-1-1-2-.6-3.6z\"/><path d=\"M16 18c0-3 .2-6 0-8.6M15 18c-1.4-2.4-2.6-4.6-4-6M17 18c1.4-2.4 2.8-4.2 4.4-5.2\"/><circle cx=\"16\" cy=\"7.6\" r=\"1.7\"/><g stroke-width=\"1.2\" transform=\"translate(10.4 10.6)\"><circle cx=\"0.00\" cy=\"-1.60\" r=\".75\"/><circle cx=\"1.52\" cy=\"-0.49\" r=\".75\"/><circle cx=\"0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-1.52\" cy=\"-0.49\" r=\".75\"/></g><path d=\"M20.4 10.4l.7.9l.7-1l.7 1l.7-.9v1.6c0 1-.6 1.6-1.4 1.6s-1.4-.6-1.4-1.6z\"/></g>"
  },
  {
    "id": 42,
    "name": "nấm kim châm",
    "description": "chùm nấm thân dài",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M14 27.6c0-6-1-11-3-15M16 27.6c0-6.4 0-12 .4-16M18 27.6c0-6 1-11 3.2-14.6\"/><ellipse cx=\"10.8\" cy=\"11.6\" rx=\"1.8\" ry=\"1.2\" transform=\"rotate(-20 10.8 11.6)\"/><ellipse cx=\"16.4\" cy=\"10.6\" rx=\"1.8\" ry=\"1.2\" transform=\"rotate(0 16.4 10.6)\"/><ellipse cx=\"21.4\" cy=\"12.2\" rx=\"1.8\" ry=\"1.2\" transform=\"rotate(20 21.4 12.2)\"/><path d=\"M12.6 27.6c-.6-3.6-1.6-6.4-3.2-8.6\"/><ellipse cx=\"9\" cy=\"18.2\" rx=\"1.4\" ry=\"1\" transform=\"rotate(-30 9 18.2)\"/></g>"
  },
  {
    "id": 43,
    "name": "cây quất",
    "description": "chậu quất ngày Tết",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M11 21.6h10l-1.2 6.2h-7.6z\"/><path d=\"M16 21.6v-4.4\"/><path d=\"M16 17.2l-2-2\"/><circle cx=\"16\" cy=\"11\" r=\"6.2\"/><circle cx=\"13.2\" cy=\"9.4\" r=\"1\"/><circle cx=\"18.4\" cy=\"8.4\" r=\"1\"/><circle cx=\"17.6\" cy=\"13\" r=\"1\"/><circle cx=\"12.8\" cy=\"13.2\" r=\"1\"/><circle cx=\"20.2\" cy=\"11.6\" r=\"1\"/></g>"
  },
  {
    "id": 44,
    "name": "nha đam",
    "description": "lá dày có gai",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M15 27.6c-.6-5-.2-10.4 1-15.6c.8 5.2.8 10.6 0 15.6\"/><path d=\"M14 27.6c-2.2-3.6-4.4-7.6-5.4-12c2.6 3 4.6 7 5.4 12\"/><path d=\"M18 27.6c2.2-3.6 4.4-7.6 5.4-12c-2.6 3-4.6 7-5.4 12\"/><path d=\"M12.6 27.6c-2.4-1.6-4.4-3.6-6-6.2c2.8.8 4.8 3 6 6.2\"/><path d=\"M19.4 27.6c2.4-1.6 4.4-3.6 6-6.2c-2.8.8-4.8 3-6 6.2\"/><path d=\"M11.2 20h.01M20.8 20h.01M16.2 17.4h.01\"/></g>"
  },
  {
    "id": 45,
    "name": "hoa ly",
    "description": "ba cánh nhọn",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6c0-5 .4-9 0-13\"/><path d=\"M16 14.4c-2.6-.6-4.8-2.6-5.6-5.4c2.8.2 5 2 5.6 5.4z\"/><path d=\"M16 14.4c2.6-.6 4.8-2.6 5.6-5.4c-2.8.2-5 2-5.6 5.4z\"/><path d=\"M16 14.4c-1.4-2.4-1.4-5.4 0-8c1.4 2.6 1.4 5.6 0 8z\"/><path d=\"M16 14.4l-2.4-1.4M16 14.4l2.4-1.4\"/><path d=\"M16 24c-3-1-4.8-3.6-5-6.4c2.8 1 4.6 3.4 5 6.4z\"/></g>"
  },
  {
    "id": 46,
    "name": "hạt sồi nảy mầm",
    "description": "mầm mọc từ quả sồi",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M11.6 22.4c0-2.4 2-4 4.4-4s4.4 1.6 4.4 4z\"/><path d=\"M12.4 22.4c0 3 1.6 5.2 3.6 5.2s3.6-2.2 3.6-5.2\"/><path d=\"M13.6 20.6h.01M16 19.8h.01M18.4 20.6h.01\"/><path d=\"M16 18.4c0-2.6.6-4.6 2-6.4\"/><path d=\"M18 12c1.8-1.6 4.4-1.8 6.4-.6c-1.8 1.8-4.4 2-6.4.6z\"/><path d=\"M16.8 14.8c-1.6-1-3.6-1-5 .2c1.6 1 3.6 1 5-.2z\"/></g>"
  },
  {
    "id": 47,
    "name": "bí ngô",
    "description": "quả tròn có tua",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 18.6c-1.4-1-3.6-1-5.2 0c-2.6 1.6-3 5.6-.8 7.8c1.4 1.4 3.6 1.6 6 .8c2.4.8 4.6.6 6-.8c2.2-2.2 1.8-6.2-.8-7.8c-1.6-1-3.8-1-5.2 0z\"/><path d=\"M16 18.6c-1.4 2.6-1.4 5.8 0 8.6M16 18.6c1.4 2.6 1.4 5.8 0 8.6\"/><path d=\"M16 18.6c0-1.8.6-3 1.8-4\"/><path d=\"M17.8 14.6c1.6-1.6 4-1.4 4.4.4c.2 1-.6 1.8-1.4 1.4\"/><path d=\"M15.6 15.6c-1.6-1.8-4.2-2.2-6.2-1c1.6 1.8 4.2 2.2 6.2 1z\"/></g>"
  },
  {
    "id": 48,
    "name": "củ cải",
    "description": "củ tròn dưới đất",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 20.2c2.5-.9 4.5.6 7 0M20.4 20.1c2.4-.6 4.6.6 6.6 0\"/><path d=\"M16 20.4c-2.8 0-4.4 1.6-4.4 3.6c0 2 2 3.6 4.4 3.6s4.4-1.6 4.4-3.6c0-2-1.6-3.6-4.4-3.6z\"/><path d=\"M16 27.6v1.8\"/><path d=\"M14 23.6h.01M17.8 24.8h.01\"/><path d=\"M16 20.4c-.8-3-3-5-5.6-5.4c-.2 2.8 2.2 5 5.6 5.4z\"/><path d=\"M16 20.4c.8-3 3-5 5.6-5.4c.2 2.8-2.2 5-5.6 5.4z\"/><path d=\"M16 20.4c-.6-3.4 0-6.6 1.6-9\"/></g>"
  },
  {
    "id": 49,
    "name": "thuỷ tiên",
    "description": "bông sáu cánh",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6c0-5 0-10-.4-14.4\"/><circle cx=\"15.6\" cy=\"10.4\" r=\"1.4\"/><circle cx=\"15.6\" cy=\"10.4\" r=\"2.4\"/><g transform=\"translate(15.6 10.4)\"><path d=\"M-1.2 -2.6L0 -5.6L1.2 -2.6\" transform=\"rotate(0)\"/><path d=\"M-1.2 -2.6L0 -5.6L1.2 -2.6\" transform=\"rotate(60)\"/><path d=\"M-1.2 -2.6L0 -5.6L1.2 -2.6\" transform=\"rotate(120)\"/><path d=\"M-1.2 -2.6L0 -5.6L1.2 -2.6\" transform=\"rotate(180)\"/><path d=\"M-1.2 -2.6L0 -5.6L1.2 -2.6\" transform=\"rotate(240)\"/><path d=\"M-1.2 -2.6L0 -5.6L1.2 -2.6\" transform=\"rotate(300)\"/></g><path d=\"M14.4 27.6c-.4-4-1.6-7.4-3.6-10\"/><path d=\"M17.6 27.6c.6-3.4 2-6 4-8\"/></g>"
  },
  {
    "id": 50,
    "name": "cây cổ thụ",
    "description": "có xích đu",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M9 18.4c-2.4.2-4-1.6-3.8-3.6c.2-1.6 1.4-2.8 3-2.8c-.2-2.6 2-4.6 4.6-4.4c.8-2.2 3.2-3.4 5.4-2.8c1.8.4 3.2 1.8 3.6 3.6c2.2-.2 4 1.4 4 3.6c1.6.6 2.4 2 2.2 3.6c-.4 1.6-1.8 2.8-3.4 2.8c-1 .2-2 0-2.8-.4c-1 .8-2.4 1-3.6.6c-1.2.8-2.8.8-4 0c-1.2.6-2.6.4-3.6-.4z\"/><path d=\"M13.6 27.6c.8-2.6 1-5.6.4-9.2M18.4 27.6c-.8-2.6-1-5.6-.4-9.2\"/><path d=\"M13.6 27.6c-1.2-.2-2.2.2-3 .8M18.4 27.6c1.2-.2 2.2.2 3 .8\"/><path d=\"M16.2 19.4c.2 1.4 1.2 2.4 2.4 2.8\"/><path d=\"M10.6 13.8c.6-.6 1.4-.8 2.2-.6M18.4 10.6c.8 0 1.4.4 1.8 1M21.6 15.2c.6.4.8 1 .8 1.6\"/><path d=\"M15.4 24.2h.01\"/></g>"
  },
  {
    "id": 51,
    "name": "cỏ lau",
    "description": "ba bông lau bông xù",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M12 27.6c0-6-.6-11-2-15\"/><path d=\"M16 27.6c0-7 .2-13 .8-17.4\"/><path d=\"M20 27.6c0-5 .8-9 2.6-12.6\"/><ellipse cx=\"9.6\" cy=\"10\" rx=\"1.3\" ry=\"3\" transform=\"rotate(-15 9.6 10)\"/><ellipse cx=\"17\" cy=\"7.4\" rx=\"1.3\" ry=\"3.2\" transform=\"rotate(5 17 7.4)\"/><ellipse cx=\"23.2\" cy=\"12.4\" rx=\"1.3\" ry=\"3\" transform=\"rotate(25 23.2 12.4)\"/><path d=\"M14 27.6c-1-3-3-5-5.4-6\"/><path d=\"M18 27.6c1.2-2.6 3-4.4 5.6-5.2\"/></g>"
  },
  {
    "id": 52,
    "name": "cỏ đuôi chồn",
    "description": "bông cỏ rủ xuống",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M11 27.6c0-6 1-10 3.6-13\"/><path d=\"M17 27.6c0-6 1.6-10 5-12.6\"/><ellipse cx=\"15.6\" cy=\"12.6\" rx=\"1.4\" ry=\"3.2\" transform=\"rotate(35 15.6 12.6)\"/><ellipse cx=\"23.8\" cy=\"14.6\" rx=\"1.4\" ry=\"3.2\" transform=\"rotate(55 23.8 14.6)\"/><path d=\"M14.6 9.2l.6-1M17.6 11.2l1-.4M18.4 14l1 .2M24.6 10.8l.6-.8M26.8 13.4l1-.2M26.8 16.6l.9.4\"/><path d=\"M13 27.6c-1.6-2.4-3.6-3.8-6-4.2\"/><path d=\"M19.6 27.6c.4-2.4 1.6-4 3.6-5\"/></g>"
  },
  {
    "id": 53,
    "name": "bụi cỏ thấp",
    "description": "tám lá xoè tròn",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6Q12.1 25.0 7 20.4\"/><path d=\"M16 27.6Q13.3 23.4 9.4 17.2\"/><path d=\"M16 27.6Q14.7 22.3 12.2 15\"/><path d=\"M16 27.6Q16.1 21.7 15 13.8\"/><path d=\"M16 27.6Q16.4 21.8 18 14\"/><path d=\"M16 27.6Q17.8 22.5 20.8 15.4\"/><path d=\"M16 27.6Q19.1 23.8 23.4 18\"/><path d=\"M16 27.6Q20.1 25.5 25.4 21.4\"/></g>"
  },
  {
    "id": 54,
    "name": "cỏ và hoa nhỏ",
    "description": "một bông xen giữa cỏ",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M10 27.6c0-3.4-1-6-2.8-8\"/><path d=\"M12.6 27.6c0-4.4.8-8 2.6-10.4\"/><path d=\"M20 27.6c-.2-3.6.6-6.4 2.4-8.6\"/><path d=\"M23 27.6c0-2.6-.8-4.6-2.2-6\"/><path d=\"M16.6 27.6c0-4.6-.4-8.6-1.2-12\"/><g stroke-width=\"1.2\" transform=\"translate(15.2 12.4)\"><circle cx=\"0.00\" cy=\"-1.60\" r=\".75\"/><circle cx=\"1.52\" cy=\"-0.49\" r=\".75\"/><circle cx=\"0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-0.94\" cy=\"1.29\" r=\".75\"/><circle cx=\"-1.52\" cy=\"-0.49\" r=\".75\"/></g><path d=\"M15.2 12.4h.01\"/><path d=\"M16.5 22.4c1-1.2 2.2-1.6 3.4-1.4\"/></g>"
  },
  {
    "id": 55,
    "name": "cỏ trong gió",
    "description": "ngọn cỏ nghiêng theo gió",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M9 27.6c0-4 1.6-7.4 5-9.6\"/><path d=\"M12.6 27.6c.4-4.6 2.6-8.4 6.6-10.6\"/><path d=\"M16.4 27.6c.6-3.4 2.4-6 5.4-7.6\"/><path d=\"M20 27.6c.6-2.4 2-4.2 4-5.2\"/><path d=\"M5 11.4h6c1.4 0 2-1.6.9-2.4\"/><path d=\"M7.2 14.6h6.4\"/><path d=\"M19.4 8.2h5.6c1.2 0 1.8 1.4.8 2.2\"/></g>"
  }
] as const

export type MoodId = 'm1' | 'm2' | 'm3' | 'm4' | 'm5'

export const MOODS: ReadonlyArray<GardenIcon & { id: MoodId, label: string }> = [
  {
    "id": "m1",
    "label": "buồn",
    "description": "hoa cúi đầu, trời mưa",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M15.4 27.6c0-4.4.4-7.6 1.6-9.6\"/><circle cx=\"18.6\" cy=\"12\" r=\"5.4\"/><g stroke-width=\"1.4\"><path d=\"M16.6 11.2h.01M20.6 11.2h.01\"/><path d=\"M16.9 15c1-.9 2.4-.9 3.4 0\"/><path d=\"M22 12.6v1.4\"/></g><path d=\"M15.6 22.8c-1.8-.4-3.6.4-4.8 2\"/><path d=\"M8.4 5.2c-.9 1.3-1.4 2.2-1.4 2.8a1.4 1.4 0 0 0 2.8 0c0-.6-.5-1.5-1.4-2.8z\"/><path d=\"M12.4 4v1.4M5.4 11v1.4\"/></g>"
  },
  {
    "id": "m2",
    "label": "vui",
    "description": "hoa nở, cười híp mắt",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6V16.4\"/><path d=\"M16 23c-1.6-2.4-4-3.2-6.2-2.6c1 2.4 3.6 3.4 6.2 2.6z\"/><path d=\"M16 23c1.6-2.4 4-3.2 6.2-2.6c-1 2.4-3.6 3.4-6.2 2.6z\"/><circle cx=\"16\" cy=\"11.2\" r=\"5\"/><g transform=\"translate(16 11.2)\"><path d=\"M0 -5.8c-1.2 -.6 -1.6 -2.2 0 -3.4c1.6 1.2 1.2 2.8 0 3.4z\" transform=\"rotate(0)\"/><path d=\"M0 -5.8c-1.2 -.6 -1.6 -2.2 0 -3.4c1.6 1.2 1.2 2.8 0 3.4z\" transform=\"rotate(45)\"/><path d=\"M0 -5.8c-1.2 -.6 -1.6 -2.2 0 -3.4c1.6 1.2 1.2 2.8 0 3.4z\" transform=\"rotate(90)\"/><path d=\"M0 -5.8c-1.2 -.6 -1.6 -2.2 0 -3.4c1.6 1.2 1.2 2.8 0 3.4z\" transform=\"rotate(135)\"/><path d=\"M0 -5.8c-1.2 -.6 -1.6 -2.2 0 -3.4c1.6 1.2 1.2 2.8 0 3.4z\" transform=\"rotate(180)\"/><path d=\"M0 -5.8c-1.2 -.6 -1.6 -2.2 0 -3.4c1.6 1.2 1.2 2.8 0 3.4z\" transform=\"rotate(225)\"/><path d=\"M0 -5.8c-1.2 -.6 -1.6 -2.2 0 -3.4c1.6 1.2 1.2 2.8 0 3.4z\" transform=\"rotate(270)\"/><path d=\"M0 -5.8c-1.2 -.6 -1.6 -2.2 0 -3.4c1.6 1.2 1.2 2.8 0 3.4z\" transform=\"rotate(315)\"/></g><g stroke-width=\"1.4\"><path d=\"M13.6 10.6q.9-1.1 1.8 0M16.6 10.6q.9-1.1 1.8 0\"/><path d=\"M13.9 12.8q2.1 2.4 4.2 0\"/></g></g>"
  },
  {
    "id": "m3",
    "label": "chán",
    "description": "mắt lim dim, lá rũ",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6v-8.8\"/><circle cx=\"16\" cy=\"13\" r=\"5.8\"/><g stroke-width=\"1.4\"><path d=\"M12.8 12.4h2.4M16.8 12.4h2.4\"/><path d=\"M14.2 16.2h3.6\"/></g><path d=\"M16 23.6c-2 0-4 .6-5.6 1.8\"/><path d=\"M16 23.6c2 0 4 .6 5.6 1.8\"/><path d=\"M22.8 3.6h2.6l-2.6 2.8h2.6\"/><path d=\"M26.8 7.8h1.6l-1.6 1.8h1.6\" stroke-width=\"1.2\"/></g>"
  },
  {
    "id": "m4",
    "label": "năng lượng",
    "description": "giơ lá, có tia sét",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6V16.6\"/><circle cx=\"16\" cy=\"11.4\" r=\"5.2\"/><g stroke-width=\"1.4\"><path d=\"M14 10.2h.01M18 10.2h.01\"/><path d=\"M14.2 12.6h3.6c0 1.4-.8 2.4-1.8 2.4s-1.8-1-1.8-2.4z\"/></g><path d=\"M16 23c-2-.6-3.6-2.4-4.2-4.8c2.4.4 4 2.2 4.2 4.8z\"/><path d=\"M16 23c2-.6 3.6-2.4 4.2-4.8c-2.4.4-4 2.2-4.2 4.8z\"/><path d=\"M7.4 4.6l-2 4.2h2.8l-1.8 4.2\"/><path d=\"M24 7.6l2-1.4M24.8 11.4h2.4M24 15.2l2 1.4\"/></g>"
  },
  {
    "id": "m5",
    "label": "peak",
    "description": "nở rực, lấp lánh",
    "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 28c2.5-.9 4.5.6 7 0s4.6-.8 7-.1 4.6.6 8 0\"/><path d=\"M16 27.6V15.6\"/><path d=\"M16 23.4c-1.6-2.4-4-3.2-6.2-2.6c1 2.4 3.6 3.4 6.2 2.6z\"/><path d=\"M16 23.4c1.6-2.4 4-3.2 6.2-2.6c-1 2.4-3.6 3.4-6.2 2.6z\"/><circle cx=\"16\" cy=\"11\" r=\"4.6\"/><g transform=\"translate(16 11)\"><path d=\"M-1.5 -5.2L0 -8.2L1.5 -5.2\" transform=\"rotate(0)\"/><path d=\"M-1.5 -5.2L0 -8.2L1.5 -5.2\" transform=\"rotate(36)\"/><path d=\"M-1.5 -5.2L0 -8.2L1.5 -5.2\" transform=\"rotate(72)\"/><path d=\"M-1.5 -5.2L0 -8.2L1.5 -5.2\" transform=\"rotate(108)\"/><path d=\"M-1.5 -5.2L0 -8.2L1.5 -5.2\" transform=\"rotate(144)\"/><path d=\"M-1.5 -5.2L0 -8.2L1.5 -5.2\" transform=\"rotate(180)\"/><path d=\"M-1.5 -5.2L0 -8.2L1.5 -5.2\" transform=\"rotate(216)\"/><path d=\"M-1.5 -5.2L0 -8.2L1.5 -5.2\" transform=\"rotate(252)\"/><path d=\"M-1.5 -5.2L0 -8.2L1.5 -5.2\" transform=\"rotate(288)\"/><path d=\"M-1.5 -5.2L0 -8.2L1.5 -5.2\" transform=\"rotate(324)\"/></g><g stroke-width=\"1.4\"><path d=\"M13.9 10.2q.8-1 1.6 0M16.5 10.2q.8-1 1.6 0\"/><path d=\"M14 12h4c0 1.4-.9 2.2-2 2.2s-2-.8-2-2.2z\"/></g><path d=\"M0 -2.2L.5 -.5L2.2 0L.5 .5L0 2.2L-.5 .5L-2.2 0L-.5 -.5z\" transform=\"translate(4.8 5.4) scale(1)\"/><path d=\"M0 -2.2L.5 -.5L2.2 0L.5 .5L0 2.2L-.5 .5L-2.2 0L-.5 -.5z\" transform=\"translate(27.4 4.8) scale(0.8)\"/><path d=\"M0 -2.2L.5 -.5L2.2 0L.5 .5L0 2.2L-.5 .5L-2.2 0L-.5 -.5z\" transform=\"translate(27 19.4) scale(0.9)\"/></g>"
  }
] as const

/** Hand-drawn forest (big pine, small pine, round tree on one ground line) — the "all goals" tab icon. */
export const FOREST: GardenIcon = {
  id: 'forest',
  name: 'khu rừng',
  description: 'thông lớn ở giữa, thông nhỏ bên phải, cây tròn bên trái',
  body: '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 28c3-.8 5.5.6 8.5 0s5.6-.8 9-.1 5.4.6 8.5 0"/><path d="M16 3.8c-.8 1.8-2 3.4-3.4 4.6c1.2.4 2.3.2 3.4-.3c1.1.5 2.2.7 3.4.3c-1.4-1.2-2.6-2.8-3.4-4.6z"/><path d="M13.6 8.6c-1 1.8-2.2 3.2-3.6 4.2c1.3.5 2.6.3 3.7-.3c.8.5 1.5.7 2.3.7s1.5-.2 2.3-.7c1.1.6 2.4.8 3.7.3c-1.4-1-2.6-2.4-3.6-4.2"/><path d="M13.2 13.4c-1 1.8-2.4 3.2-4 4.2c1.5.6 3 .4 4.2-.3c.9.6 1.8.8 2.6.8s1.7-.2 2.6-.8c1.2.7 2.7.9 4.2.3c-1.6-1-3-2.4-4-4.2"/><path d="M15.2 18.4c.2 3 .1 6-.1 9.2M16.9 18.4c-.1 3 0 6 .2 9.2"/><path d="M6.6 13.4c2.2-.1 3.8 1.6 3.7 3.8c-.1 2.2-1.8 3.8-3.9 3.8c-2.2 0-3.8-1.7-3.7-3.9c.1-2.1 1.8-3.6 3.9-3.7z"/><path d="M6.4 21v6.6"/><path d="M5.4 16.6h.01M7.6 18.2h.01"/><path d="M25.8 11.6c-.6 1.6-1.6 3-2.8 3.8c1 .4 2 .2 2.8-.2c.8.4 1.8.6 2.8.2c-1.2-.8-2.2-2.2-2.8-3.8z"/><path d="M24.6 15.4c-.7 1.4-1.6 2.6-2.8 3.4c1 .5 2.1.3 3-.2c.4.3.8.4 1.2.4s.8-.1 1.2-.4c.9.5 2 .7 3 .2c-1.2-.8-2.1-2-2.8-3.4"/><path d="M26 19.8v7.6"/></g>',
}

/**
 * 40 garden & farm hand icons (in hand-icons.ts, 24px grid). Together with the
 * 55 plants they form the pool of things that grow on a done day.
 */
export const FARM_ICONS = [
  'g-shovel', 'g-rake', 'g-hoe', 'g-pitchfork', 'g-watering', 'g-shears', 'g-wheelbarrow', 'g-glove',
  'g-strawhat', 'g-seeds', 'g-hose', 'g-basket', 'g-crate', 'g-hay', 'g-fence', 'g-windmill',
  'g-barn', 'g-tractor', 'g-scarecrow', 'g-bucket', 'g-chicken', 'g-cow', 'g-pig', 'g-sheep',
  'g-duck', 'g-rabbit', 'g-beehive', 'g-eggs', 'g-horseshoe', 'g-coop', 'g-well', 'g-greenhouse',
  'g-silo', 'g-birdhouse', 'g-mailbox', 'g-gate', 'g-ladder', 'g-axe', 'g-milkcan', 'g-vegbed',
] as const

/** Everything that can grow on a done day: "p1".."p55" + the 40 farm icons (95). */
export const GROW_POOL: readonly string[] = [...PLANTS.map(p => `p${p.id}`), ...FARM_ICONS]

/** Small seeded PRNG (xmur3 hash → mulberry32) so picks are the same on every device. */
function rng(seed: string) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let a = h >>> 0
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const goalPools = new Map<string, string[]>()

/**
 * Icon that grows on day `day` of a goal: the 95-icon pool shuffled once with
 * the goal id as seed, so there are no repeats within 95 days.
 */
export function growIconForGoal(goalId: string, day: number) {
  let pool = goalPools.get(goalId)
  if (!pool) {
    const next = rng(goalId)
    pool = [...GROW_POOL]
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j]!, pool[i]!]
    }
    goalPools.set(goalId, pool)
  }
  return pool[(Math.max(1, Math.floor(day)) - 1) % pool.length]!
}

/**
 * Icon for a date in the home garden (all goals together): picked with the
 * date as seed, re-picked when it equals the previous cell's icon.
 */
export function growIconForDate(iso: string, previous?: string) {
  const next = rng(iso)
  let id = GROW_POOL[Math.floor(next() * GROW_POOL.length)]!
  while (id === previous) id = GROW_POOL[Math.floor(next() * GROW_POOL.length)]!
  return id
}

/** Plant for the n-th day (1-based). Cycles after 55 so long journeys never run out. */
export function plantForDay(day: number) {
  return PLANTS[(Math.max(1, Math.floor(day)) - 1) % PLANTS.length]!
}

export function moodById(id: string | null | undefined) {
  return MOODS.find(m => m.id === id)
}

/** Look up any icon by id: "forest", "p1".."p55" (plants) or "m1".."m5" (moods). */
export function iconById(id: string | null | undefined): GardenIcon | undefined {
  if (!id) return undefined
  if (id === 'forest') return FOREST
  if (id.startsWith('m')) return moodById(id)
  const n = Number(id.replace(/^p/, ''))
  return Number.isInteger(n) && n >= 1 && n <= PLANTS.length ? PLANTS[n - 1] : undefined
}

/** Full standalone SVG string (handy for favicons, native splash assets, etc.). */
export function toSvg(icon: Pick<GardenIcon, 'body'>, size = 32) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${VIEWBOX}">${icon.body}</svg>`
}

export * from './hand-icons.ts'
