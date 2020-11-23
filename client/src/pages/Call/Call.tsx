import React, {useState, useEffect} from 'react';
import Peer from 'peerjs';
import {Redirect} from 'react-router-dom';
import Streamer from './Streamer';
import io from "socket.io-client";

// @ts-ignore
const socket = io(process.env.REACT_APP_BACKEND_URL, {'sync disconnect on unload': true });


const Call:React.FC = () => {
    const [videoStreams, setVideoStreams] = useState<MediaStream[]>([]);

    
    

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

        myPeer.on('call', call => {
            console.log('we have acall');
            navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then(stream => {
                call.answer(stream);
                call.on('stream', userVideoStream => {
                    console.log('Im current stream');
                    setVideoStreams(currentArray => {
                        return [...currentArray, userVideoStream]
                    })
                })
            })
            
            
        })


    
        socket.on('new-user-arrived-finish', (newPeerId: string, roomId: string) => {

            console.log('arrived finish trigger');

            navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then(stream => {

                const call = myPeer.call(newPeerId, stream);
                if(call){
                    call.on('stream', function(remoteStream) {
                        console.log('im a remote stream');
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

        
        // console.log('test');
        

        

        

    }, []);


    let videoStreamsList: any = null;

    if (videoStreams.length > 0) {
        // console.log(videoStreams);
        videoStreamsList = videoStreams.map((stream, idx) => <Streamer key={`stream-${idx}`} fullName={fullName} stream={stream} /> )
    }


    return roomId  ? 
        <div className="AppCover">
            <div className="video-streams">
                {videoStreamsList}
            </div>
            <div className="video-sidebar">
                ROOM ID: {roomId}
                <div className="messages">
                    Messages will be here
                </div>
                <div className="input-area">
                    input will be here
                </div>
            </div>
        </div>
        : <Redirect to="/" />;
}

export default Call
