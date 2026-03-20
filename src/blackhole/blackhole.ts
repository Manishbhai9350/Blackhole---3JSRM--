import { Fn, normalize, positionWorld, uniform, vec3, vec4 } from "three/tsl";
import * as THREE from "three/webgpu";
import { createStarField } from "./background";

interface BlackHoleProps {
  SPHERE_RADIUS: number;
  SPHERE_WIDTH_SEG: number;
  SPHERE_HEIGHT_SEG: number;
}

export function CreateBlackHole({
  SPHERE_HEIGHT_SEG,
  SPHERE_RADIUS,
  SPHERE_WIDTH_SEG,
}: BlackHoleProps): THREE.Mesh {
  const uniforms = {
    starSize: uniform(1.0),
    starDensity: uniform(0.1),
    starBrightness: uniform(1.0),
    starBackgroundColor: uniform(vec3(0.0, 0.0, 0.0)),
  };

  const geometry = new THREE.SphereGeometry(
    SPHERE_RADIUS,
    SPHERE_WIDTH_SEG,
    SPHERE_HEIGHT_SEG,
  );
  geometry.scale(-1, 1, 1); // Invert the sphere

  // Standard material for now — swap with a TSL NodeMaterial later
  const material = new THREE.MeshBasicNodeMaterial({
    // side: THREE.DoubleSide
  });

  material.colorNode = Fn(() => {
    // normalize turns the world position into a unit ray direction
    const rayDir = normalize(positionWorld);
    const bgColor = uniforms.starBackgroundColor.toVar("bgColor");
    const starField = createStarField(uniforms);
    bgColor.addAssign(starField(rayDir));
    return vec4(bgColor, 1.0);
  })();

  const blackhole = new THREE.Mesh(geometry, material);
  return blackhole;
}
