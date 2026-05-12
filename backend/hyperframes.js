

export class HyperframesCompiler {
    constructor() {
        this.elements = [];
        this.currentTime = 0;
        this.maxDuration = 0;
        this.trackIndex = 0;
    }

    /**
     * Add a text element with timing
     * @param {string} text
     * @param {number} startTime (seconds)
     * @param {number} duration (seconds)
     * @param {object} options - { fontSize, color, animation, trackIndex }
     */
    addText(text, startTime, duration, options = {}) {
        const trackIndex = options.trackIndex || this.trackIndex;

        this.elements.push({
            type: "text",
            content: text,
            startTime,
            duration,
            trackIndex,
            options: {
                fontSize: options.fontSize || "48px",
                color: options.color || "white",
                animation: options.animation || "fadeIn", // fadeIn, slideUp, etc.
                fontWeight: options.fontWeight || "bold",
            },
        });

        this.maxDuration = Math.max(this.maxDuration, startTime + duration);
        return this;
    }

    /**
     * Add an image/video background
     * @param {string} src - URL or data URI
     * @param {object} options
     */
    addBackground(src, options = {}) {
        const trackIndex = options.trackIndex || 0;

        this.elements.push({
            type: "background",
            src,
            startTime: options.startTime || 0,
            duration: options.duration || this.maxDuration || 10,
            trackIndex,
            options: {
                opacity: options.opacity || 1,
            },
        });

        return this;
    }

    /**
     * Add a color shape (rect, circle, etc.)
     */
    addShape(shape, startTime, duration, options = {}) {
        const trackIndex = options.trackIndex || this.trackIndex;

        this.elements.push({
            type: "shape",
            shape,
            startTime,
            duration,
            trackIndex,
            options: {
                color: options.color || "blue",
                width: options.width || "200px",
                height: options.height || "200px",
                animation: options.animation || "fadeIn",
            },
        });

        this.maxDuration = Math.max(this.maxDuration, startTime + duration);
        return this;
    }

    /**
     * Generate HTML from DSL
     */
    compile() {
        const animations = this._generateAnimations();

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hyperframes Video</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 1920px;
      height: 1080px;
      background: #000;
      font-family: Arial, sans-serif;
      overflow: hidden;
      position: relative;
    }

    .timeline-container {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .track {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    [data-start] {
      position: absolute;
      opacity: 0;
    }

    .fade-in {
      animation: fadeIn linear forwards;
    }

    .slide-up {
      animation: slideUp linear forwards;
    }

    .slide-down {
      animation: slideDown linear forwards;
    }

    .slide-left {
      animation: slideLeft linear forwards;
    }

    .slide-right {
      animation: slideRight linear forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(50px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideDown {
      from { 
        opacity: 0;
        transform: translateY(-50px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideLeft {
      from { 
        opacity: 0;
        transform: translateX(100px);
      }
      to { 
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideRight {
      from { 
        opacity: 0;
        transform: translateX(-100px);
      }
      to { 
        opacity: 1;
        transform: translateX(0);
      }
    }

    .text-element {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    .background-element {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <div class="timeline-container">
    ${this._renderElements()}
  </div>

  <script>
    const totalDuration = ${this.maxDuration};
    const timeline = gsap.timeline({ repeat: 0 });

    ${animations}

    // Auto-play
    timeline.play();
  </script>
</body>
</html>
    `;

        return html;
    }

    /**
     * Render HTML elements from DSL
     */
    _renderElements() {
        return this.elements
            .map((el, idx) => {
                if (el.type === "background") {
                    return `
    <div class="track" data-track-index="${el.trackIndex}">
      <img 
        id="bg-${idx}"
        class="background-element" 
        src="${el.src}"
        data-start="${el.startTime}"
        data-duration="${el.duration}"
        data-track-index="${el.trackIndex}"
        style="opacity: ${el.options.opacity}"
      />
    </div>
          `;
                } else if (el.type === "text") {
                    return `
    <div 
      id="text-${idx}"
      class="track text-element fade-in"
      data-start="${el.startTime}"
      data-duration="${el.duration}"
      data-track-index="${el.trackIndex}"
      style="
        font-size: ${el.options.fontSize};
        color: ${el.options.color};
        font-weight: ${el.options.fontWeight};
        animation: ${el.options.animation} ${el.duration}s linear forwards;
        animation-delay: ${el.startTime}s;
      "
    >
      ${el.content}
    </div>
          `;
                } else if (el.type === "shape") {
                    return `
    <div
      id="shape-${idx}"
      class="track fade-in"
      data-start="${el.startTime}"
      data-duration="${el.duration}"
      data-track-index="${el.trackIndex}"
      style="
        background: ${el.options.color};
        width: ${el.options.width};
        height: ${el.options.height};
        animation: ${el.options.animation} ${el.duration}s linear forwards;
        animation-delay: ${el.startTime}s;
      "
    ></div>
          `;
                }
            })
            .join("\n");
    }

    /**
     * Generate GSAP timeline animations
     */
    _generateAnimations() {
        return this.elements
            .map((el, idx) => {
                if (el.type === "text") {
                    return `
    timeline.to("#text-${idx}", {
      opacity: 1,
      duration: ${el.duration},
    }, ${el.startTime});
          `;
                } else if (el.type === "shape") {
                    return `
    timeline.to("#shape-${idx}", {
      opacity: 1,
      duration: ${el.duration},
    }, ${el.startTime});
          `;
                }
                return "";
            })
            .join("\n");
    }

    /**
     * Get total video duration (for FFmpeg)
     */
    getDuration() {
        return Math.ceil(this.maxDuration) || 10;
    }
}

export default HyperframesCompiler;
