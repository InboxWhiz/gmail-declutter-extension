import { useState } from "react";
import "./Tutorial.css";
import { Step1, Step2, Step3, Step4, Success, WelcomeStep } from "./components/steps";
import { Modal } from "./components/modal";


const Tutorial = () => {
  const [step, setStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleNext = () => {
    setStep(step + 1);
  };

  return (
    <Modal isOpen={isModalOpen} onClose={step === 5 ? () => setIsModalOpen(false) : () => {}}>
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
          <Step4 onNext={handleNext} />
        ) : step === 5 ? (
          <Success />
        ) : (null)}

      </div>
    </Modal>
  );
}

export default Tutorial;