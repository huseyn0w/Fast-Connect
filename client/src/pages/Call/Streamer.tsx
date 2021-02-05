import React, {useState, useEffect} from 'react';
import MicRoundedIcon from '@material-ui/icons/MicRounded';
import MicOffRoundedIcon from '@material-ui/icons/MicOffRounded';
import VideocamRoundedIcon from '@material-ui/icons/VideocamRounded';
import VideocamOffRoundedIcon from '@material-ui/icons/VideocamOffRounded';

interface videoStreamInterface {
    stream: MediaStream,
    fullName: string,
    streamKey: number
}

const Streamer:React.FC<videoStreamInterface> = ({stream, streamKey, fullName}:videoStreamInterface) => {

    const [videoMuted, setVideoMuted] = useState<Boolean>(false)
    const [audioMuted, setAudioMuted] = useState<Boolean>(false)
    const videoEl =  React.createRef<HTMLVideoElement>();
    

    // useEffect(() => {
    //     let video = videoEl.current;
    //     if(video){
    //         video.srcObject = stream;
    //         video.onloadedmetadata = function(e) {
    //             if(video) video.play();
    //         }
    //     }
       

    // }, [])

    useEffect(() => {
        let video = videoEl.current;
        if(video){
            video.srcObject = stream;
            video.onloadedmetadata = function(e) {
                if(video) {
                    if(videoMuted){
                        video.pause();
                    }
                    else{
                        video.play();
                    }
                }
            }
        }
    }, [videoMuted])

    const audioHandler = () => {
        setAudioMuted(!audioMuted);
    }

    const videoHandler = () => {
        setVideoMuted(!videoMuted);
    }

    // console.log(streamKey)

    let muteAudio = false;

    if(streamKey == 0){
        muteAudio = true;
    }

    // console.log(muteAudio)

    return (
        <div className="stream-item">
            <h2>Im {fullName}</h2>
            <video ref={videoEl} muted={muteAudio} autoPlay={true} />
            <div className="stream-buttons">
                <button type="button" onClick={audioHandler}>
                    {audioMuted ? <MicOffRoundedIcon /> : <MicRoundedIcon />}
                </button>
                <button type="button" onClick={videoHandler}>
                    {videoMuted ? <VideocamOffRoundedIcon /> : <VideocamRoundedIcon />}
                </button>
                {/* <button type="button">Share screen</button> */}
            </div>
        </div>
    )
}

export default Streamer
