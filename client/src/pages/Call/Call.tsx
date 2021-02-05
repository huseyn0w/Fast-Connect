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
        audio: true,
        video: true
    })
    const [videoStreams, setVideoStreams] = useState<MediaStream[]>([])
    const [myStream, setMyStream] = useState<MediaStream>();
    const [userNames, setUserNames] = useState<string[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [messages, setMessages] = useState<Object[]>([]);
    const [fullName, setFullName] = useState(localStorage.getItem('fullName') ?? false);
    const [roomId, setRoomId] = useState(localStorage.getItem('roomId') ?? false);
    
    const myPeerUniqueID = uuidv4();
    const myPeer = new Peer(myPeerUniqueID)
    //@ts-ignore
    let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    useEffect(() => {

        
        
        socket.emit('new-user-arriving-start', myPeerUniqueID, roomId, fullName);


        socket.on('new-user-arrived-finish', (peerID:string, roomID:string, userName:string) => {
            
            
            getUserMedia(streamOptions, function(stream) {
                setMyStream(stream);

                localStorage.setItem('currentStreamId', stream.id);
                
                if(peerID == myPeerUniqueID){
                    setUserNames([userName])
                }
                else{
                    // console.log('im calling');
                    var call = myPeer.call(peerID, stream);
                    call.on('stream', function(remoteStream) {
                        // console.log('my current Stream', stream)
                        // console.log('i receive a stream', remoteStream)
                        if(stream.id !== remoteStream.id){
                            setVideoStreams((streams) => {
                                const streamsCopy = [...streams];
                                const found = streamsCopy.some(el => el.id === remoteStream.id);
                                if(!found) streamsCopy.push(remoteStream)
                                return streamsCopy;
                            })
                            
                        }
                    });
                }
                
                

              }, function(err) {
                console.log('Failed to get local stream' ,err);
              });
            
            

        })


        
        myPeer.on('call', function(call) {
            getUserMedia({video: true, audio: true}, function(stream) {
                setMyStream(stream);

                localStorage.setItem('currentStreamId', stream.id);
                call.answer(stream);
                call.on('stream', function(remoteStream) {
                    // console.log('remote stream', remoteStream)
                    // console.log('my stream', stream)
                    if(myStream?.id !== remoteStream.id){
                        console.log(videoStreams);
                        
                        // console.log(found);
                        setVideoStreams((streams) => {
                            // console.log(streams);
                            const streamsCopy = [...streams];
                            
                            const found = streamsCopy.some(el => el.id === remoteStream.id);
                            if(!found) streamsCopy.push(remoteStream)
                            console.log('b', streamsCopy);
                            return streamsCopy;
                        })
                        
                    }
                });
            }, function(err) {
                console.log('Failed to get local stream' ,err);
            });
        });





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



    
    

    let videoStreamsList;

    videoStreamsList = (
        <>
            {myStream && (<Streamer fullName={'ELman'} muted={true} stream={myStream} /> ) }
            {videoStreams.length > 0 && (videoStreams.map((stream, idx) => <Streamer key={`stream-${idx}`} fullName={userNames[idx]} muted={false} stream={stream} /> ))}
        </>
    )

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
