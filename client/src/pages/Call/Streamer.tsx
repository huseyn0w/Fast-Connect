import React, {useEffect} from 'react';

interface videoStreamInterface {
    stream: MediaStream;
}

const CameraObj:React.FC<videoStreamInterface> = ({stream}:videoStreamInterface) => {

    const videoEl =  React.createRef<HTMLVideoElement>();

    useEffect(() => {
        let video = videoEl.current;
        if(video){
            video.srcObject = stream;
            video.onloadedmetadata = function(e) {
                if(video) video.play();
            }
        }
       

    }, [stream, videoEl])

    return (
        <div>
            <video ref={videoEl} autoPlay={true} />
        </div>
    )
}

export default CameraObj
