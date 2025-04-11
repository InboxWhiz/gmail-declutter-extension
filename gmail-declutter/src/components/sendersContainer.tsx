import { useEffect, useState } from 'react';
import { SenderLine } from './senderLine';
import { Sender } from '../types/types';
import { getAllSenders } from '../utils/actions';


export const SendersContainer = () => {
    const [senders, setSenders] = useState<Sender[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSenders = async () => {
            const data = await getAllSenders();
            setSenders(data);
            setLoading(false);
        };

        fetchSenders();
    }, []);

    return (
        <div id="senders">
            {loading ? (
                <p style={{"textAlign": "center"}}>Loading messages...</p>
            ) : (
                senders.map((sender, index) => (
                    <SenderLine
                        key={index}
                        senderName={sender.name}
                        senderEmail={sender.email}
                        senderCount={sender.count}
                    />
                ))
            )}
        </div>
    )
}