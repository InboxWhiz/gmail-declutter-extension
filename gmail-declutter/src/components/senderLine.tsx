import { useState } from 'react';
import { searchEmailSenders } from '../utils/actions'
import './senderLine.css'

interface SenderLineProps {
    senderName: string;
    senderEmail: string;
    senderCount: number;
}

export const SenderLine = ({ senderName, senderEmail, senderCount }: SenderLineProps) => {
    const [isSelected, setIsSelected] = useState(false);

    return (
        <div className={isSelected ? "sender-line selected" : "sender-line"}>
            <div className="begin">
                <div>
                    <input
                        type="checkbox"
                        onClick={() => setIsSelected(!isSelected)}
                    />
                </div>
                <div className="sender-details">
                    <span className="sender-name">{senderName}</span>
                    <span className="sender-email" onClick={() => searchEmailSenders([senderEmail])}>{senderEmail}</span>
                </div>
            </div>
            <div className="email-count">
                <span>{senderCount}</span>
            </div>
        </div>
    )
}