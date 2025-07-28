import React from "react";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/Loading animation blue"; // chemin vers le fichier

const LoadingSpinner = () => {
  return (
    <div style={{ width: 200, height: 200 }}>
      <Lottie animationData={loadingAnimation} loop={true} />
    </div>
  );
};

export default LoadingSpinner;
