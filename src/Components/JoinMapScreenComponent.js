import React, {Component} from 'react';
import { RkButton, RkTextInput, RkTheme } from 'react-native-ui-kitten';
import { View, Text, Alert } from 'react-native';

let baseHost = 'https://teammaps.herokuapp.com'

export default  class JoinMapScreenComponent extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      mapCode: '',
      memberName: '',
      currentLocation: {},
      errorLocation: false,
    }
  }

  joinMap(){
    let name = this.state.memberName
    let code = this.state.mapCode
    let location = this.state.currentLocation
    if(name.length == 0 || code.length ==0){
      Alert.alert(
        'Missing data input',
        'please input data',
        [
          {text: 'OK'},
        ],
        { cancelable: false }
      )
    }else if(this.state.errorLocation == true){
      Alert.alert(
        'Can not get your location',
        'please allow application use your location in Settings',
        [
          {text: 'OK'},
        ],
        { cancelable: false }
      )
    }
    else{
      this.createNewMemberJoinMap(name, code, location)
      .then(() => {
        this.props.navigation.navigate('Map', {
          mapCode: this.state.mapCode,
          memberName: this.state.memberName,
          currentLocation: this.state.currentLocation,
        });
      })
    }
  }

  getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        this.setState({ currentLocation });
      },
      (error) => {
        this.setState({ errorLocation: true });
      }
    )
  }

  componentDidMount() {
    this.getCurrentLocation();
  }

  createNewMemberJoinMap(memberName, mapCode, location){
    var baseUrl = baseHost + "/api/v1/member_locations/";
    return fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: mapCode,
        member_location:
        {
          location: location.latitude + ',' + location.longitude ,
          name: memberName,
        },
      }),
    });
  }

  render(){
    return(
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <RkTextInput
          label='Your Map Code:'
          rkType='success'
          style={{ marginLeft: 30, marginRight: 30 }}
          onChangeText={(mapCode) => this.setState({mapCode})} />
        <RkTextInput
          label='Your Name:'
          rkType='success'
          style={{ marginLeft: 30, marginRight: 30 }}
          onChangeText={(memberName) => this.setState({memberName})} />
        <Text>{JSON.stringify(this.state.currentLocation)}</Text>
        if(this.state.mapCode && this.state.memberName){
          <RkButton
            rkType='success'
            onPress={() => {
              this.joinMap();
            }}
          >Go To Map</RkButton>
        }
      </View>
    )
  }
}