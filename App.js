import React from 'react';
import { FlatList, ActivityIndicator, Button, View, Text, StyleSheet, Alert } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { RkButton, RkTextInput, RkTheme } from 'react-native-ui-kitten';
import MapView from 'react-native-maps';

// let baseHost = 'http://10.190.41.2:3000'
let baseHost = 'https://teammaps.herokuapp.com'

class MapsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: 'MapsCODE: ' + navigation.state.params.mapCode,
  });

  constructor(props){
    super(props);
    const { navigation } = this.props;
    this.state = {
      mapCode: navigation.getParam('mapCode', 'NO-ID'),
      memberName: navigation.getParam('memberName', 'NO-NAME'),
      currentLocation: navigation.getParam('currentLocation', 'NO-DATA'),
      memberLocations: [],
      error: '',
      count: 0,
    }
  }

  componentDidMount() {
    this.fetchLocationDataAndUpdateCurrentLocation();
    this.timerID = setInterval(
      () => this.fetchLocationDataAndUpdateCurrentLocation(),
      10000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  fetchLocationDataAndUpdateCurrentLocation() {
    this.getCurrentLocation();
    this.putCurrentLocation(this.state.memberName, this.state.mapCode, this.state.currentLocation);
    this.fetchLocationData(this.state.mapCode);
  }

  fetchLocationData(mapCode) {
    var baseUrl = baseHost + "/api/v1/team_maps/";
    return fetch(baseUrl + mapCode)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          memberLocations: responseJson,
          count: this.state.count + 1
        });
      })
      .catch((error) => {
        this.setState({
          error: error
        });
        console.error(error);
    });
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
    )
  }

  putCurrentLocation(memberName, mapCode, location) {
    var baseUrl = baseHost + "/api/v1/member_locations/";
    fetch(baseUrl + this.state.mapCode + "/" + this.state.memberName, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        member_location: { location: location.latitude + ',' + location.longitude },
      }),
    });
  }

  render() {
    /* 2. Get the param, provide a fallback value if not available */
    const { navigation } = this.props;
    const mapCode = navigation.getParam('mapCode', 'NO-ID');
    const memberName = navigation.getParam('memberName', 'NO-NAME');
    const currentLocation = navigation.getParam('currentLocation', 'NO-DATA');

    return (
      <View style={{ flex: 1 }}>
      <Text>{JSON.stringify(currentLocation)}</Text>
        <MapView
          ref={ref => { this.map = ref; }}
          style={ styles.map }
          initialRegion={{
            latitude: 21.030052,
            longitude: 105.788056,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {this.state.memberLocations.map(marker => (
            <MapView.Marker
              style={{  flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center' }}
              key={marker.id}
              image={
                require('./assets/marker/marker-with-label-77.png')
              }
              coordinate={{ latitude: parseFloat(marker.lat), longitude: parseFloat(marker.lng) }}
              label={marker.name}
            >
              <View style={{ width: 40, height: 30,
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                <Text>{marker.name}</Text>
              </View>
            </MapView.Marker>
          ))}
        </MapView>
      </View>
    );
  }
}

class NewMapScreen extends React.Component {
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

class JoinMapScreen extends React.Component {
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

class HomeScreen extends React.Component {

  render(){
    return(
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <RkButton
          style={{marginBottom: 20}}
          rkType='success'
          onPress={() => {
            this.props.navigation.navigate('NewMap');
            }}
        >New Map</RkButton>
        <RkButton
          rkType='success'
          onPress={() => {
            this.props.navigation.navigate('JoinMap');
          }}
        >Join Map</RkButton>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

RkTheme.setType('RkTextInput','success',{
  labelColor:'darkgreen',
  underlineColor:'darkgreen',
  underlineWidth:1,
});

const RootStack = createStackNavigator(
  {
    Home: HomeScreen,
    Map: MapsScreen,
    JoinMap: JoinMapScreen,
    NewMap: NewMapScreen,
  },
  {
    initialRouteName: 'Home',
  }
);

export default class App extends React.Component {
  render() {
    return <RootStack />;
  }
}