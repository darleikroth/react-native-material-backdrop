/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react'
import {Platform, UIManager, StyleSheet, Text, View} from 'react-native'
import Backdrop from 'react-native-material-backdrop'

const IOS = Platform.OS === 'ios',
animationExperimental = UIManager.setLayoutAnimationEnabledExperimental

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
})

type Props = {}
export default class App extends Component<Props> {
  constructor() {
    super()
    if (!IOS && !!animationExperimental) {
      animationExperimental(true)
    }
  }

  render() {
    return (
      <View style={{flex: 1}} >

        <Backdrop
          ref={ref => this.backdrop = ref}
          backLayerStyle={{backgroundColor: '#05a5d1'}}
          backLayerConcealed={this.renderBackLayerConcealed}
          backRevealedElementsConfig={[
            {el: this.renderBackLayerRevealed, offset: 260}
          ]}
          frontLayerStyle={{backgroundColor: 'white'}} >

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
      <View style={styles.backdropHeader} >
        <Text style={styles.backdropHeaderTitle} >Title</Text>
      </View>
    )
  }

  renderBackLayerRevealed = () => {
    return (
      <View style={{ flex: 1 }} >
        <View style={styles.backdropHeader} >
          <Text style={styles.backdropHeaderTitle} >Settings</Text>
        </View>
        <Text style={styles.contentText} >Content</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
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
  contentText: {
    color: 'white',
    alignSelf: 'center',
    marginTop: 100
  },
  backdropHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backdropHeaderTitle: {
    fontSize: IOS ? 17 : 19,
    fontWeight: IOS ? '600' : '500',
    textAlign: IOS ? 'center' : 'left',
    color: 'white',
    marginLeft: 72
  }
})
