import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typed from 'react-typed';


const story = `Since year 2020 world is different. Majority of people change the way of workflow from Office to Remote mode. <br />
We are required to use different enterprise applications to create a communication between each other. <br />
Each of them has their own advantages, but in most cases you have to register and / or download applcation to use it. <br />
Besides, you have to pay for <strong>"Premium"</strong> accounts sometimes if you want to have extra options. <br />
Moreover, in some countries, you can not use that popular softwares, because they have been blocked. <br />
<br />
<strong>So this is the time when Fast Connect comes around...</strong> <br />
By using our application you <strong>do not need</strong> to download application to your device, or pay for anything. <br />
You can create new conversation and use all features for <strong>absolutely free</strong> and <strong>without registration</strong> ;) <br />
All you have to do is to make 2 steps: <br />
1. Create unique ID for conversation, send it to all your collegues. <br />
2. Enter that ID at homepage and start your conversation. <br />

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
    padding: theme.spacing(8, 0, 0),
  },
}));



const About:React.FC = () => {
    const classes = useStyles();

  return (
    <React.Fragment>
      {/* Hero unit */}
      <Container maxWidth="lg" component="main" className={classes.heroContent}>
        <Typography color="textPrimary" component="h1" variant="h2"  gutterBottom>
          <strong>COVID-19 Changes the world...</strong>
        </Typography>
        <Typography color="textPrimary" component="p" gutterBottom>
            <Typed
                strings={[story]}
                typeSpeed={25}
                className='about-text'
            />
        </Typography>
      </Container>
      {/* End hero unit */}
    </React.Fragment>
  );
}

export default About
