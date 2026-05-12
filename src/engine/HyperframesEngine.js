/**
 * Hyperframes Engine
 * Renders Hyperframes DSL to an HTML5 Canvas
 */
export class HyperframesEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.composition = null;
        this.width = 1920;
        this.height = 1080;
    }

    setComposition(composition) {
        this.composition = composition;
        if (composition.width) this.width = composition.width;
        if (composition.height) this.height = composition.height;
        
        // Ensure canvas matches resolution
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    /**
     * Render a specific frame
     * @param {number} frame - The frame index to render
     */
    render(frame) {
        if (!this.composition) return;

        const { elements, fps = 30 } = this.composition;
        const currentTime = frame / fps;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Fill background
        this.ctx.fillStyle = this.composition.background || "#000000";
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Sort elements by track/z-index if available (not in example but good practice)
        // For now, render in order
        elements.forEach((el) => {
            this._renderElement(el, frame, currentTime);
        });
    }

    _renderElement(el, frame, currentTime) {
        const opacity = this._calculateOpacity(el, frame);
        if (opacity <= 0) return;

        this.ctx.save();
        this.ctx.globalAlpha = opacity;

        if (el.type === "text") {
            const style = el.style || {};
            const fontSize = style.fontSize || 64;
            const color = style.color || "white";
            const font = `${style.fontWeight || "bold"} ${fontSize}px Arial, sans-serif`;
            
            this.ctx.font = font;
            this.ctx.fillStyle = color;
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";

            const x = style.x !== undefined ? style.x : this.width / 2;
            const y = style.y !== undefined ? style.y : this.height / 2;

            this.ctx.fillText(el.value, x, y);
        } else if (el.type === "shape") {
             const style = el.style || {};
             this.ctx.fillStyle = style.color || "blue";
             const w = style.width || 200;
             const h = style.height || 200;
             const x = (style.x !== undefined ? style.x : this.width / 2) - w/2;
             const y = (style.y !== undefined ? style.y : this.height / 2) - h/2;
             this.ctx.fillRect(x, y, w, h);
        }

        this.ctx.restore();
    }

    _calculateOpacity(el, frame) {
        let opacity = 1.0;
        if (!el.animations) return opacity;

        el.animations.forEach(anim => {
            if (anim.type === "fadeIn") {
                if (frame < anim.start) {
                    opacity = 0;
                } else if (frame < anim.start + anim.duration) {
                    const progress = (frame - anim.start) / anim.duration;
                    opacity = Math.min(opacity, progress);
                }
            } else if (anim.type === "fadeOut") {
                 if (frame > anim.start + anim.duration) {
                    opacity = 0;
                } else if (frame > anim.start) {
                    const progress = 1 - (frame - anim.start) / anim.duration;
                    opacity = Math.min(opacity, progress);
                }
            }
        });

        return opacity;
    }
}

export default HyperframesEngine;
