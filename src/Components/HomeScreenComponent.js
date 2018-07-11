import React, {Component} from 'react';
import { RkButton, RkTextInput, RkTheme } from 'react-native-ui-kitten';
import { View, Text, Alert } from 'react-native';

export default class HomeScreenComponent extends React.Component {

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