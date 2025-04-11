// import { useState } from 'react'

import './App.css'
import { ActionButton } from './components/actionButton.tsx'
import { SenderLine } from './components/senderLine.tsx'
import { ReloadButton } from './components/reloadButton.tsx'
import { CloseButton } from './components/closeButton.tsx'
import { ModalPopup } from './components/modalPopup.tsx'
import { SelectedSendersProvider} from './contexts/selectedSendersContext.tsx'
import { ModalProvider } from './contexts/modalContext.tsx'

function App() {
  return (
    <SelectedSendersProvider>
      <ModalProvider>
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
            <SenderLine senderName="Sender name 1" senderEmail="email1@email.com" senderCount={42} />
            <SenderLine senderName="Sender name 2" senderEmail="email2@email.com" senderCount={43} />
            <SenderLine senderName="Sender name 3" senderEmail="email3@email.com" senderCount={44} />
            <SenderLine senderName="Sender name 4" senderEmail="email4@email.com" senderCount={45} />
            <SenderLine senderName="Sender name 5" senderEmail="email5@email.com" senderCount={46} />
            <SenderLine senderName="Sender name 6" senderEmail="email6@email.com" senderCount={44} />
            <SenderLine senderName="Sender name 7" senderEmail="email7@email.com" senderCount={44} />
            <SenderLine senderName="Sender name 8" senderEmail="email8@email.com" senderCount={44} />
          </div>
        </div>
        <ModalPopup />
      </ModalProvider>
    </SelectedSendersProvider>
  )
}

export default App
