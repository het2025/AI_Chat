import React, { useEffect, useRef } from "react";

export default function SmokeyCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { alpha: true });
    if (!gl) return;

    // --- High Fidelity Config ---
    const config = {
      SIM_RES: 128,
      DYE_RES: 1024,
      DENSITY_DISSIPATION: 0.96, // FAST FADE (Removes footsteps)
      VELOCITY_DISSIPATION: 0.98,
      PRESSURE: 0.8,
      CURL: 30,
      SPLAT_RADIUS: 0.2,
      SPLAT_FORCE: 6000,
    };

    // --- Shaders ---
    const baseVertex = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const splatShader = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspect;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspect;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `;

    const advectionShader = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform float dt;
      uniform float dissipation;
      void main () {
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        gl_FragColor = dissipation * texture2D(uSource, coord);
      }
    `;

    const displayShader = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        float a = max(c.r, max(c.g, c.b));
        // Tone down brightness for high-end look
        gl_FragColor = vec4(c * 0.8, a * 0.5); 
      }
    `;

    function createShader(type, source) {
      const s = gl.createShader(type);
      gl.shaderSource(s, source);
      gl.compileShader(s);
      return s;
    }

    function createProgram(vs, fs) {
      const p = gl.createProgram();
      gl.attachShader(p, createShader(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, createShader(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      return p;
    }

    const splatProgram = createProgram(baseVertex, splatShader);
    const advectionProgram = createProgram(baseVertex, advectionShader);
    const displayProgram = createProgram(baseVertex, displayShader);

    function createFBO(w, h) {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return { tex, fbo, w, h };
    }

    function createDoubleFBO(w, h) {
      let f1 = createFBO(w, h);
      let f2 = createFBO(w, h);
      return {
        get read() { return f1; },
        get write() { return f2; },
        swap() { let t = f1; f1 = f2; f2 = t; }
      };
    }

    let density, velocity;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      density = createDoubleFBO(config.DYE_RES, config.DYE_RES);
      velocity = createDoubleFBO(config.SIM_RES, config.SIM_RES);
    };

    window.addEventListener("resize", resize);
    resize();

    const blit = (target) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fbo : null);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    let mouse = { x: 0, y: 0, dx: 0, dy: 0, down: false };
    window.addEventListener("mousemove", (e) => {
      const nx = e.clientX / canvas.width;
      const ny = 1.0 - e.clientY / canvas.height;
      mouse.dx = (nx - mouse.x) * 10.0;
      mouse.dy = (ny - mouse.y) * 10.0;
      mouse.x = nx;
      mouse.y = ny;

      // Add "Smoke" on Move
      gl.useProgram(splatProgram);
      gl.uniform1f(gl.getUniformLocation(splatProgram, "aspect"), canvas.width / canvas.height);
      gl.uniform2f(gl.getUniformLocation(splatProgram, "point"), mouse.x, mouse.y);
      
      // EXCLUSIVE COLOR LOGIC (Matching requested style)
      gl.uniform3f(gl.getUniformLocation(splatProgram, "color"), 0.8, 0.4, 0.2); // Warm Amber
      gl.uniform1f(gl.getUniformLocation(splatProgram, "radius"), config.SPLAT_RADIUS / 1000.0);
      
      gl.bindTexture(gl.TEXTURE_2D, density.read.tex);
      blit(density.write);
      density.swap();
    });

    const render = () => {
      gl.viewport(0, 0, canvas.width, canvas.height);

      // 1. Advect (Apply movement and fade)
      gl.useProgram(advectionProgram);
      gl.uniform2f(gl.getUniformLocation(advectionProgram, "texelSize"), 1.0 / config.DYE_RES, 1.0 / config.DYE_RES);
      gl.uniform1f(gl.getUniformLocation(advectionProgram, "dt"), 0.016);
      gl.uniform1f(gl.getUniformLocation(advectionProgram, "dissipation"), config.DENSITY_DISSIPATION);
      
      gl.bindTexture(gl.TEXTURE_2D, density.read.tex);
      blit(density.write);
      density.swap();

      // 2. Render to Screen
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(displayProgram);
      gl.bindTexture(gl.TEXTURE_2D, density.read.tex);
      blit(null);

      requestAnimationFrame(render);
    };

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    render();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
        background: "transparent",
        opacity: 0.7
      }}
    />
  );
}
