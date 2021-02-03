import React, {useState, useEffect, FormEvent} from 'react';
import Peer from 'peerjs';
import {Redirect} from 'react-router-dom';
import Streamer from './Streamer';
import io from "socket.io-client";
import Message from './Message';
import { v4 as uuidv4 } from 'uuid';

// @ts-ignore
const socket = io(process.env.REACT_APP_BACKEND_URL, {'sync disconnect on unload': true });

const peerDetails = {
    path: '/mypeer',
    host: '/',
}

if(process.env.NODE_ENV === 'production'){
    // @ts-ignore
    peerDetails.port = process.env.PORT || 5000;
}

interface ConnectParams {
    audio: boolean;
    video: boolean;
}



const Call:React.FC = () => {
    const [streamOptions, setStreamOptions] = useState<ConnectParams>({
        audio: false,
        video: true
    })
    const [videoStreams, setVideoStreams] = useState<MediaStream[]>([])
    const [userNames, setUserNames] = useState<string[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [messages, setMessages] = useState<Object[]>([]);
    const [fullName, setFullName] = useState(localStorage.getItem('fullName') ?? false);
    const [roomId, setRoomId] = useState(localStorage.getItem('roomId') ?? false);
    
    const myPeerUniqueID = uuidv4();
    const myPeer = new Peer(myPeerUniqueID)

    useEffect(() => {

        
        
        socket.emit('new-user-arriving-start', myPeerUniqueID, roomId, fullName);


        socket.on('new-user-arrived-finish', (peerID:string, roomID:string, userName:string) => {
            navigator.mediaDevices.getUserMedia(streamOptions)
            .then(stream => {

                localStorage.setItem('currentStreamId', stream.id);
                
                if(peerID == myPeerUniqueID){
                    setVideoStreams([stream])
                    setUserNames([userName])
                }
                else{
                    console.log('start to call');
                    var call = myPeer.call(peerID, stream);
                    call.on('stream', function(remoteStream) {
                        if(stream.id !== remoteStream.id){
                            setVideoStreams((streams) => {
                                const streamsCopy = [...streams];
                                streamsCopy.push(remoteStream);
                                return streamsCopy;
                            })
                        }
                    });
                }

                myPeer.on('call', function(call) {
                    call.answer(stream);
                    call.on('stream', function(remoteStream) {
                        if(stream.id !== remoteStream.id){
                            setVideoStreams((streams) => {
                                const streamsCopy = [...streams];
                                streamsCopy.push(remoteStream)
                                return streamsCopy;
                            })
                        }
                    });
                    
                });
                

            })
            .catch(err => {
                console.log('we have error', err);
            });
        })



        socket.on('new message received', (data: { sender: string, receivedMessage: string; }) => {
            let currentSender = data.sender;
            setMessages(currentArray => {
                return [...currentArray, {
                    sender:currentSender,
                    receivedMessage: data.receivedMessage
                }]
            })
            setNewMessage('');
        })

        socket.on('userLeft', (streamID: string) => {
            setVideoStreams(currentArray => {
                let currentStreams =  currentArray.filter(el => {
                    return el.id != streamID;
                })
                return [...currentStreams];
            })
        });


        window.onbeforeunload = () => {
            const currentStreamID = localStorage.getItem('currentStreamId');
            socket.emit('userExited', currentStreamID, roomId);
        }


       

    }, [])



    
    

    let videoStreamsList: any = "Loading...";

    if (videoStreams.length > 0) {
        // console.log(videoStreams);
        videoStreamsList = videoStreams.map((stream, idx) => <Streamer key={`stream-${idx}`} fullName={userNames[idx]} stream={stream} /> )
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
