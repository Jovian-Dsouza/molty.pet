import {
  CanvasTexture,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  PlaneGeometry,
  SRGBColorSpace,
  Vector3,
} from "three";
import { OLED_HEIGHT, OLED_SCREEN, OLED_WIDTH, faceBitmap, type Expression } from "./face";

/** SSD1306 white-on-black: lit pixels glow ice white, unlit stay glass black. */
const LIT: readonly [number, number, number] = [222, 244, 255];
const DARK: readonly [number, number, number] = [4, 5, 8];
/** Float just above the glass so the face never z-fights with it (mm). */
const LIFT_MM = 0.12;

export interface OledScreen {
  mesh: Mesh;
  show: (expression: Expression) => void;
  dispose: () => void;
}

/** A plane on the OLED's active area (CAD space) showing Molty's face. */
export function createOledScreen(): OledScreen {
  const canvas = document.createElement("canvas");
  canvas.width = OLED_WIDTH;
  canvas.height = OLED_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable for the OLED face");

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = NearestFilter; // crisp pixels up close

  const material = new MeshBasicMaterial({ map: texture, toneMapped: false });
  const geometry = new PlaneGeometry(OLED_SCREEN.widthMm, OLED_SCREEN.heightMm);
  const mesh = new Mesh(geometry, material);
  mesh.name = "oled_face";

  const right = new Vector3(...OLED_SCREEN.right);
  const up = new Vector3(...OLED_SCREEN.up);
  const normal = new Vector3(...OLED_SCREEN.normal);
  mesh.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(right, up, normal));
  mesh.position.set(...OLED_SCREEN.center).addScaledVector(normal, LIFT_MM);

  let shown: Expression | null = null;
  const image = ctx.createImageData(OLED_WIDTH, OLED_HEIGHT);
  const show = (expression: Expression) => {
    if (expression === shown) return;
    shown = expression;
    const bitmap = faceBitmap(expression);
    for (let i = 0; i < bitmap.length; i++) {
      const [r, g, b] = bitmap[i] ? LIT : DARK;
      image.data.set([r, g, b, 255], i * 4);
    }
    ctx.putImageData(image, 0, 0);
    texture.needsUpdate = true;
  };
  show("open");

  return {
    mesh,
    show,
    dispose: () => {
      texture.dispose();
      material.dispose();
      geometry.dispose();
    },
  };
}
