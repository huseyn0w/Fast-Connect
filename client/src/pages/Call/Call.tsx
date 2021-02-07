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
    const [fullName, setFullName] = useState(localStorage.getItem('fullName') ?? '');
    const [roomId, setRoomId] = useState(localStorage.getItem('roomId') ?? false);
    const screenVideoRef =  React.createRef<HTMLVideoElement>();
    const [startSharing, setStartSharing] = useState<Boolean>(false)
    const [screenStream, setScreenStream] =  useState<MediaStream>();

    
    const myPeerUniqueID = uuidv4();
    const myPeer = new Peer(myPeerUniqueID)
    //@ts-ignore
    let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    useEffect(() => {

        
        
        socket.emit('new-user-arriving-start', myPeerUniqueID, roomId, fullName);


        socket.on('new-user-arrived-finish', (peerID:string, roomID:string, userName:string) => {
        
        
        
        
            if(!fullName){
                localStorage.setItem('fullName', userName)
                setFullName(userName)
            }

            socket.emit('newUserName', roomId, fullName)

            
            getUserMedia(streamOptions, function(stream) {
                setMyStream(stream);

                localStorage.setItem('currentStreamId', stream.id);

                
                
                if(peerID !== myPeerUniqueID){
                    var call = myPeer.call(peerID, stream);
                    call.on('stream', function(remoteStream) {
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


              myPeer.on('call', function(call) {
                getUserMedia({video: true, audio: true}, function(stream) {
                    setMyStream(stream);
    
                    localStorage.setItem('currentStreamId', stream.id);
                    call.answer(stream);
                    
                    call.on('stream', function(remoteStream) {
                        if(myStream?.id !== remoteStream.id){
                            
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

        socket.on('screen-share-receive', (stream: MediaStream) => {
            console.log('slam');
            try {
                setScreenStream(stream);

            } catch (err) {
            console.error("Error: " + err);
            }
        })


        window.onbeforeunload = () => {
            const currentStreamID = localStorage.getItem('currentStreamId');
            socket.emit('userExited', currentStreamID, roomId);
        }

        // socket.on('shareScreen', (stream) => {

        // })

       
       

    }, [])

    useEffect(() => {
        if(screenStream){
            // console.log('we are video', screenVideoRef);
            if(screenVideoRef?.current){
                // console.log('im here')
                screenVideoRef.current.srcObject = screenStream;
                screenVideoRef.current.onloadedmetadata = function(e) {
                    if(screenVideoRef?.current){
                        screenVideoRef.current.play();
                    }
                }
            }
        }
    }, [screenVideoRef, screenStream])



    const shareScreenHandler = async () => {

        if(startSharing && screenStream){
            const tracks = screenStream.getTracks();
            for( var i = 0 ; i < tracks.length ; i++ ) tracks[i].stop();
            
            setStartSharing(false)
            setScreenStream(undefined);
            
            socket.emit('screen-share-start', roomId, {share:false});
            return;
        }

        setStartSharing(true);
        
        let captureStream = null;
      
        try {
        // @ts-ignore
          captureStream = await navigator.mediaDevices.getDisplayMedia({video:true, audio: false});
          console.log(captureStream)
          const data = {
            share:true, stream: captureStream
          }
          console.log(data, 'data that im sending')
          socket.emit('screen-share-start', roomId, data);
         
          setScreenStream(captureStream);

          
          
        } catch (err) {
          console.error("Error: " + err);
        }
        // connectToNewUser(myUserId, captureStream);
        // myPeer.call(myUserId, captureStream);
      };
    
    

    let videoStreamsList;

    videoStreamsList = (
        <>
            {myStream && (<Streamer fullName={fullName ?? 'User 1'} muted={true} stream={myStream} /> ) }
            {videoStreams.length > 0 && (videoStreams.map((stream, idx) => <Streamer key={`stream-${idx}`} fullName={userNames[idx] ?? `User ${idx + 1}`} muted={false} stream={stream} /> ))}
            <button onClick={shareScreenHandler}>{startSharing ? 'Stop Share' : 'Start Share'}</button>
            {startSharing && (
                <div className="stream-item">
                    <video ref={screenVideoRef} autoPlay={true} />
                </div>
            )}
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
