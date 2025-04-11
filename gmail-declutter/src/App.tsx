// import { useState } from 'react'

import './App.css'
import { ActionButton } from './components/actionButton.tsx'
import { ReloadButton } from './components/reloadButton.tsx'
// import { CloseButton } from './components/closeButton.tsx'
import { ModalPopup } from './components/modalPopup.tsx'
import { SendersContainer } from './components/sendersContainer.tsx'
import { AllGlobalProviders } from './contexts/allGlobalProviders.tsx'

function App() {
  return (
    <AllGlobalProviders>
      <div id="declutter-body">

        {/* <div className="declutter-body-header">
          <p className="declutter-body-title">Declutter</p>
          <CloseButton />
        </div> */}

        <div className="button-bar">
          <div className="sender-actions">
            <ActionButton id="unsubscribe-button" />
            <ActionButton id="delete-button" />
          </div>

          <ReloadButton />
        </div>

        <SendersContainer />

        <ModalPopup />

      </div>
    </AllGlobalProviders>
  )
}

export default App
