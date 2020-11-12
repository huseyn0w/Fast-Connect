import React from 'react';
import {
  Switch,
  Route,
} from "react-router-dom";
import './App.css';
import About from './pages/About/About';
import Call from './pages/Call/Call';
import Main from './pages/Main/Main';
import NotFound from './pages/404/404';
import Header from './pages/Skeleton/Header/Header';
import Footer from './pages/Skeleton/Footer/Footer';
import GuideLine from './pages/Guideline/Guideline';


function App() {

  return (
    <Switch>
      <Route path="/call" exact>
        <Call />
      </Route>
      <Route path="/about" exact>
        <Header />
          <About />
        <Footer />
      </Route>
      <Route path="/get-started" exact>
        <Header />
          <GuideLine />
        <Footer />
      </Route>
      <Route path="/" exact>
        <Header />
          <Main />
        <Footer />
      </Route>
      <Route component={NotFound} exact />
    </Switch>
  )

}

export default App;
