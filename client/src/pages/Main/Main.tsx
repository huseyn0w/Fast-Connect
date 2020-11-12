import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';



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
    padding: theme.spacing(8, 0, 0),
  },
}));



const Main:React.FC = () => {
    const classes = useStyles();

  return (
    <React.Fragment>
      {/* Hero unit */}
      <Container maxWidth="sm" component="main" className={classes.heroContent}>
        <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
          Fast Connect
        </Typography>
        <Typography variant="h4" align="center" color="textPrimary" component="p" gutterBottom>
          Standalone React WebRTC Application.
        </Typography>
        <Typography variant="h5" align="center" color="textPrimary" component="p">
          Create audio/video conference with built-in features and without registration in just 2 steps =)
        </Typography>
        <div className={classes.heroButtons}>
          <Grid container spacing={2} justify="center">
            <Grid item>
              <Link href="/about">
                <Button variant="contained" color="primary">
                  New conference
                </Button>
              </Link>
            </Grid>
            <Grid item>
              <Link href="/get-started">
                <Button variant="outlined" color="primary">
                  Beginners Guide
                </Button>
              </Link>
            </Grid>
          </Grid>
        </div>
      </Container>
      {/* End hero unit */}
    </React.Fragment>
  );
}

export default Main
