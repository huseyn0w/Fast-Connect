import React, {useState} from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import { useHistory } from "react-router-dom";
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';



const useStyles = makeStyles((theme) => ({
  '@global': {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
  heroButtons: {
    marginTop: theme.spacing(4),
    overflow:'hidden'
  },
  link: {
    margin: theme.spacing(1, 1.5),
    textDecoration:'none !important'
  },
  heroContent: {
    padding: theme.spacing(8, 0),
    textDecoration: 'none',
    color: '#fff'
  },
}));



const Main:React.FC = () => {
  let history = useHistory();
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [existOpen, setExistOpen] = useState(false);

  const [createRoomInput, setCreateRoomInput] = useState('');
  const [joinRoomInput, setJoinRoomInput] = useState('');

  const handleNewClickOpen = () => {
    setCreateRoomInput('');
    setOpen(true);
  };

  const handleNewClose = () => {
    setCreateRoomInput('');
    setOpen(false);
  };

  const handleExistClickOpen = () => {
    setJoinRoomInput('');
    setExistOpen(true);
  };

  const handleExistClose = () => {
    setJoinRoomInput('');
    setExistOpen(false);
  };

  const generateID = () => {
    const uniqueID = 'conf-' + Date.now();
    setCreateRoomInput(uniqueID);
  }

  const createNewConference = () => {
    localStorage.setItem('confID', createRoomInput);
    history.push("/call");
  }

  const joinConference = () => {
    localStorage.setItem('confID', createRoomInput);
    history.push("/call");
  }

  return (
    <>
      <div className="page-bg">
        <Container maxWidth="sm" component="main" className={classes.heroContent}> 
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
        <Typography component="h1" variant="h2" align="center" color="inherit" gutterBottom>
          Fast Connect
        </Typography>
        <Typography variant="h4" align="center" color="inherit" component="p" gutterBottom>
          Standalone React WebRTC Application.
        </Typography>
        <Typography variant="h5" align="center" color="inherit" component="p">
          Create audio/video conference with built-in features and without registration in just 2 steps =)
        </Typography>
        <div className={classes.heroButtons}>
          <Grid container spacing={2} justify="center">
            <Grid item>
              <Button variant="contained" color="primary" onClick={handleNewClickOpen}>
                Create new conference
              </Button>
              <Dialog open={open} onClose={handleNewClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    To create new conference, enter Unique ID, or generate new one from the button below
                  </DialogContentText>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="new-room"
                    label="Room ID"
                    type="text"
                    value={createRoomInput}
                    onChange={(e) => setCreateRoomInput(e.target.value)}
                    fullWidth
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleNewClose} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={generateID} color="primary">
                    Generate ID
                  </Button>
                  <Button onClick={createNewConference} color="primary">
                    Create
                  </Button>
                </DialogActions>
              </Dialog>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" onClick={handleExistClickOpen}>
                Join the conference
              </Button>
              <Dialog open={existOpen} onClose={handleExistClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Please Enter conversation room ID to join.
                  </DialogContentText>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="exist-room"
                    label="Room ID"
                    type="text"
                    value={joinRoomInput}
                    onChange={(e) => setJoinRoomInput(e.target.value)}
                    fullWidth
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleExistClose} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={joinConference} color="primary">
                    Join
                  </Button>
                </DialogActions>
              </Dialog>
            </Grid>
          </Grid>
        </div>
      </Container>
      </div>
    </>
  );
}

export default Main
