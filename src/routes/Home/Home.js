import React, { Component } from 'react';
import axios from 'axios';
import './Home.css';

// graphql helper functions
import { fetch, mutate } from './../../graphql/graphql.ts';
import gql from 'graphql-tag';

class Home extends Component {
  constructor(props){
    super(props);
    this.state = {
      firstNameInput: '',
      nicknameInput: '',
      baseQueryUrl: 'https://20n4h1kewa.execute-api.us-east-1.amazonaws.com/dev/query?query=',
      baseMutationUrl: 'https://20n4h1kewa.execute-api.us-east-1.amazonaws.com/dev/mutation?mutation=',
      radiantUrl: 'https://api.radiant.engineering/Radiant/graphql',
    }

    this.getNickname = this.getNickname.bind(this);
    this.getNicknameWithLibrary = this.getNicknameWithLibrary.bind(this);
    this.updateNickname = this.updateNickname.bind(this);
    this.updateNicknameWithLibrary = this.updateNicknameWithLibrary.bind(this);
    this.radiantTest = this.radiantTest.bind(this);
  }

  getNickname(){
    let { firstNameInput, baseQueryUrl } = this.state;
    if (!firstNameInput) return alert('please fill out the firstname field to continue');
    
    let queryParams = encodeURIComponent(`
    {
      greeting(firstName: "${firstNameInput}")
    }
    `);
    let axiosUrl = baseQueryUrl + queryParams;
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
  
  getNicknameWithLibrary(){
    let { firstNameInput } = this.state;
    if (!firstNameInput) return alert('please fill out the firstname field to continue');

    let query = gql`
      {
        greeting(firstName: "${firstNameInput}")
      }
    `;
    let options = {
      fetchPolicy: 'network-only'
    };

    fetch(query, options)
    .then( ({res}) => {
      console.log(res);
    })
    .catch(err => {
      console.log(JSON.stringify(err));
      return err;
    });

  }
  
  updateNickname(){
    let { firstNameInput, nicknameInput, baseMutationUrl } = this.state;
    if (!firstNameInput || !nicknameInput) return alert('Please fill out both firstname and nickname fields to continue');
    
    let queryParams = encodeURIComponent(`mutation{
      changeNickname(firstName:"${firstNameInput}",nickname:"${nicknameInput}")
    }`);
    let axiosUrl = baseMutationUrl + queryParams;
    console.log(axiosUrl);
    
    axios.post(axiosUrl)
    .then( res => {
      console.log(res);
      if (!res.data ||!res.data.data || !res.data.data.changeNickname) return alert('Error, please check the console to see the response');
      return alert('Nickname updated to ' + res.data.data.changeNickname);
    })
    .catch( err => console.log(JSON.stringify(err)) )
  }
  
  updateNicknameWithLibrary(){
    let { firstNameInput, nicknameInput } = this.state;
    if (!firstNameInput || !nicknameInput) return alert('Please fill out both firstname and nickname fields to continue');

    let mutation = gql`
      mutation{
        changeNickname(firstName: "$firstName", nickname: "$nickname")
      }
    `;
    let options = {
      variables:{
        firstName: firstNameInput,
        nickname: nicknameInput
      }
    };

    mutate(mutation, options)
    .then( res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    });
  }
  
  radiantTest(){
    let { radiantUrl } = this.state;
    let queryParams = encodeURIComponent(`{authenticateUser(authCode:"R"){token}}`);
    let axiosUrl = radiantUrl + '?query=' + queryParams;
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
              <input placeholder='firstname' value={this.state.firstNameInput} onChange={(e) => this.setState({firstNameInput: e.target.value})} />
              <input placeholder='new nickname' value={this.state.nicknameInput} onChange={(e) => this.setState({nicknameInput: e.target.value})} />
              <button onClick={()=>this.getNickname()} >Get Nickname</button>
              <button onClick={()=>this.updateNickname()} >Update Nickname</button>
            </div>

            {/* <button onClick={ ()=>this.radiantTest() } >Radiant Test</button> */}
          
          </div>

      </div>
    );
  }
}

export default Home;