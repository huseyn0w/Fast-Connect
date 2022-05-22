import React, {useState, useEffect, FormEvent, useMemo, useCallback} from 'react';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import Peer from 'peerjs';
import {Redirect} from 'react-router-dom';
import Streamer from './Streamer';
import io from "socket.io-client";
import Message from './Message';
import { v4 as uuidv4 } from 'uuid';

interface ConnectParams {
    audio: boolean;
    video: boolean;
}

interface VideoStreamsInterface {
    user: string;
    stream: MediaStream;
}

const Call:React.FC = () => {
    const socket = useMemo(() => io(process.env.REACT_APP_BACKEND_URL ?? ''), []);
    const myPeerUniqueID = useMemo(() => uuidv4(), []);
    const myPeer = useMemo(() => new Peer(myPeerUniqueID), [myPeerUniqueID]); 
    const [streamOptions] = useState<ConnectParams>({
        audio: true,
        video: true
    })

    const [videoStreams, setVideoStreams] = useState<VideoStreamsInterface[]>([])
    const [peersArray, setPeersArray] = useState<string[]>([]);
    const [myStream, setMyStream] = useState<MediaStream>();
    const [newMessage, setNewMessage] = useState<string>('');
    const [messages, setMessages] = useState<Object[]>([]);
    const [shareScreenButtonText, setShareScreenButtonText] = useState<string>(
        'Start screen sharing'
    )
    const [fullName] = useState(localStorage.getItem('fullName') ?? 'User');
    const [roomId] = useState(localStorage.getItem('roomId') ?? false);
    const screenVideoRef =  React.createRef<HTMLVideoElement>();
    const [startSharing, setStartSharing] = useState<Boolean>(false)
    const [startSharingButtonDisabled, setStartSharingButtonDisabled] = useState<Boolean>(false)
    const [screenStream, setScreenStream] =  useState<MediaStream>();
    
    const getUserMedia = useMemo(() => {
        return navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia
    }, []);

    useEffect(() => {
        // user just opened the call page
        getUserMedia(streamOptions, function(stream) {
            setMyStream(stream);
            socket.emit('i-am-arrived', myPeerUniqueID, roomId, fullName);

        }, function(err) {
            console.log('Failed to get my local stream' ,err);
        });
    }, [myPeerUniqueID, roomId, fullName, socket, getUserMedia, streamOptions])

    useEffect(() => {
        // We have new user in the room, all members in the room needs to call him only when our stream data available
        socket.on('new-user-arrived', (peerID:string, roomID:string, userName:string) => {
            
            if(myStream){
                setPeersArray((peers) => {
                    const streamsCopy = [...peers];
                    const found = streamsCopy.some(el => el === peerID);
                    if(!found && peerID !== myPeerUniqueID) streamsCopy.push(peerID)
    
                    return streamsCopy;
                })
                const call = myPeer.call(peerID, myStream, {metadata: {userName: fullName, screenShare: false, stopShare: false, streamID: null}} )
                
                call.on('stream', function(remoteStream) {
                    setVideoStreams((streams) => {
                        const streamsCopy = [...streams];
                        
                        const found = streamsCopy.some(el => el.stream.id === remoteStream.id);
                        if(!found) streamsCopy.push({user: userName, stream: remoteStream})
                        return streamsCopy;
                    })
                });
            }
        })
    }, [socket, peersArray, myPeerUniqueID, myPeer, myStream, fullName, screenStream]);

    useEffect(() => {
        // We are receiving the call, answering and send our streaming data back when it is available
        myPeer.on('call', function(call) {
            if(myStream){
                call.answer(myStream);

                setPeersArray((peers) => {
                    const streamsCopy = [...peers];
                    const found = streamsCopy.some(el => el === call.peer);
                    if(!found && call.peer !== myPeerUniqueID) streamsCopy.push(call.peer)
                    return streamsCopy;
                })
                
                call.on('stream', function(remoteStream) {
                    if(call.metadata.screenShare){
                        setScreenStream(call.metadata.stopShare ? undefined : remoteStream);
                    }
                    else {
                        setVideoStreams((streams) => {
                            const streamsCopy = [...streams];
                            
                            const found = streamsCopy.some(el => el.stream.id === remoteStream.id);
                            if(!found && call.metadata.streamID !== remoteStream.id) streamsCopy.push({user:call.metadata.userName, stream: remoteStream})
                            return streamsCopy;
                        })
                    }
                });
            }
            
      });
    }, [getUserMedia, myPeer, myStream, myPeerUniqueID])

    useEffect(() => {
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
    }, [socket])


    useEffect(() => {
        socket.on('userLeft', (streamID: string) => {
            setVideoStreams(currentArray => {
                let currentStreams =  currentArray.filter(el => {
                    return el.stream.id !== streamID;
                })
                return [...currentStreams];
            })
        });

        window.onbeforeunload = () => {
            myPeer.disconnect();
            const currentStreamID = localStorage.getItem('currentStreamId');
            socket.emit('userExited', currentStreamID, roomId);
        }
    }, [roomId, socket, myPeer])

    useEffect(() => {
        if(screenStream){
            if(screenVideoRef?.current){
                screenVideoRef.current.srcObject = screenStream;
                screenVideoRef.current.onloadedmetadata = function(e) {
                    if(screenVideoRef?.current){
                        screenVideoRef.current.play();
                    }
                }
            }
        }
    }, [screenVideoRef, screenStream])

    const stopScreenShare = useCallback(() => {
        const tracks = screenStream?.getTracks();
        if(tracks && screenStream){
            for( var i = 0 ; i < tracks.length ; i++ ) tracks[i].stop();
            if(peersArray.length > 0){
                peersArray.forEach(peer => {
                    myPeer.call(peer, screenStream, {metadata: {userName: fullName, screenShare: true, stopShare: true, streamID: null}} )
                })
                setStartSharing(false)
                setScreenStream(undefined);
                setShareScreenButtonText('Start screen Sharing')
            }
            return;
        }
        
        
        return;
    }, [screenStream, myPeer, peersArray, fullName])


    const startScreenShare = useCallback(async () => {
        try {
            const mediaDevices = navigator.mediaDevices as any;
            let captureStream = await mediaDevices.getDisplayMedia({video:true, audio: false});

            setStartSharing(true);
            
            setScreenStream(captureStream);

            setShareScreenButtonText('Stop screen sharing')

            if(peersArray.length > 0){
                peersArray.forEach(peer => {
                    myPeer.call(peer, captureStream, { metadata: { userName: fullName, screenShare: true, stopShare: false, streamID: captureStream.id} })
                })
            }
          
        } catch (err) {
          console.error("Error: " + err);
        }
    }, [myPeer, peersArray, fullName])



    const shareScreenHandler = useCallback(async () => {

        if(startSharing && screenStream){
            return stopScreenShare();
        }

        return await startScreenShare();
      
        
      }, [startScreenShare, stopScreenShare, startSharing, screenStream])

    

    const videoStreamsList =  useMemo(() => {
        return (
            <>
                {myStream && (<Streamer controls={true} fullName={fullName ?? 'User 1'} muted={true} stream={myStream} /> ) }
                {videoStreams.length > 0 && (
                    videoStreams.map(({user, stream}, idx) => {
    
                        return (
                            <Streamer key={`stream-${idx}`} controls={false} fullName={user ?? `User ${idx + 1}`} muted={false} stream={stream} /> 
                        )
                    }
                ))}
                
            </>
        )
    }, [myStream, videoStreams, fullName])

    const videoSharingBlock = useMemo(() => {
        return (
            <>
                {screenStream && screenVideoRef && (
                    <div className="screen-sharing-video-cover">
                        <video ref={screenVideoRef} muted={false} autoPlay={true} />
                    </div>
                )}
            </>
        )
    }, [screenStream, screenVideoRef])

    const formHandler = (e:FormEvent) => {
        e.preventDefault();
        if(newMessage){
            socket.emit('new message', {
                sender:fullName,
                receivedMessage: newMessage
            }, roomId)
        }
    }


    return (
        <>
        {!roomId && (<Redirect to="/" />)}
        {roomId && (
            <div className="AppCover">
                <div className="video-streams">
                    <div className="streamsCover">
                        {videoStreamsList}
                    </div>
                    {videoSharingBlock}
                </div>
                <div className="video-sidebar">
                    <div className="room-headline">
                        <div>Copy and share the room ID in order to join the conference</div>
                        <strong>ROOM ID: {roomId}</strong>
                    </div>
                    {videoStreams.length > 0 && (
                        <div className="screenShareCover">
                            <button type="button" className="screen-share" disabled={startSharingButtonDisabled ? true : false}  onClick={shareScreenHandler}>
                                {shareScreenButtonText}
                                <ScreenShareIcon />
                            </button>
                        </div>
                    )}
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
        )}
        </>

    )
}

export default Call;
