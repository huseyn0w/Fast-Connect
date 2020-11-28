import React, {useState, useEffect, FormEvent} from 'react';
import Peer from 'peerjs';
import {Redirect} from 'react-router-dom';
import Streamer from './Streamer';
import io from "socket.io-client";
import Message from './Message';

// @ts-ignore
const socket = io(process.env.REACT_APP_BACKEND_URL, {'sync disconnect on unload': true });

let roomId = localStorage.getItem('confID') ?? undefined;
let fullName = localStorage.getItem('fullName') ?? '';

let peerDetails = {
    path: '/mypeer',
    host: '/',
}

if(process.env.NODE_ENV === 'production'){
    // @ts-ignore
    peerDetails.port = process.env.PORT || 5000;
}


const myPeer = new Peer();

const Call:React.FC = () => {
    const [videoStreams, setVideoStreams] = useState<MediaStream[]>([]);
    const [users, setUsers] = useState<string[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [messages, setMessages] = useState<Object[]>([]);


    useEffect(() => {
        socket.on('new-user-arrived-finish', (newUserId: string, roomId: string) => {
            if(!users.includes(newUserId)){
                setUsers(users => {
                    return [...users, newUserId]
                })
            }
        });

        window.onbeforeunload = () => {
            const currentStreamID = localStorage.getItem('currentStreamId');
            socket.emit('userExited', currentStreamID, roomId);
        }


    }, [])

    
    
    useEffect(() => {
        
        if(typeof(roomId) === 'undefined' || fullName === '') return;

        myPeer.on('open', (peerID) => {
            localStorage.setItem('currentPeer', peerID);
            socket.emit('new-user-arriving-start', peerID, roomId)
        });

        myPeer.on('call', call => {
            console.log('we have new call');
            navigator.mediaDevices.getUserMedia({ audio: false, video: true })
            .then(stream => {
                call.answer(stream);
                call.on('stream', function(remoteStream) {
                    console.log('remote stream 2', remoteStream);
                    setVideoStreams(currentArray => {
                        return [...currentArray, remoteStream]
                    })
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

    }, []);


    useEffect(() => {
        if(users.length > 0){
            navigator.mediaDevices.getUserMedia({ audio: false, video: true })
            .then(stream => {

                localStorage.setItem('currentStreamId', stream.id);

                setVideoStreams(currentArray => {
                    return [...currentArray, stream]
                })

                // console.log('total users array', users);
                // console.log('start to call to another users');
                const currentPeer = localStorage.getItem('currentPeer');
                
                users.forEach((user) => {
                    if(currentPeer != user){
                        console.log('we are calling to a user', user, ' our id is', currentPeer);
                        const call = myPeer.call(user, stream);
                    
                        if(call){
                            console.log('call was made');
                            call.on('stream', function(remoteStream) {
                                setVideoStreams(currentArray => {
                                    return [...currentArray, remoteStream]
                                })
                            });

                            
                        }
                    }
                    

                    
                })

                

                

            })
            .catch(err => {
                console.log('we have error', err);
            });
        }
    }, [users])


 


    

    useEffect(() => { 
        socket.on('userLeft', (streamID: string) => {
            console.log('user has left', streamID, videoStreams);
            

            // setVideoStreams(currentArray => {
            //     let currentStreams =  currentArray.map(el => {
            //         return el.id != streamID;
            //     })
            //     return [...currentStreams];
            // })
        });

    }, [videoStreams])

    // const modifyStreams = (newStream: MediaStream) => {
    //     const newStreams = videoStreams.filter((stream) => {
    //         return stream.id != newStream.id;
    //     })
        

    //     return newStreams;
    // }


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
