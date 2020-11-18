import React, {useState, useEffect} from 'react';
import Peer from 'peerjs';
import {Redirect} from 'react-router-dom';

const Call:React.FC = () => {
    const [videoStreams, setVideoStreams] = useState<MediaStream[]>([]);

    let confID = localStorage.getItem('confID') ?? undefined;

    useEffect(() => {

        

        if(typeof(confID) === 'undefined') return;

        const myPeer = new Peer(confID, {
            path: '/peerjs',
            host: '/',
            port: 5000
        })

        const myVideo = document.createElement('video')

        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        })
        .then(stream => {
            myVideo.srcObject = stream
            myVideo.addEventListener('loadedmetadata', () => {
                myVideo.play();
            })
            console.log('stream is here');
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
        videoStreams.forEach((stream, idx) => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.addEventListener('loadedmetadata', () => {
                video.play();
                videoStreamsList += (
                    <div>
                        {video}
                    </div>
                )
            })
        })
    }


    return confID ? 
            <div className="App">
            {videoStreamsList}
        </div>
        : <Redirect to="/" />;
}

export default Call
