import React from "react";

const RippleButton = ({
  text,
  children,
  bgColor,
  circleColor = "#D97757",
  width,
  height,
  className = "",
  style = {},
  onClick,
  ...props
}) => {
  return (
    <>
      <button
        className={`ripple-btn ${className}`}
        onClick={onClick}
        style={{
          backgroundColor: bgColor,
          width: width,
          height: height,
          ...style,
        }}
        {...props}
      >
        <span className="circle circle1"></span>
        <span className="circle circle2"></span>
        <span className="circle circle3"></span>
        <span className="circle circle4"></span>
        <span className="circle circle5"></span>
        <span className="btn-content">
          {children || text || "Click Me"}
        </span>
      </button>

      <style>{`
        .ripple-btn {
          font-weight: bold;
          border: none;
          border-radius: 0.6rem;
          position: relative;
          cursor: pointer;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          color: inherit;
        }

        .ripple-btn .circle {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          height: 30px;
          width: 30px;
          background-color: ${circleColor};
          border-radius: 50%;
          transition: 0.6s ease;
          pointer-events: none;
          z-index: 0;
        }

        .ripple-btn .btn-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .ripple-btn .circle1 { transform: translate(-3.3em, -4em); }
        .ripple-btn .circle2 { transform: translate(-6em, 1.3em); }
        .ripple-btn .circle3 { transform: translate(-0.2em, 1.8em); }
        .ripple-btn .circle4 { transform: translate(3.5em, 1.4em); }
        .ripple-btn .circle5 { transform: translate(3.5em, -3.8em); }

        .ripple-btn:hover .circle {
          transform: translate(-50%, -50%) scale(10);
          transition: 1.5s ease;
          opacity: 0.2;
        }
        
        /* Ensure disabled state still looks okay */
        .ripple-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        .ripple-btn:disabled:hover .circle {
          transform: translate(-50%, -50%);
          scale: 1;
        }
      `}</style>
    </>
  );
};

export default RippleButton;
