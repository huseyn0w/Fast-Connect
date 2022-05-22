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

const Call:React.FC = () => {
    const socket = useMemo(() => io(process.env.REACT_APP_BACKEND_URL ?? ''), []);
    const myPeerUniqueID = useMemo(() => uuidv4(), []);
    const myPeer = useMemo(() => new Peer(myPeerUniqueID), [myPeerUniqueID]); 
    const [streamOptions] = useState<ConnectParams>({
        audio: false,
        video: true
    })

    const [videoStreams, setVideoStreams] = useState<MediaStream[]>([])
    const [peersArray, setPeersArray] = useState<string[]>([]);
    const [myStream, setMyStream] = useState<MediaStream>();
    const [userNames, setUserNames] = useState<string[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [messages, setMessages] = useState<Object[]>([]);
    const [shareScreenButtonText, setShareScreenButtonText] = useState<string>(
        'Start screen sharing'
    )
    const [fullName, setFullName] = useState(localStorage.getItem('fullName') ?? '');
    const [roomId] = useState(localStorage.getItem('roomId') ?? false);
    const screenVideoRef =  React.createRef<HTMLVideoElement>();
    const [startSharing, setStartSharing] = useState<Boolean>(false)
    const [startSharingButtonDisabled, setStartSharingButtonDisabled] = useState<Boolean>(false)
    const [screenStreamID, setScreenStreamID] =  useState<string>();
    const [screenStream, setScreenStream] =  useState<MediaStream>();
    
    const getUserMedia = useMemo(() => {
        return navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia
    }, []);

    useEffect(() => {
        socket.on('screen-share-receive', (streamID:string) => {

            // setScreenStreamID(streamID);
            setShareScreenButtonText('Start screen sharing')
            setStartSharingButtonDisabled(true)

        })

        socket.on('screen-share-stop-done', (streamID: string) => {
            setStartSharingButtonDisabled(false);
            setVideoStreams(streams => {
                const streamsCopy = streams.filter(el => {
                    return el.id !== streamID
                }) 
                return streamsCopy;
            })
        })
    }, [socket])

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
        myPeer.on('call', function(call) {
            getUserMedia({video: true, audio: true}, function(stream) {

              localStorage.setItem('currentStreamId', stream.id);
              call.answer(stream);
              
              call.on('stream', function(remoteStream) {
                console.log(remoteStream.id, screenStreamID)
                  if(screenStreamID === remoteStream.id){
                      console.log('i have received screen stream id')  
                  }
                  else{
                    setVideoStreams((streams) => {
                        const streamsCopy = [...streams];
                        
                        const found = streamsCopy.some(el => el.id === remoteStream.id);
                        if(!found) streamsCopy.push(remoteStream)
                        return streamsCopy;
                    })
                  }
              });
          }, function(err) {
              console.log('Failed to get local stream' ,err);
          });
      });
    }, [getUserMedia, myPeer, screenStreamID])

    useEffect(() => {
        socket.on('userLeft', (streamID: string) => {
            setVideoStreams(currentArray => {
                let currentStreams =  currentArray.filter(el => {
                    return el.id !== streamID;
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

        myPeer.on('connection', function(conn) {
            if(conn.metadata.screenShare){
                console.log('this is screen share stream')
                console.log(conn.metadata.streamID)
                setScreenStreamID(conn.metadata.streamID)
            }
            else{
                console.log('this is normal streaming')
            }
        });

        socket.emit('new-user-arriving-start', myPeerUniqueID, roomId, fullName);

        socket.on('new-user-arrived-finish', (peerID:string, roomID:string, userName:string) => {
            
            setPeersArray((peers) => {
                const streamsCopy = [...peers];
                const found = streamsCopy.some(el => el === peerID);
                if(!found && peerID !== myPeerUniqueID) streamsCopy.push(peerID)

                return streamsCopy;
            })
        
        
            if(!fullName){
                localStorage.setItem('fullName', userName)
                setFullName(userName)
            }

            socket.emit('newUserName', roomId, fullName)

            
            getUserMedia(streamOptions, function(stream) {
                setMyStream(stream);

                localStorage.setItem('currentStreamId', stream.id);

                
                
                if(peerID !== myPeerUniqueID){

                    socket.emit('sendMyPeer', roomID, myPeerUniqueID);
                    myPeer.connect(peerID, { metadata: { userName: fullName, screenShare: false, streamID: stream.id } });
                    var call = myPeer.call(peerID, stream);
                   
                    call.on('stream', function(remoteStream) {
                        console.log(remoteStream.id, screenStreamID)
                        if(screenStreamID === remoteStream.id){
                            console.log('i have received screen stream id')  
                        }
                        else{
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

        
        socket.on('receiveMyPeer', (peer: string) => {
            setPeersArray((peers) => {
                const streamsCopy = [...peers];
                const found = streamsCopy.some(el => el === peer);
                if(!found && peer !== myPeerUniqueID) streamsCopy.push(peer)
                return streamsCopy;
            })
        })

        socket.on('newUserName', (userName: string) => {
            if(userName !== fullName){
                setUserNames(userNames => {
                    const userNamesCopy = [...userNames];
                    const found = userNamesCopy.some(el => el === userName);
                    if(!found) userNamesCopy.push(userName)
                    
                    return userNamesCopy;
               })
            }
        })


    }, [fullName, myPeer, roomId, streamOptions, myPeerUniqueID, socket, getUserMedia])

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

    useEffect(() => {

        if(screenStreamID){
            setVideoStreams(streams => {
                let screenStreams = streams.filter(el => el.id === screenStreamID)
                if(screenStreams.length > 0){
                    setScreenStream(screenStreams[0])
                    let streamsCopy = [...streams].filter(el => el.id !== screenStreams[0].id)
                    return streamsCopy
                }

                return streams;
            })
        }

    }, [screenStreamID, videoStreams])


    const stopScreenShare = useCallback(() => {
        socket.emit('screen-share-stop', roomId, screenStream?.id);
        const tracks = screenStream?.getTracks();
        if(tracks){
            for( var i = 0 ; i < tracks.length ; i++ ) tracks[i].stop();
            setStartSharing(false)
            setScreenStream(undefined);
            setShareScreenButtonText('Start screen Sharing')
            return;
        }
        
        
        return;
    }, [screenStream, roomId, socket])


    const startScreenShare = useCallback(async () => {
        try {
            const mediaDevices = navigator.mediaDevices as any;
            let captureStream = await mediaDevices.getDisplayMedia({video:true, audio: false});

            setStartSharing(true);
            
            setScreenStream(captureStream);

            setShareScreenButtonText('Stop screen sharing')

            if(peersArray.length > 0){
                peersArray.forEach(peer => {
                    myPeer.connect(peer, { metadata: { userName: fullName, screenShare: true, streamID: captureStream.id} });
                    myPeer.call(peer, captureStream, {metadata: {screnShare: true}})
                })
            }
          
        } catch (err) {
          console.error("Error: " + err);
        }
    }, [myPeer, peersArray])



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
                    videoStreams.map((stream, idx) => {
    
                        return (
                            <Streamer key={`stream-${idx}`} controls={false} fullName={userNames[idx] ?? `User ${idx + 1}`} muted={false} stream={stream} /> 
                        )
                    }
                ))}
                
            </>
        )
    }, [myStream, videoStreams, fullName, userNames])

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
                    {peersArray.length > 0 && (
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

export default Call
