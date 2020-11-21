import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';



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
    height: '100vh',
    display:'flex',
    flexWrap:'wrap',
    justifyContent:'center',
    alignItems:'center',
    alignContent: 'center',
    textDecoration: 'none',
    color: '#fff'
  },
}));



const NotFound:React.FC = () => {
  const classes = useStyles();


  return (
    <>
      <div className="page-bg">
        <Container maxWidth="sm" component="main" className={classes.heroContent}> 
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
        <Typography component="h1" variant="h4" align="center" color="inherit" gutterBottom>
          404 Error: Page Not Found
        </Typography>
      </Container>
      </div>
    </>
  );
}

export default NotFound
