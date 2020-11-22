import React, {useEffect} from 'react';

interface videoStreamInterface {
    stream: MediaStream,
    fullName: string,
}

const Streamer:React.FC<videoStreamInterface> = ({stream, fullName}:videoStreamInterface) => {

    const videoEl =  React.createRef<HTMLVideoElement>();

    useEffect(() => {
        let video = videoEl.current;
        if(video){
            video.srcObject = stream;
            video.onloadedmetadata = function(e) {
                if(video) video.play();
            }
        }
       

    }, [videoEl, stream])

    return (
        <div className="stream-item">
            <h2>Im {fullName}</h2>
            <video ref={videoEl} autoPlay={true} />
            <div className="stream-buttons">
                <button type="button">Mute</button>
                <button type="button">Stop video</button>
                <button type="button">Share screen</button>
            </div>
        </div>
    )
}

export default Streamer
