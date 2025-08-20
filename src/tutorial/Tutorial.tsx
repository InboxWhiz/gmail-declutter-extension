import { useState } from "react";
import "./Tutorial.css";
import {
  Step1,
  Step2,
  Step3,
  Step4,
  Success,
  WelcomeStep,
} from "./components/steps";
import { Modal } from "./components/modal";
import { ActionsProvider } from "../_shared/providers/actionsContext";

const Tutorial = () => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    setStep(step + 1);
  };

  return (
    <ActionsProvider>
      <Modal
        onClose={
          step === 5
            ? () => {
                chrome.tabs.query(
                  { active: true, currentWindow: true },
                  (tabs) => {
                    const tab = tabs[0];
                    if (tab && tab.id !== undefined) {
                      chrome.tabs.sendMessage(tab.id, {
                        action: "CLOSE_TUTORIAL",
                      });
                    }
                  },
                );
              }
            : () => {}
        }
      >
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
          ) : null}
        </div>
      </Modal>
    </ActionsProvider>
  );
};

export default Tutorial;
