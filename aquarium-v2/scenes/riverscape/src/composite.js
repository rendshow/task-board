import { createPostprocessing } from '../../shared/postprocessing.js';

export function createComposite(camera, settings) {
  return createPostprocessing(camera, { samples: settings.samples,
    uniforms: { filmTime: { value: 0 } },
    fragmentShader: `
      uniform sampler2D beauty;uniform sampler2D depth;uniform vec2 size;uniform vec2 nearFar;uniform float aoRadiusScale;uniform float filmTime;varying vec2 vUv;
      float distanceAt(vec2 p){float z=texture2D(depth,p).x;return nearFar.x*nearFar.y/(nearFar.y-z*(nearFar.y-nearFar.x));}
      void main(){
        vec3 color=texture2D(beauty,vUv).rgb;float center=distanceAt(vUv);float occlusion=0.;
        for(int i=0;i<${settings.aoSamples};i++) {
          float a=float(i)*2.399963;float radius=2.5+float(i)*${(14.85 / (settings.aoSamples - 1)).toFixed(8)};
          float sampleDepth=distanceAt(vUv+vec2(cos(a),sin(a))*radius*aoRadiusScale/size);
          float difference=center-sampleDepth;
          occlusion+=smoothstep(.012,.13,difference)*(1.-smoothstep(.2,.8,difference));
        }
        color*=1.-occlusion*${(0.022 * 12 / settings.aoSamples).toFixed(8)};
        float vignette=dot((vUv-.5)*vec2(1.,.85),(vUv-.5)*vec2(1.,.85));
        color*=1.-vignette*.15;
        float grain=fract(sin(dot(vUv*size+filmTime,vec2(12.9898,78.233)))*43758.5453)-.5;
        float bayer=mod(floor(vUv.x*size.x)+2.*floor(vUv.y*size.y),4.)/16.;
        color+=grain*.008+bayer*.003;
        color=floor(color*48.+.5)/48.;
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
}
