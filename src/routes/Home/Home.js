import React, { Component } from 'react';
import axios from 'axios';
import './Home.css';

class Home extends Component {
  constructor(props){
    super(props);
    this.state = {
      firstNameInput: '',
      nicknameInput: '',
      baseUrl: 'https://20n4h1kewa.execute-api.us-east-1.amazonaws.com/dev/query?query=',
      radiantUrl: 'https://api.radiant.engineering/Radiant/graphql?query=',
    }

    this.getNickname = this.getNickname.bind(this);
    this.updateNickname = this.updateNickname.bind(this);
    this.radiantTest = this.radiantTest.bind(this);
  }

  getNickname(){
    let { firstNameInput, baseUrl } = this.state;
    let queryParams = encodeURIComponent(`{greeting(firstName:"${firstNameInput}")}`);
    let axiosUrl = baseUrl + queryParams;
    console.log(axiosUrl);
    
    axios.get(axiosUrl)
    .then( res => {
      if (!res.data || !res.data.data || !res.data.data.greeting){
        console.log(res);
        alert('Error, please check the console to see the response')
      }else{
        alert(res.data.data.greeting);
      }
    })
    .catch( err => console.log(JSON.stringify(err)) )
  }
  
  updateNickname(){
    let { firstNameInput, nicknameInput, baseUrl } = this.state;
    let queryParams = encodeURIComponent(`mutation{changeNickname(firstName:"${firstNameInput}",nickname:"${nicknameInput}")}`);
    let axiosUrl = baseUrl + queryParams;
    console.log(axiosUrl);
    
    axios.get(axiosUrl)
    .then( res => {
      console.log(res);
    })
    .catch( err => console.log(JSON.stringify(err)) )
  }
  
  radiantTest(){
    let { radiantUrl } = this.state;
    let queryParams = encodeURIComponent(`{authenticateUser(authCode:"R"){token}}`);
    let axiosUrl = radiantUrl + queryParams;
    console.log(axiosUrl);
    
    axios.get(axiosUrl, {
      headers: {
        'Authorization': 'bearer hher=23435',
      }
    })
    .then( res => {
      console.log(res);
    })
    .catch( err => console.log(JSON.stringify(err)) )
  }

  render() {
    return (
      <div className="home">

          <div className='managementDiv' >
            <p>Nickname Management</p>
            
            <div className='controls'>
              <input placeholder='firstname' onChange={(e) => this.setState({firstNameInput: e.target.value})} />
              <input placeholder='new nickname' onChange={(e) => this.setState({nicknameInput: e.target.value})} />
              <button onClick={()=>this.getNickname()} >Get Nickname</button>
              <button onClick={()=>this.updateNickname()} >Update Nickname</button>
            </div>

            <button onClick={ ()=>this.radiantTest() } >Radiant Test</button>
          
          </div>

      </div>
    );
  }
}

export default Home;