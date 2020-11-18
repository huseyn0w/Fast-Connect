import React from 'react';
import Typography from '@material-ui/core/Typography';
import {Link, useHistory} from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    '@global': {
        ul: {
            margin: 0,
            padding: 0,
            listStyle: 'none',
        },
    },
    appBar: {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    toolbar: {
        flexWrap: 'wrap',
        backgroundColor: '#fff',
    },
    toolbarTitle: {
        flexGrow: 1,
    },
    link: {
        margin: theme.spacing(1, 1.5),
    },
}));

const Footer:React.FC = () => {
  const history = useHistory();
  const classes = useStyles();
  return (
    <>
      <CssBaseline />
      <AppBar position="static" color="default" elevation={0} className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h6" color="inherit" noWrap className={classes.toolbarTitle}>
            Fast Connect
          </Typography>
          <nav>
            <Link to="/" className="nav-links">
              Home
            </Link>
            <Link to="/about" className="nav-links">
              About Application
            </Link>
          </nav>
          <Button target="_blank" variant="contained" href="https://github.com/huseyn0w/fast-connect" color="primary">
            Github
          </Button>
        </Toolbar>
      </AppBar>
    </>
  );
}

export default Footer;
