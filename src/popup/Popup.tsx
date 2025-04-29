import "./Popup.css";

const supportLink = ""; // TODO: Replace with actual support link
const donateLink = "https://buymeacoffee.com/inboxwhiz";
const feedbackLink = ""; // TODO: Replace with actual feedback link
const version = "1.0.0";

const PopupApp = () => {
  const openGmail = () => {
    window.open("https://mail.google.com", "_blank");
  };

  return (
    <div className="popup-content">
      <h2>InboxWhiz</h2>
      <p>Manage your inbox effortlessly with InboxWhiz!</p>

      <div className="centered-button-container">
        <button className="open-gmail-button" onClick={openGmail}>
          <img
            src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico"
            alt="Gmail Logo"
            className="gmailLogo"
            style={{ width: "20px", height: "20px" }}
          />
          Open Gmail
        </button>
      </div>

      <div className="popupLinks">
        <p>
          <strong>Need Help? 🤔</strong>{" "}
          <a href={supportLink} target="_blank" rel="noopener noreferrer">
            Visit our Support Page
          </a>
        </p>
        <p>
          <strong>Support Development:</strong>{" "}
          <a href={donateLink} target="_blank" rel="noopener noreferrer">
            Donate Here
          </a>
          💖
        </p>
        <p>
          <strong>Loved the tool? </strong>{" "}
          <a href={feedbackLink} target="_blank" rel="noopener noreferrer">
            Leave a Review
          </a>
          ⭐
        </p>
      </div>

      <div className="version-info">
        <p>Version {version}</p>
      </div>
    </div>
  );
};

export default PopupApp;
