import {
  asin,
  atan,
  clamp,
  float,
  floor,
  Fn,
  fract,
  length,
  mix,
  smoothstep,
  step,
  vec2,
  vec3,
} from "three/tsl";
import { hash21, hash22 } from "../utils/hash";
import type {
  ConstNode,
  FlowData,
  Uniform,
  UniformNode,
  Vector2,
  Vector3,
} from "three/webgpu";

interface StarFieldUniforms {
  starSize: UniformNode<"float", number>;
  starDensity: UniformNode<"float", number>;
  starBrightness: UniformNode<"float", number>;
  starBackgroundColor: UniformNode<"vec3", Vector3>;
}

export const createStarField = (uniforms: StarFieldUniforms) =>
  Fn(([rayDir]: [ConstNode<"vec3", Vector3>]) => {
    // Convert ray direction to spherical coordinates
    const theta = atan(rayDir.z, rayDir.x); // Azimuthal angle
    const phi = asin(clamp(rayDir.y, float(-1.0), float(1.0))); // Polar angle

    // Create grid cells across the sky
    const gridScale = float(60.0).div(uniforms.starSize);
    const scaledCoord = vec2(theta, phi).mul(gridScale);
    const cell = floor(scaledCoord);
    const cellUV = fract(scaledCoord); // Position within cell (0-1)

    // Decide if this cell has a star (based on density)
    const cellHash = hash21(cell);
    const starProb = step(float(1.0).sub(uniforms.starDensity), cellHash);

    // Random position within the cell (away from edges)
    const starPos = hash22(cell.add(42.0)).mul(0.8).add(0.1);
    const distToStar = length(cellUV.sub(starPos));

    // Star size varies per cell
    const baseSizeVar = hash21(cell.add(100.0)).mul(0.03).add(0.01);
    const finalStarSize = baseSizeVar.mul(uniforms.starSize);

    // Core + glow falloff
    const starCore = smoothstep(finalStarSize, float(0.0), distToStar);
    const starGlow = smoothstep(
      finalStarSize.mul(3.0),
      float(0.0),
      distToStar,
    ).mul(0.3);
    const starIntensity = starCore.add(starGlow).mul(starProb);

    // Slight color temperature variation
    const colorTemp = hash21(cell.add(200.0));
    const starColor = mix(vec3(0.8, 0.9, 1.0), vec3(1.0, 0.95, 0.8), colorTemp);

    return starColor.mul(starIntensity).mul(uniforms.starBrightness);
  });
