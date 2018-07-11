import React from 'react';
import MapView from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';

let baseHost = 'https://teammaps.herokuapp.com';

export default class MapsScreenComponent extends React.Component {
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
              image={'./assets/marker/marker-with-label-77.png'}
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

