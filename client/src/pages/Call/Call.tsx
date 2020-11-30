import React, {useState, useEffect, FormEvent} from 'react';
import Peer from 'peerjs';
import {Redirect} from 'react-router-dom';
import Streamer from './Streamer';
import io from "socket.io-client";
import Message from './Message';

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




const Call:React.FC = () => {
    const [videoStreams, setVideoStreams] = useState<MediaStream[]>([]);
    const [users, setUsers] = useState<string[]>([]);
    const [userNames, setUserNames] = useState<string[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [messages, setMessages] = useState<Object[]>([]);
    const [fullName, setFullName] = useState(localStorage.getItem('fullName') ?? false);
    const [roomId, setRoomId] = useState(localStorage.getItem('roomId') ?? false);

    const [myPeer, setMyPeer] = useState(new Peer());


    useEffect(() => {
        console.log('we are users here ', users, userNames);
        socket.on('new-user-arrived-finish', (newUserId: string, userName: string, roomId: string) => {
            console.log('new user arrives', users);
            
            if(!users.includes(newUserId)){
                setUsers(users => {
                    return [...users, newUserId]
                })
                setUserNames(usernames =>{
                    return [...usernames, userName]
                })
            }
        });

        

        window.onbeforeunload = () => {
            const currentStreamID = localStorage.getItem('currentStreamId');
            socket.emit('userExited', currentStreamID, roomId);
        }

        
    }, [])

    useEffect(() => {
        socket.on('new-user-arrived-finish2', (userName: string) => {
            console.log('hehey');
            setUserNames(usernames =>{
                return [...usernames, userName]
            })
        });
    }, [userNames])

    
    
    useEffect(() => {
        console.log('hehey', fullName);
        if(typeof(roomId) === 'undefined' || fullName === '') return;

        

        myPeer.on('open', (peerID) => {
            // console.log('peer opened')
            localStorage.setItem('currentPeer', peerID);
            socket.emit('new-user-arriving-start', peerID, roomId, fullName);
        });

        myPeer.on('call', call => {
            // console.log('we have new call');
            navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then(stream => {
                call.answer(stream);
                call.on('stream', function(remoteStream) {
                    setVideoStreams(currentArray => {
                        const newStreamArray = currentArray.filter(stream => {
                            return stream.id !== remoteStream.id;
                        })
                        return [...newStreamArray, remoteStream];
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

        // window.onbeforeunload = () => {
        //     const currentStreamID = localStorage.getItem('currentStreamId');
        //     socket.emit('userExited', currentStreamID, roomId);
        // }


    }, [fullName]);


    useEffect(() => {

        console.log('hehey 2', fullName);

        if(typeof(roomId) === 'undefined' || fullName === '') return;
        
            // console.log('we are here');
            navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then(stream => {

                localStorage.setItem('currentStreamId', stream.id);


                if(users.length === 0){
                    setVideoStreams(currentArray => {
                        return [...currentArray, stream]
                    })
                }
                else{

                // console.log('total users array', users);
                // console.log('start to call to another users');
                const currentPeer = localStorage.getItem('currentPeer');
                
                users.forEach((user) => {
                    if(currentPeer !== user){
                        // console.log('we are calling to a user', user, ' our id is', currentPeer);
                        const call = myPeer.call(user, stream);
                        
                        if(call){
                            socket.emit('test', fullName, roomId);
                            call.on('stream', function(remoteStream) {
                                console.log('remote stream 1');
                                setVideoStreams(currentArray => {
                                    const newStreamArray = currentArray.filter(stream => {
                                        return stream.id !== remoteStream.id;
                                    })
                                    return [...newStreamArray, remoteStream];
                                })
                            });

                            
                        }
                    }
                    

                    
                })
            }
                

                

            })
            .catch(err => {
                console.log('we have error', err);
            });
        
    }, [users, fullName])


 


    

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
