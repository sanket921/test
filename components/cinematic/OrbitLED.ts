import * as THREE from 'three';

// Original demonstration graphics, not footage or production show content.
// Object-space cylindrical coordinates stay attached to each physical LED mesh.
export function createOrbitLED(geometry: THREE.BufferGeometry, phase: number, disk = false) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const centre = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  return new THREE.ShaderMaterial({
    name: 'Orbit LED / generated content demonstration',
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms: {
      uDisk: { value: disk ? 1 : 0 }, uTime: { value: 0 }, uProgress: { value: .48 }, uPhase: { value: phase },
      uCentre: { value: centre }, uSize: { value: size },
    },
    vertexShader: `
      varying vec3 vLocal;
      void main() {
        vLocal = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime, uProgress, uPhase, uDisk;
      uniform vec3 uCentre, uSize;
      varying vec3 vLocal;
      const float TAU = 6.28318530718;
      vec3 palette(float x) {
        return .5 + .5 * cos(TAU * (vec3(.0,.33,.67) + x));
      }
      void main() {
        vec3 q = vLocal - uCentre;
        float a = mix(atan(q.y, q.x), q.x / max(uSize.x, 1.0) * TAU, uDisk);
        float r = length(q.xy) / max(uSize.x * .5, 1.0);
        float h = mix(q.z / max(uSize.z, 1.0), q.y / max(uSize.y, 1.0), uDisk) + .5;
        float t = uTime;
        float phase = uPhase;
        // Integer angular frequencies close the cylindrical seam exactly.
        float wave = sin(a * 3.0 + h * 5.0 - t * .65 + phase);
        float flow = .5 + .5 * sin(a * 2.0 - t * .45 + phase + wave * .6);
        vec3 cyan = vec3(.015,.8,1.0), blue = vec3(.025,.12,.85);
        vec3 violet = vec3(.49,.06,.95), magenta = vec3(.95,.025,.45);
        vec3 amber = vec3(1.0,.38,.015);
        vec3 energy = mix(blue, cyan, flow);
        energy = mix(energy, violet, .35 + .3 * sin(a * 4.0 + t * .35 + phase));
        float trail = pow(.5 + .5 * sin(a * 5.0 - t + h * 4.0 + phase), 18.0);
        energy = mix(energy, magenta, .28 * pow(.5 + .5 * sin(a * 3.0 - t * .4 + phase), 4.0));
        float filaments = pow(.5 + .5 * sin(h * 42.0 + sin(a * 3.0 - t * .55) * 5.0 + t * .8), 28.0);
        energy += mix(cyan, magenta, .5 + .5 * sin(a * 2.0 + phase)) * filaments * .48;
        energy += vec3(.18,.35,.3) * trail;
        float segments = smoothstep(.34,.55, sin(a * 18.0 + t * 1.1 + phase));
        float crossline = pow(.5 + .5 * cos(h * 25.0 + sin(a * 6.0 - t) * 1.3), 10.0);
        vec3 geometry = mix(blue * .14, mix(cyan,magenta,.5+.5*sin(a*4.0+phase)), segments * .85);
        geometry += mix(amber,cyan,.5+.5*sin(a*2.0)) * crossline * .45;
        vec3 reveal = mix(amber, magenta, flow);
        reveal = mix(reveal, mix(violet,blue,.5+.5*sin(a*2.0+t*.3)), .5+.45*sin(a*3.0-t*.5+phase));
        reveal += vec3(.2,.13,.06) * trail;
        vec3 color = mix(energy, geometry, smoothstep(.45,.59,uProgress));
        color = mix(color, reveal, smoothstep(.65,.8,uProgress));
        // Very fine pixel modulation; it cannot alias into large flashing bands.
        float pixels = .96 + .04 * sin(a * 180.0) * sin(h * 100.0);
        color *= pixels * (.82 + .12 * r);
        gl_FragColor = vec4(pow(clamp(color,0.0,1.0),vec3(2.2)),1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}
