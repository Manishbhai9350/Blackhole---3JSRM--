import {
  Break,
  color,
  float,
  Fn,
  If,
  length,
  Loop,
  normalize,
  positionWorld,
  uniform,
  vec3,
  vec4,
} from "three/tsl";
import * as THREE from "three/webgpu";
import { createNebulaField, createStarField } from "./background";

interface BlackHoleProps {
  SPHERE_RADIUS: number;
  SPHERE_WIDTH_SEG: number;
  SPHERE_HEIGHT_SEG: number;
  CAMERA_POSITION: THREE.Vector3;
}

export function CreateBlackHole({
  SPHERE_HEIGHT_SEG,
  SPHERE_RADIUS,
  SPHERE_WIDTH_SEG,
  CAMERA_POSITION,
}: BlackHoleProps): THREE.Mesh {
  const uniforms = {
    starSize: uniform(1.0),
    starDensity: uniform(0.1),
    starBrightness: uniform(1.0),
    starBackgroundColor: uniform(vec3(0.0, 0.0, 0.0)),

    nebula1Scale: uniform(0.2),
    nebula1Density: uniform(1),
    nebula1Brightness: uniform(0.3),
    nebula1Color: uniform(color(0.2, 0.5, 1)),

    nebula2Scale: uniform(0.6),
    nebula2Density: uniform(0.6),
    nebula2Brightness: uniform(0.2),
    nebula2Color: uniform(color(0.2, 0.3, 0.15)),

    camera_position: uniform(
      vec3(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z),
    ),
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
    const rayDir = normalize(positionWorld);
    const bgColor = uniforms.starBackgroundColor.toVar("bgColor");
    const starField = createStarField(uniforms);
    bgColor.addAssign(starField(rayDir));

    return vec4(bgColor, 1.0);
  })();

  const blackhole = new THREE.Mesh(geometry, material);
  return blackhole;
}
