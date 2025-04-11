// import { useState } from 'react'

import { ActionButton } from './components/actionButton.tsx'
import { SenderLine } from './components/senderLine.tsx'
import { ReloadButton } from './components/reloadButton.tsx'
import { CloseButton } from './components/closeButton.tsx'
import './App.css'
import { ModalPopup } from './components/modalPopup.tsx'

function App() {
  return (
    <>
      <div id="declutter-body">
        <div className="declutter-body-header">
          <p className="declutter-body-title">Declutter</p>
          <CloseButton />
        </div>

        <div className="button-bar">
          <div className="sender-actions">
            <ActionButton id="unsubscribe-button" />
            <ActionButton id="delete-button" />
          </div>

          <ReloadButton />
        </div>

        {/* <p className="loading-message">Loading messages...</p> */}

        <div id="senders">
          <SenderLine senderName="Sender name" senderEmail="email@email.com" senderCount={42} />
          <SenderLine senderName="Sender name" senderEmail="email@email.com" senderCount={43} />
          <SenderLine senderName="Sender name" senderEmail="email@email.com" senderCount={44} />
        </div>
      </div>
      <ModalPopup type="no-sender" />
      <ModalPopup type="delete-confirm" />
      <ModalPopup type="delete-pending" />
      <ModalPopup type="delete-success" />
    </>
  )
}

export default App
