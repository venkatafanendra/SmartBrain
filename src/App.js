import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import Rank from './components/Rank/Rank';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';

const app = new Clarifai.App({
 apiKey: '63cd1fa83c4f4479975431382ba9cc25'
});

const particlesoptions ={
  particles: {
    number:{
    value:30,
    density:{
      enable:true,
      value_area:800,
     }
    }
   }
 }

const initialState={
      input:'',
      imageurl:'',
      box: {},
      route: 'Signin',
      isSignedIn:false,
      user:{
        id:'',
        name:'',
        email:'',
        entries:0,
        joined:''
      }
  }
   
class App extends Component {
  constructor(){
    super();
    this.state=initialState;
}

loadUser = (data) =>{
  this.setState({user: {
    id:data.id,
    name:data.name,
    email:data.email,
    entries:data.entries,
    joined:data.joined
   }
  })
}

 
calculateFaceLocation = (response) => {
    const clarifaiFace= response.outputs[0].data.regions[0].region_info.bounding_box;
    const image=document.getElementById('inputimage');
    const width=Number(image.width);
    const height=Number(image.height);
    return{
      leftCol: clarifaiFace.left_col*width,
      topRow: clarifaiFace.top_row*height,
      rightCol: width-(clarifaiFace.right_col*width),
      bottomRow: height-(clarifaiFace.bottom_row*height)
    }
}

displayBoxFace = (box) =>{
  this.setState({box:box});
}

onRouteChange = (route) => {
   if (route==='signout'){
      this.setState(initialState);
   }
   else if (route==='home'){
      this.setState({isSignedIn:true});
   }
   this.setState({route: route});
}

onInputChange = (event) => {
  this.setState({input:event.target.value});
}

   onButtonSubmit = () => {
    this.setState({imageurl: this.state.input});
    app.models.predict(Clarifai.FACE_DETECT_MODEL,this.state.input)
    .then(response => {
      if(response){
        fetch('http://localhost:3000/image',{
          method:'post',
          headers:{'Content-Type': 'application/json'},
          body:JSON.stringify({
               id:this.state.user.id,
               })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user,{entries:count}));
          })
          }
      this.displayBoxFace(this.calculateFaceLocation(response));
    })
    .catch(err => console.log(err));
  }

  render() {
    const {imageurl, box, route, isSignedIn,user} = this.state;
    return (
      <div className="App">
        <Particles 
          className='Particles'
          params={particlesoptions}
        />
        <Navigation  isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route==='home'
          ? <div>
              <Logo />
              <Rank name={user.name}
                    entries={user.entries}
              />
              <ImageLinkForm 
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit}
              />   
              <FaceRecognition
                box={box}
                imageurl={imageurl}
               />
             </div> 
          : ( route==='Signin'
                ? <Signin loadUser={this.loadUser}
                          onRouteChange={this.onRouteChange}
                  />
                : <Register loadUser={this.loadUser}
                            onRouteChange={this.onRouteChange} 
                  />
        
            )
          }
        }
      </div>
    );
  }
}

export default App;
