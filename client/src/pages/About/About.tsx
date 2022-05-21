import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typed from 'react-typed';


const story: string = `<strong>COVID-19 Changed the world...</strong> <br /> Since year 2020 world is different. Majority of people change the way of workflow from Office to Remote mode. <br />
We are required to use different enterprise applications to create a communication between each other. <br />
Each of them has their own advantages, but in most cases you have to register or download application to use it. <br />
Besides, you have to pay for <strong>"Premium"</strong> accounts sometimes if you want to have extra options. <br />
Moreover, in some countries, you can not use that popular softwares, because they have been blocked. <br />
<strong>So this is the time when Fast Connect comes around...</strong> <br />
By using our application you <strong>DO NOT NEED</strong> to download anything to your device, or pay for anything. <br />
You can create new conference and use all features for <strong>ABSOLUTELY FREE</strong> and <strong>without registration</strong> ;) <br />
All you have to do is to make 2 steps: <br />
1. Create unique ID for conference, send it to all your collegues. <br />
2. Enter that ID at homepage and start your conference. <br />
<br />
Good luck and have a good time =)
`;


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



const About:React.FC = () => {
    const classes = useStyles();

  return (
    <div className="page-bg">
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>
      <Container maxWidth="lg" component="main" className={classes.heroContent}>
        <Typography color="inherit" component="p" gutterBottom>
            <Typed
                strings={[story]}
                typeSpeed={25}
                className='about-text'
            />
        </Typography>
      </Container>
    </div>
  );
}

export default About
