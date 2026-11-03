#version 120 

// (way more precision than a float can actually store...)
#define LOG_2 0.6931471805599453094172321214581765680755001

// start using these antialiasing values once you start (c)
#define AA 2
const int TOTAL_SAMPLES = AA * AA;

uniform vec2 c;
uniform int MAX_ITERS;
uniform vec2 windowSizePixels;
uniform vec2 camCenterWorld;
uniform float camWorldUnitsPerPixel;

// reprojection (1d) may require extra uniforms here...

// Use this to get a color from your smoothed Julia set escape times.
vec4 colorTime(float t) {
    return vec4(0.5 + 0.5 * cos(  0.1 * (t) + vec3(0.f, 0.35, 0.7)), 1.f);
}

struct EscapeTime {
    float iters;
    bool isInf;
};

// Escape time of iterating z^2 + c
EscapeTime escapeTimeSmooth(vec2 z) {
    // NOTE: derive formula by literally manually calculating z^2 + c
    // z^2 + c = (zr^2 - zc^2 + cr) + i(2zrzc + cc)
    float zr = z.x;
    float zc = z.y;
    float cr = c.x;
    float cc = c.y;

    // i = number of iterations
    for (int i = 1; i <= MAX_ITERS; i++) {
        // check for divergence
        if (length(z) >= 4.0f) {
            // smooth it out with their given formula
            return EscapeTime(float(i) + 1.0f - log(log(length(z))) / LOG_2, false);  // did escape
        }
        z = vec2(zr * zr - zc * zc + cr, 2.0 * zr * zc + cc);
        zr = z.x;
        zc = z.y;
        cr = c.x;
        cc = c.y;
    }
    
    // never escaped -> escape time is infinite
    return EscapeTime(0.0f, true);
}


vec2 windowToWorld(vec2 windowCoords) {
    // NOTE: formula from lab 9 exercise
    return camCenterWorld - ((windowSizePixels * 0.5f) * camWorldUnitsPerPixel) + (windowCoords * camWorldUnitsPerPixel);
}

// For reprojection
vec2 worldToOldWindow(vec2 worldCoords) {
    // TODO
    return vec2(0.0);
}

// For SSAA
// Given (dx, dy) in [0, AA)^2, suppose the unit square [0, 1)^2 was cut up into AA equal
// partitions along each dimension. delta((dx, dy)) returns the center of the sub-square
// which is in the dy'th row and dx'th column (both 0-indexed).
vec2 delta(vec2 dxy) {
    // TODO
    return vec2(0.0);
}


void main() {
    // 1. convert from screenspace coordinates to world coordinates & calculate escape time
    vec2 z = windowToWorld(gl_FragCoord.xy);
    EscapeTime escapeTime = escapeTimeSmooth(z);

    if (escapeTime.isInf) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        gl_FragColor = colorTime(escapeTime.iters);
    }
}
