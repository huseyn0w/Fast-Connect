import React, {useState, useEffect} from 'react';
import Peer from 'peerjs';
import {Redirect} from 'react-router-dom';
import Streamer from './Streamer';

const Call:React.FC = () => {
    const [videoStreams, setVideoStreams] = useState<MediaStream[]>([]);

    let confID = localStorage.getItem('confID') ?? undefined;
    let fullName = localStorage.getItem('fullName') ?? '';

    const myPeer = new Peer(confID, {
        path: '/mypeer',
        host: '/',
        port: 5000
    })

    useEffect(() => {
        
        if(typeof(confID) === 'undefined' || fullName === '') return;

        

        

        var constraints = { audio: true, video: true }; 

        navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {

            if(typeof(confID) === 'string'){
                const call = myPeer.call(confID, stream);

                if(call){
                    call.on('stream', function(remoteStream) {
                        console.log('im a remote stream');
                        setVideoStreams(currentArray => {
                            return [...currentArray, remoteStream]
                        })
                    });
                }
            }

            

            console.log('im a stream');

            setVideoStreams(currentArray => {
                return [...currentArray, stream]
            })
    
            myPeer.on('call', call => {
                console.log('we have a call');
                call.answer(stream)
                // call.on('stream', userVideoStream => {
                //     console.log('im on call');
                //     setVideoStreams(currentArray => {
                //         return [...currentArray, userVideoStream]
                //     })
                // })
            })


        })
        .catch(err => {
            console.log('we have error', err);
        });



        console.log(videoStreams);

    }, [confID]);


    let videoStreamsList: any = null;

    if (videoStreams.length > 0) {
        videoStreamsList = videoStreams.map((stream, idx) => <Streamer key={`stream-${idx}`} fullName={fullName} stream={stream} /> )
    }


    return confID  ? 
        <div className="AppCover">
            <div className="video-streams">
                {videoStreamsList}
            </div>
            <div className="video-sidebar">
                ROOM ID: {confID}
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
