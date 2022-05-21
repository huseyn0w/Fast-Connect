import React, {useState} from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Redirect} from 'react-router-dom';



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
    height: '90vh',
    display:'flex',
    flexWrap:'wrap',
    justifyContent:'center',
    alignItems:'center',
    alignContent: 'center',
    textDecoration: 'none',
    color: '#fff'
  },
}));



const Main:React.FC = () => {
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [existOpen, setExistOpen] = useState(false);

  const [createRoomInput, setCreateRoomInput] = useState('');
  const [joinRoomInput, setJoinRoomInput] = useState('');
  const [fullName, setFullName] = useState('');
  const [redirect, setRedirect] = useState(false);

  const handleNewClickOpen = () => {
    setCreateRoomInput('');
    setFullName('');
    setOpen(true);
  };

  const handleNewClose = () => {
    setCreateRoomInput('');
    setFullName('');
    setOpen(false);
  };

  const handleExistClickOpen = () => {
    setJoinRoomInput('');
    setFullName('');
    setExistOpen(true);
  };

  const handleExistClose = () => {
    setJoinRoomInput('');
    setFullName('');
    setExistOpen(false);
  };

  const generateID = () => {
    const uniqueID = 'conf-' + Date.now();
    setCreateRoomInput(uniqueID);
  }

  const createNewConference = (e:React.SyntheticEvent) => {
    e.preventDefault();
    if(createRoomInput && fullName){
      localStorage.setItem('roomId', createRoomInput);
      localStorage.setItem('fullName', fullName);
      setRedirect(true);
    }
    
  }

  const joinConference = (e:React.SyntheticEvent) => {
    e.preventDefault();
    if(joinRoomInput && fullName){
      localStorage.setItem('roomId', joinRoomInput);
      localStorage.setItem('fullName', fullName);
      setRedirect(true);
    }
  }


  return (
    <>
    {redirect && (<Redirect to="/call" />)}
    {!redirect && (
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
          React WebRTC Application.
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
                <DialogTitle id="form-dialog-title">Create the conference</DialogTitle>
                <form onSubmit={createNewConference}>
                  <DialogContent>
                    <DialogContentText>
                      To create new conference, enter Full Name, Unique ID, or generate new one from the button below
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
                    <TextField
                      autoFocus
                      margin="dense"
                      id="full-name"
                      label="Full Name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
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
                    <Button type="submit" onClick={createNewConference} color="primary">
                      Start new conference
                    </Button>
                  </DialogActions>
                </form>
              </Dialog>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" onClick={handleExistClickOpen}>
                Join the conference
              </Button>
              <Dialog open={existOpen} onClose={handleExistClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Join the conference</DialogTitle>
                <form onSubmit={joinConference}>
                  <DialogContent>
                    <DialogContentText>
                      Please Enter conversation room ID and Full Name to join.
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
                    <TextField
                      autoFocus
                      margin="dense"
                      id="full-name-2"
                      label="Full Name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      fullWidth
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleExistClose} color="primary">
                      Cancel
                    </Button>
                    <Button type="submit" onClick={joinConference} color="primary">
                      Join conference
                    </Button>
                  </DialogActions>
                </form>
              </Dialog>
            </Grid>
          </Grid>
        </div>
      </Container>
      </div>
    </>
    )}
    </>
  )

}

export default Main
