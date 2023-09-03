precision highp float;

in vec2 vUV;
uniform sampler2D textureSampler;
uniform sampler2D maskTexture;
uniform float outlineThickness;
uniform vec3 visibleEdgeColor;
uniform vec3 hiddenEdgeColor;
uniform int isVisibleDisplayed;
uniform int isHiddenDisplayed;
uniform vec2 screenSize;
// uniform float outlineThickness; // Add an outline thickness parameter

vec4 get_mask(vec4 color) { return vec4(vec3(color.a), 1.0); }

vec4 getGaussian(sampler2D sourceTexture, float Directions, float Quality,
                 float Size) {
  float Pi = 6.28318530718; // Pi*2

  vec2 Radius = Size / screenSize.xy;

  vec2 uv = vUV;
  float Color = texture2D(sourceTexture, uv).a;

  for (float d = 0.0; d < Pi; d += Pi / Directions) {
    for (float i = 1.0 / Quality; i <= 1.0; i += 1.0 / Quality) {
      Color +=
          texture2D(sourceTexture, uv + vec2(cos(d), sin(d)) * Radius * i).a;
    }
  }

  Color /= Quality * Directions - 15.0;
  return vec4(Color);
}

void main(void) {
  vec2 texelSize = 1.0 / screenSize;
  vec4 selectedColor = texture2D(maskTexture, vUV);
  vec4 color = texture2D(textureSampler, vUV);

  float visibleEdgeFactor = 0.0;
  float hiddenEdgeFactor = 0.0;

  int limit = int(min(outlineThickness, 15.0));

  for (int i = -limit; i < limit; i++) {
    for (int j = -limit; j < limit; j++) {
      vec2 offset = vec2(float(i), float(j));
      vec2 pos = vUV + offset * texelSize;
      vec4 neighborColor = texture2D(maskTexture, pos);
      vec4 actualNeighborColor = texture2D(textureSampler, pos);

      float incr = max(0.0, neighborColor.a - selectedColor.a);
      visibleEdgeFactor += incr;
      hiddenEdgeFactor += incr * length(actualNeighborColor - neighborColor);
    }
  }

  visibleEdgeFactor =
      visibleEdgeFactor > (0.01 * outlineThickness) && hiddenEdgeFactor == 0.0
          ? 1.0
          : 0.0; // Adjust outline thickness
  hiddenEdgeFactor =
      hiddenEdgeFactor > (0.01 * outlineThickness) && visibleEdgeFactor == 0.0
          ? 1.0
          : 0.0; // Adjust outline thickness

  vec3 visibleOutline =
      visibleEdgeColor * visibleEdgeFactor * float(isVisibleDisplayed);
  vec3 hiddenOutline =
      hiddenEdgeColor * hiddenEdgeFactor * float(isHiddenDisplayed);

  float cr3 = 1.7320508; // cube root of 3
  vec4 dog = getGaussian(maskTexture, 16.0, 3.0, 5.0 + outlineThickness) -
             getGaussian(maskTexture, 16.0, 3.0, 5.0);

  vec3 outline = (visibleOutline + hiddenOutline) * 2.0;
  outline = outline * length(dog.rgb) / cr3;
  vec4 final_color = vec4(outline + color.rgb, color.a);

  gl_FragColor = clamp(final_color, 0.0, 1.0);
}
