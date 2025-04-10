// import { useState } from 'react'

import { SenderLine } from './components/senderLine.tsx'

function App() {
  return (
    <>
      <div id="declutter-body">
        <div className="declutter-body-header">
          <p className="declutter-body-title">Declutter</p>
          <button className="close-button" aria-label="Close"></button>
        </div>

        <div className="button-bar">
          <div className="sender-actions">
            <button id="unsubscribe-button">
              <i className="fa-solid fa-ban"></i>
              Unsubscribe
            </button>

            <button id="delete-button">
              <i className="fa-solid fa-trash"></i>
              Delete
            </button>
          </div>

          <button id="reload-button">
            <i className="fa-solid fa-rotate"></i>
          </button>
        </div>

        <p className="loading-message">Loading messages...</p>

        <div id="senders">
          <SenderLine senderName="Sender name" senderEmail="email@email.com" senderCount={42} />
          <SenderLine senderName="Sender name" senderEmail="email@email.com" senderCount={43} />
          <SenderLine senderName="Sender name" senderEmail="email@email.com" senderCount={44} />
        </div>
      </div>
    </>
  )
}

export default App
