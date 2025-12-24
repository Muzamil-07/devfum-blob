export const AnimatedGlowCircle = () => {
  return (
    <>
      {/* 1. Define the Spin Animation */}
      <style>
        {`
          @keyframes spin-glow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* 2. The Wrapper (Centers everything on screen) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* 3. The Spinning Glow Layer */}
        <div
          style={{
            position: "absolute",
            width: "110%", // Slightly larger so glow bleeds out
            height: "110%",
            borderRadius: "50%", // 50% is safer than 100% for some browsers
            // The Gradient:
            background: "conic-gradient(from 0deg, #ff009088, #af28ca74, #111111, #111111)",
            // The Blur:
            filter: "blur(80px)",
            // The Animation: 4 seconds, linear speed, looping forever
            animation: "spin-glow 4s linear infinite",
            zIndex: 0, 
          }}
        />

        {/* 4. The Stationary White Circle (Your Content) */}
        <div
          style={{
            position: "relative", // Needed to sit on top of the absolute glow
            height: "100%",
            width: "100%",
            backgroundColor: "transparent", // Change this to your desired background color
            borderRadius: "50%",
            zIndex: 1, // Ensures this stays on top
            // Optional: Keeps the neomorphic look by adding a subtle inset shadow
            boxShadow: "inset 0px 0px 20px rgba(0,0,0,0.05)",
            overflow: "hidden", 
          }}
        >
          {/* Your content goes here - it will NOT spin */}
        </div>
      </div>
    </>
  );
};

export default AnimatedGlowCircle;