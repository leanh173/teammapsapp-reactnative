import React, {Component} from 'react';
import { RkButton, RkTextInput, RkTheme } from 'react-native-ui-kitten';
import { View, Text, Alert } from 'react-native';

let baseHost = 'https://teammaps.herokuapp.com'

export default class NewMapScreenComponent extends Component {
  constructor(props){
    super(props);
    this.state = {
      memberName: '',
      mapCode: '',
      currentLocation: {},
      errorLocation: false,
    }
  }

  componentDidMount() {
    this.getCurrentLocation();
  }

  getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        this.setState({ currentLocation });
      },(error) => {
        this.setState({ errorLocation: true });
      }
    )
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

  creatAndJoinMap(){
    let name = this.state.memberName
    let location = this.state.currentLocation
    if(name.length == 0){
      Alert.alert(
        'Missing data input',
        'please input your name',
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
      this.createNewMemberJoinMap(this.state.memberName, '', this.state.currentLocation)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          mapCode: responseJson.map_code,
        });
        this.props.navigation.navigate('Map', {
          mapCode: this.state.mapCode,
          memberName: this.state.memberName,
          currentLocation: this.state.currentLocation,
        });
      })
    }
  }

  render(){
    return(
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <RkTextInput
          label='Your Name:'
          rkType='success'
          style={{ marginLeft: 30, marginRight: 30 }}
          onChangeText={(memberName) => this.setState({memberName})} />
        if(this.state.memberName != null){
          <RkButton
            rkType='success'
            onPress={() => {
              this.creatAndJoinMap();
            }}
          >Go To Map</RkButton>
        }
        <Text>code: {this.state.mapCode}</Text>
        <Text>{JSON.stringify(this.state.currentLocation)}</Text>
      </View>
    )
  }
}