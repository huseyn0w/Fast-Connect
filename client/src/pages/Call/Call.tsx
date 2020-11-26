import React, {useState, useEffect, FormEvent} from 'react';
import Peer from 'peerjs';
import {Redirect} from 'react-router-dom';
import Streamer from './Streamer';
import io from "socket.io-client";
import Message from './Message';

// @ts-ignore
const socket = io(process.env.REACT_APP_BACKEND_URL, {'sync disconnect on unload': true });

const Call:React.FC = () => {
    const [videoStreams, setVideoStreams] = useState<MediaStream[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [messages, setMessages] = useState<Object[]>([]);
    
    

    let roomId = localStorage.getItem('confID') ?? undefined;
    let fullName = localStorage.getItem('fullName') ?? '';

    const myPeer = new Peer(undefined, {
        path: '/mypeer',
        host: '/',
        port: 5000
    })

    

    useEffect(() => {
        
        if(typeof(roomId) === 'undefined' || fullName === '') return;

        myPeer.on('open', (peerID) => {
            socket.emit('new-user-arriving-start', peerID, roomId)
        });

        socket.on('new-user-arrived-finish', (newPeerId: string, roomId: string) => {

            navigator.mediaDevices.getUserMedia({ audio: false, video: true })
            .then(stream => {

                const currentStreamID = stream.id;

                localStorage.setItem('currentStreamId', currentStreamID);

                const call = myPeer.call(newPeerId, stream);
                if(call){
                    call.on('stream', function(remoteStream) {
                        // console.log('remoteStream arrives')
                        setVideoStreams(currentArray => {
                            return [...currentArray, remoteStream]
                        })
                    });
                }

            })
            .catch(err => {
                console.log('we have error', err);
            });
        })

        
        




        myPeer.on('call', call => {
            navigator.mediaDevices.getUserMedia({ audio: false, video: true })
            .then(stream => {
                call.answer(stream);
                setVideoStreams(currentArray => {
                    return [...currentArray, stream]
                })
            })
            .catch(err => {
                console.log('we have error', err);
            });
        })


        socket.on('new message received', (data: { fullName: string; receivedMessage: string; }) => {
            setMessages(currentArray => {
                return [...currentArray, {
                    sender:fullName,
                    receivedMessage: data.receivedMessage
                }]
            })
            setNewMessage('');
        })


        window.onbeforeunload = () => {
            const currentStreamID = localStorage.getItem('currentStreamId');
            socket.emit('userExited', currentStreamID, roomId);
        }

    }, []);

    // useEffect(() => { 
    //     socket.on('userLeft', (streamID: string) => {
    //         console.log('user has left', streamID, videoStreams);
    //         let currentStreams =  videoStreams.map(el => {
    //             return el.id != streamID;
    //         })
    //     });

    // }, [videoStreams])


    let videoStreamsList: any = "Loading...";

    if (videoStreams.length > 0) {
        // console.log(videoStreams);
        videoStreamsList = videoStreams.map((stream, idx) => <Streamer key={`stream-${idx}`} fullName={fullName} stream={stream} /> )
    }

    const formHandler = (e:FormEvent) => {
        e.preventDefault();
        if(newMessage){
            socket.emit('new message', {
                sender:fullName,
                receivedMessage: newMessage
            }, roomId)
        }
        

        
    }


    return roomId  ? 
        <div className="AppCover">
            <div className="video-streams">
                {videoStreamsList}
            </div>
            <div className="video-sidebar">
                <div className="room-headline">
                    <div>Copy and share the room ID in order to join the conference</div>
                    <strong>ROOM ID: {roomId}</strong>
                </div>
                <div className="messages">
                    {messages.length > 0 ? 
                        messages.map((el, idx) => {
                            let data:any = el;
                            return <Message key={idx} data={data} />
                        })
                    : 'Chat is empty'}
                </div>
                <div className="input-area">
                    <form onSubmit={formHandler}>
                        <input type="text" name="message" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Message" />
                    </form>
                </div>
            </div>
        </div>
        : <Redirect to="/" />;
}

export default Call
