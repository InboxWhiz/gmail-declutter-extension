// import { useState } from 'react'

import { ActionButton } from './components/actionButton.tsx'
import { SenderLine } from './components/senderLine.tsx'
import { ReloadButton } from './components/reloadButton.tsx'

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
            <ActionButton id="unsubscribe-button" />
            <ActionButton id="delete-button" />
          </div>

          <ReloadButton />
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
