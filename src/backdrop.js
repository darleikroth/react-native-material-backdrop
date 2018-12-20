import React from 'react'
import {
  TouchableWithoutFeedback,
  StyleSheet,
  ViewStyle,
  Dimensions,
  Platform,
  Animated,
  Easing,
  View,
  Text,
} from 'react-native'
import { Icon, SafeAreaView, Touchable, Utils } from './utils'

interface Props {
  /**
   * If `true`, the buttonActivator will not be rendered. Default is `false`.
   */
  buttonActivatorDisabled?: boolean;
  /**
   * If provided, this will be rendered as subheader on front layer.
   */
  frontLayerSubheader?: () => JSX.Element;
  /**
   * Element that is rendered on back layer when concealed.
   */
  backLayerConcealed?: () => JSX.Element;
  /**
   * Element that is rendered on back layer when revealed.
   */
  backLayerRevealed?: () => JSX.Element;
  /**
   * Container styles for back layer.
   */
  backLayerStyle?: ViewStyle;
  /**
   * The action button ripple color on pressed (Android).
   */
  buttonRippleColor?: string;
  /**
   * Container styles for button activator (menu button).
   */
  buttonActivatorStyle?: ViewStyle;
  /**
   * If `half`, when revealed, offset from top goes until to the middle of screen. If `full`, when revealed,
   * offset from top goes until to the bottom of screen. Default is `half`.
   */
  offsetType?: "half" | "full";
  /**
   * The offset from the top, when revealed. This property overrides `offsetType`.
   */
  offset?: number;
  /**
   * Initial offset from the top, when concealed. Default is `56`.
   */
  initialOffset?: number;
  /**
   * Element that is rendered on front layer.
   */
  children?: JSX.Element;
}

const IOS = Platform.OS === 'ios'

export default class Backdrop extends React.Component<Props> {

  static defaultProps: Props = {
    offsetType: 'half',
    initialOffset: 56,
    buttonRippleColor: 'rgba(255,255,255,0.3)',
    buttonActivatorDisabled: false
  }

  constructor(props: Props) {
    super(props)
    const window = Dimensions.get('window')
    this.state = {
      window,
      isLandscape: Utils.isOrientationLandscape(window),
      backConcealed: true,
      backRevealed: false,
      iconName: 'menu'
    }
  }

  animate = new Animated.Value(0)
  spinValue = new Animated.Value(0)

  componentDidMount() {
    Dimensions.addEventListener('change', this.handleOrientationChange)
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this.handleOrientationChange)
  }

  handleOrientationChange = ({ window }) => {
    const isLandscape = Utils.isOrientationLandscape(window)
    this.setState({ isLandscape, window })
  }

  toggleLayout() {
    const { backConcealed, backRevealed } = this.state

    if (backConcealed === backRevealed) {
      return
    }

    if (backConcealed) {
      this.setState({ backRevealed: true })
    } else {
      this.setState({ backConcealed: true })
    }

    Animated.timing(this.animate, {
      toValue: backConcealed ? 1 : 0,
      duration: 196,
      easing: Easing.ease,
      useNativeDriver: !IOS
    }).start(() => {
      if (backConcealed) {
        this.setState({ backConcealed: false })
      } else {
        this.setState({ backRevealed: false })
      }
    })
    Animated.timing(this.spinValue, {
      toValue: 0.5,
      duration: 96,
      easing: Easing.linear,
      useNativeDriver: !IOS
    }).start(() => {
      this.setState({ iconName: backConcealed ? 'close' : 'menu' })
      Animated.timing(this.spinValue, {
        toValue: backConcealed ? 1 : 0,
        duration: 96,
        easing: Easing.linear,
        useNativeDriver: !IOS
      }).start()
    })
  }

  render() {
    const height = this.getStatusBarHeight()
    return (
      <SafeAreaView style={[styles.backLayer, this.props.backLayerStyle]} >
        {this.renderBackLayerConcealed(height)}
        {this.renderBackLayerRevealed(height)}
        {this.renderFrontLayer()}
        {this.renderButtonActivator(height)}
      </SafeAreaView>
    )
  }

  renderFrontLayer = () => {
    const offset = this.getOffset(),
    translateY = this.animate.interpolate({
      inputRange: [0, 1],
      outputRange: [this.props.initialOffset, offset]
    })

    return (
      <Animated.View style={[{
        flex: 1,
        transform: [{translateY}],
        backgroundColor: '#FAFAFA',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }, elevationStyle]} >
        {this.props.children}
        {this.renderScrimLayer()}
      </Animated.View>
    )
  }

  renderBackLayerConcealed = statusBarHeight => {
    if (!this.props.backLayerConcealed || !this.state.backConcealed) {
      return null
    }
    const md = this.state.backConcealed ? 0 : 1
    const opacity = this.animate.interpolate({
      inputRange: [0, 0.6, 1],
      outputRange: [1, md, 0]
    })
    return (
      <Animated.View style={{
        opacity,
        position: 'absolute',
        top: 0, right: 0, bottom: 0, left: 0,
      }} >
        {this.renderHeaderEdge(statusBarHeight)}
        {this.props.backLayerConcealed()}
      </Animated.View>
    )
  }

  renderBackLayerRevealed = statusBarHeight => {
    if (!this.props.backLayerRevealed || !this.state.backRevealed) {
      return null
    }
    const md = this.state.backRevealed ? 0 : 1
    const opacity = this.animate.interpolate({
      inputRange: [0, 0.6, 1],
      outputRange: [0, md, 1]
    })
    return (
      <Animated.View style={{
        opacity,
        position: 'absolute',
        top: 0, right: 0, bottom: 0, left: 0
      }} >
        {this.renderHeaderEdge(statusBarHeight)}
        {this.props.backLayerRevealed()}
      </Animated.View>
    )
  }

  renderScrimLayer = () => {
    if (!this.state.backRevealed) {
      return null
    }
    return (
      <TouchableWithoutFeedback onPress={() => this.toggleLayout()} >
        <Animated.View style={{
          opacity: this.animate,
          position: 'absolute',
          top: 0, right: 0, bottom: 0, left: 0,
          backgroundColor: 'rgba(255,255,255,0.8)',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }} />
      </TouchableWithoutFeedback>
    )
  }

  renderButtonActivator = topOffset => {
    if (this.props.buttonActivatorDisabled) {
      return null
    }

    const spin = this.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '0deg']
    })
    const style = [
      styles.activator,
      { top: topOffset },
      this.props.buttonActivatorStyle,
      { transform: [{ rotate: spin }] }
    ]

    return (
      <Animated.View style={style} >
        <Touchable
          activeOpacity={0.6}
          foreground={Touchable.Ripple(this.props.buttonRippleColor, true)}
          onPress={() => this.toggleLayout()}
          style={styles.activatorTouchable} >
          <Icon
            name={this.state.iconName}
            size={24}
            color='white'
            style={styles.activatorIcon} />
        </Touchable>
      </Animated.View>
    )
  }

  renderHeaderEdge = height => {
    return !!height ? <View style={{ height }} /> : null
  }

  getStatusBarHeight = () => {
    return (this.state.isLandscape || !IOS) ? 0 : Utils.isIphoneX(this.state.window) ? 44 : 20
  }

  getOffset = () => {
    if (this.props.offset) {
      return this.props.offset
    }
    const y = this.getY(), window = this.state.window
    return this.props.offsetType === 'half' ? window.height / 2 : window.height - y
  }

  getY = () => {
    const y = Utils.isIphoneX(this.state.window, IOS) ? 44 : IOS ? 20 : 24
    return y + this.props.initialOffset
  }
}

const styles = StyleSheet.create({
  backLayer: {
    flex: 1,
    backgroundColor: 'blue'
  },
  activator: {
    height: 56,
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
  },
  activatorTouchable: {
    height: 30,
    width: 30,
    borderRadius: 15,
    justifyContent: 'center'
  },
  activatorIcon: {
    marginTop: IOS ? 2 : 0,
    alignSelf: 'center'
  }
})

const elevationStyle = {
  shadowColor: 'black',
  shadowOpacity: 0.25,
  shadowRadius: 6 * .75,
  shadowOffset: { height: 6 * .45 },
  elevation: 6,
}
