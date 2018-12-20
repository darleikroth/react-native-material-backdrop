/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react'
import {Platform, StyleSheet, Text, View} from 'react-native'
import Backdrop from 'react-native-material-backdrop'

const IOS = Platform.OS === 'ios'

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
})

type Props = {}
export default class App extends Component<Props> {
  // render() {
  //   return (
  //     <View style={styles.container}>
  //       <Text style={styles.welcome}>Welcome to React Native and Backdrop!</Text>
  //       <Text style={styles.instructions}>To get started, edit App.js</Text>
  //       <Text style={styles.instructions}>{instructions}</Text>
  //     </View>
  //   )
  // }
  render() {
    return (
      <View style={{flex: 1}} >

        <Backdrop
          ref={ref => this.backdrop = ref}
          backLayerStyle={{backgroundColor: '#05a5d1'}}
          backLayerConcealed={this.renderBackLayerConcealed}
          backLayerRevealed={this.renderBackLayerRevealed} >

          <View style={styles.container}>
            <Text style={styles.welcome}>Welcome to React Native and Backdrop!</Text>
            <Text style={styles.instructions}>To get started, edit App.js</Text>
            <Text style={styles.instructions}>{instructions}</Text>
          </View>

        </Backdrop>
      </View>
    )
  }

  renderBackLayerConcealed = () => {
    return (
      <View style={{
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
      }} >
        <Text style={{
          fontSize: IOS ? 17 : 19,
          fontWeight: IOS ? '600' : '500',
          textAlign: IOS ? 'center' : 'left',
          color: 'white',
          marginLeft: 72
        }} >Title</Text>
      </View>
    )
  }

  renderBackLayerRevealed = () => {
    return (
      <View style={{ flex: 1 }} >
        <View style={{
          height: 56,
          flexDirection: 'row',
          alignItems: 'center',
        }} >
          <Text style={{
            fontSize: IOS ? 17 : 19,
            fontWeight: IOS ? '600' : '500',
            textAlign: IOS ? 'center' : 'left',
            color: 'white',
            marginLeft: 72
          }} >Settings</Text>
        </View>
        <Text style={{
          color: 'white',
          alignSelf: 'center',
          marginTop: 100
        }} >Content</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    paddingHorizontal: 32,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
})
