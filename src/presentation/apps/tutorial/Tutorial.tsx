import { useState } from "react";
import "./Tutorial.css";
import { Step1, Step2, Step3, Success, WelcomeStep } from "./components/steps";
import { Modal } from "./components/modal";

const Tutorial = () => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    setStep(step + 1);
  };

  return (
    <Modal>
      <div className="tutorial-popup">
        {step === 0 ? (
          <WelcomeStep onNext={handleNext} />
        ) : step === 1 ? (
          <Step1 onNext={handleNext} />
        ) : step === 2 ? (
          <Step2 onNext={handleNext} />
        ) : step === 3 ? (
          <Step3 onNext={handleNext} />
        ) : step === 4 ? (
          <Success />
        ) : null}
      </div>
    </Modal>
  );
};

export default Tutorial;
