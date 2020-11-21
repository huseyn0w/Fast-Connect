import React, {useState, useRef, useEffect} from 'react';
import Peer from 'peerjs';
import {Redirect} from 'react-router-dom';
import CameraObj from './Streamer';

const Call:React.FC = () => {
    const [videoStreams, setVideoStreams] = useState<MediaStream[]>([]);

    let confID = localStorage.getItem('confID') ?? undefined;


    

    useEffect(() => {
        

        if(typeof(confID) === 'undefined') return;

        const myPeer = new Peer(confID, {
            path: '/mypeer',
            host: '/',
            port: 5000
        })

        

        var constraints = { audio: false, video: { width: 200, height: 200 } }; 

        navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {

            setVideoStreams(currentArray => {
                return [...currentArray, stream]
            })
    
            myPeer.on('call', call => {
                call.answer(stream)
                call.on('stream', userVideoStream => {
                    setVideoStreams(currentArray => {
                        return [...currentArray, userVideoStream]
                    })
                })
            })


        });





    }, []);


    let videoStreamsList: any = null;

    if (videoStreams.length > 0) {
        videoStreamsList = videoStreams.map((stream, idx) => <CameraObj key={`stream-${idx}`} stream={stream} />)
    }


    return confID  ? 
        <div className="App">
            {videoStreamsList}
        </div>
        : <Redirect to="/" />;
}

export default Call
