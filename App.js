import React from 'react';
import { FlatList, ActivityIndicator, Button, View, Text } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { RkButton, RkTextInput, RkTheme } from 'react-native-ui-kitten';

class MapsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: 'MapsCODE: ' + navigation.state.params.mapCode,
  });

  constructor(props){
    super(props);
    this.state = {
      memberLocations: [],
      eror: '',
      count: 0,
    }
  }

  componentDidMount() {
    this.fetchLocationData();
    this.timerID = setInterval(
      () => this.fetchLocationData(),
      10000
    );
  }

  fetchLocationData() {
    var baseUrl = "https://teammaps.herokuapp.com/api/v1/team_maps/";
    const { navigation } = this.props;
    return fetch(baseUrl + navigation.getParam('mapCode', 'NO-ID'))
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          memberLocations: responseJson,
          count: this.state.count + 1
        });
      })
      .catch((error) => {
        this.setState({
          eror: error
        });
        console.error(error);
    });
  }

  render() {
    /* 2. Get the param, provide a fallback value if not available */
    const { navigation } = this.props;
    const mapCode = navigation.getParam('mapCode', 'NO-ID');
    const memberName = navigation.getParam('memberName', 'NO-NAME');

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Details Screen</Text>
        <Text>itemId: {JSON.stringify(mapCode)}</Text>
        <Text>otherParam: {JSON.stringify(memberName)}</Text>
        <Text>{JSON.stringify(this.state.memberLocations)}</Text>
        <Text>{this.state.eror}</Text>
        <Text>{JSON.stringify(this.state.count)}</Text>
        <Button
          title="Go to Home"
          onPress={() => this.props.navigation.navigate('Home')}
        />
        <Button
          title="Go back"
          onPress={() => this.props.navigation.goBack()}
        />
      </View>
    );
  }
}

class NewMapScreen extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      memberName: null,
    }
  }

  render(){
    return(
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <RkTextInput label='Your Name:' rkType='success' onChangeText={(memberName) => this.setState({memberName})} />
        if(this.state.memberName != null){
          <RkButton
            onPress={() => {
              this.props.navigation.navigate('Map', {
                memberName: this.state.memberName,
              });
            }}
          >Go To Map</RkButton>
        }
      </View>
    )
  }
}

class JoinMapScreen extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      mapCode: null,
      memberName: null,
    }
  }

  joinMap(){
    this.props.navigation.navigate('Map', {
      mapCode: this.state.mapCode,
      memberName: this.state.memberName,
    });
  }

  render(){
    return(
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <RkTextInput label='Your Map Code:' rkType='success' onChangeText={(mapCode) => this.setState({mapCode})} />
        <RkTextInput label='Your Name:' rkType='success' onChangeText={(memberName) => this.setState({memberName})} />
        if(this.state.mapCode && this.state.memberName){
          <RkButton
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
          onPress={() => {
            this.props.navigation.navigate('NewMap');
            }}
        >New Map</RkButton>
        <RkButton
          onPress={() => {
            this.props.navigation.navigate('JoinMap');
          }}
        >Join Map</RkButton>
      </View>
    );
  }
}

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