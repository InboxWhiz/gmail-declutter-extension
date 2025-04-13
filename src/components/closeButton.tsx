import "./closeButton.css";

export const CloseButton = () => {
  const handleClick = () => {
    const bodyElement: HTMLElement | null =
      document.getElementById("declutter-body");
    if (bodyElement) {
      bodyElement.style.display = "none";
    }
  };

  return (
    <button
      className="close-button"
      aria-label="Close"
      onClick={handleClick}
    ></button>
  );
};
