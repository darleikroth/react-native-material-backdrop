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

type ElementsConfigI = {
  /**
   * Element that is rendered on back layer when revealed.
   */
  el?: () => JSX.Element;
  /**
   * The offset from the top, when revealed. Default `offset` or `offsetType` from Backdrop props.
   */
  offset?: number;
  /**
   * Default is `false`.
   */
  closeOnConceal?: boolean;
}

type Props = {
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
   * Use this to configure multiples elements to render when back layer is revealed.
   */
  backRevealedElementsConfig?: ElementsConfigI[];
  /**
   * Container styles for back layer.
   */
  backLayerStyle?: ViewStyle;
  /**
   * Container styles for front layer.
   */
  frontLayerStyle?: ViewStyle;
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
   * offset from top goes until to the bottom of screen. Default is `full`.
   */
  offsetType?: "full" | "half";
  /**
   * The offset from the top, when revealed. This property overrides `offsetType`.
   */
  offset?: number;
  /**
   * Initial offset from the top, when concealed. Default is `56`.
   */
  initialOffset?: number;
  /**
   * Event dispatched when revealed.
   */
  onReveal?: () => void;
  /**
   * Event dispatched when concealed.
   */
  onConceal?: () => void;
  /**
   * Element that is rendered on front layer.
   */
  children?: JSX.Element;
}

const IOS = Platform.OS === 'ios'

export default class Backdrop extends React.PureComponent<Props> {

  static defaultProps: Props = {
    offsetType: 'full',
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
      iconName: 'menu',
      elementIndex: 0,
      lastIndex: 0,
      nextIndex: 0
    }
  }

  animate = new Animated.Value(0)
  spinValue = new Animated.Value(0)
  internalAnimate = new Animated.Value(0)
  internalOffsetAnimate = new Animated.Value(0)
  isInternalAnimate = false

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

  setElementIndex(elementIndex) {
    this.state.backConcealed && this.setState({elementIndex})
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

    this.isInternalAnimate = false

    Animated.timing(this.animate, {
      toValue: backConcealed ? 1 : 0,
      duration: 196,
      easing: Easing.ease,
      useNativeDriver: !IOS
    }).start(() => {
      if (backConcealed) {
        this.setState({ backConcealed: false })
        this.props.onReveal && this.props.onReveal()
      } else {
        const close = this.props.backRevealedElementsConfig[this.state.elementIndex].closeOnConceal
        this.setState({
          backRevealed: false,
          elementIndex: close ? this.state.lastIndex : this.state.elementIndex,
          lastIndex: close ? this.state.elementIndex : this.state.lastIndex
        })
        this.props.onConceal && this.props.onConceal()
      }
    })
    Animated.timing(this.spinValue, {
      toValue: 0.5,
      duration: 94,
      easing: Easing.linear,
      useNativeDriver: !IOS
    }).start(() => {
      this.setState({ iconName: backConcealed ? 'close' : 'menu' })
      Animated.timing(this.spinValue, {
        toValue: backConcealed ? 1 : 0,
        duration: 94,
        easing: Easing.linear,
        useNativeDriver: !IOS
      }).start()
    })
  }

  animateTo(i) {
    this.internalAnimate.setValue(0)
    this.isInternalAnimate = true
    this.setState({lastIndex: this.state.elementIndex, nextIndex: i})

    Animated.timing(this.internalAnimate, {
      toValue: 0.5,
      duration: 98,
      easing: Easing.ease,
      useNativeDriver: !IOS
    }).start(() => {
      this.setState({ elementIndex: i })
      Animated.timing(this.internalAnimate, {
        toValue: 1,
        duration: 98,
        easing: Easing.ease,
        useNativeDriver: !IOS
      }).start()
    })

    this.internalOffsetAnimate.setValue(0)
    Animated.timing(this.internalOffsetAnimate, {
      toValue: 1,
      duration: 196,
      easing: Easing.ease,
      useNativeDriver: !IOS
    }).start()
  }

  render() {
    const height = this.getStatusBarHeight()
    return (
      <SafeAreaView style={[styles.backLayerContainer, this.props.backLayerStyle]} >
        {this.renderBackLayerConcealed(height)}
        {this.renderBackLayerRevealed(height)}
        {this.renderFrontLayer()}
        {this.renderButtonActivator(height)}
      </SafeAreaView>
    )
  }

  renderFrontLayer = () => {
    const translateY = this.getFrontLayerTranslateY()

    return (
      <Animated.View style={[
        styles.frontLayerContainer,
        elevationStyle,
        this.props.frontLayerStyle,
        {transform: [{translateY}]}
      ]} >
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
      <Animated.View style={[styles.backLayer, {opacity}]} >
        {this.renderHeaderEdge(statusBarHeight)}
        {this.props.backLayerConcealed()}
      </Animated.View>
    )
  }

  renderBackLayerRevealed = statusBarHeight => {
    if (!this.props.backRevealedElementsConfig.length || !this.state.backRevealed) {
      return null
    }
    const md = this.state.backRevealed ? 0 : 1
    const opacity = this.animate.interpolate({
      inputRange: [0, 0.6, 1],
      outputRange: [0, md, 1]
    })

    return (
      <Animated.View style={[styles.backLayer, {opacity}]} >
        {this.renderHeaderEdge(statusBarHeight)}
        {this.renderBackElements()}
      </Animated.View>
    )
  }

  renderBackElements = () => {
    const elementsConfig = this.props.backRevealedElementsConfig, i = this.state.elementIndex
    const opacity = this.internalAnimate.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0, 1]
    })

    return (
      <Animated.View style={{flex: 1, opacity}} >
        {elementsConfig[i].el()}
      </Animated.View>
    )
  }

  renderScrimLayer = () => {
    if (!this.state.backRevealed) {
      return null
    }
    return (
      <TouchableWithoutFeedback onPress={() => this.toggleLayout()} >
        <Animated.View style={[styles.scrimLayer, {opacity: this.animate}]} >
          <Icon name='chevron-up' size={24} color='rgba(0,0,0,0.56)' style={styles.scrimLayerIcon} />
        </Animated.View>
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
          background={Touchable.Ripple(this.props.buttonRippleColor, true)}
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

  getFrontLayerTranslateY = () => {
    if (this.isInternalAnimate) {
      const elements = this.props.backRevealedElementsConfig,
      v1 = elements[this.state.lastIndex].offset || this.getOffset(true),
      v2 = elements[this.state.nextIndex].offset || this.getOffset(true)
      return this.internalOffsetAnimate.interpolate({
        inputRange: [0, 1],
        outputRange: [v1, v2]
      })
    }
    const offset = this.getOffset()
    return this.animate.interpolate({
      inputRange: [0, 1],
      outputRange: [this.props.initialOffset, offset]
    })
  }

  getOffset = (ignoreElement = false) => {
    const elementsConfig = this.props.backRevealedElementsConfig,
    elementIndex = this.state.elementIndex

    if (!ignoreElement && elementsConfig.length && elementsConfig[elementIndex].offset) {
      return elementsConfig[elementIndex].offset
    }

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
  backLayerContainer: {
    flex: 1,
    backgroundColor: 'blue'
  },
  frontLayerContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  backLayer: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
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
    height: 32,
    width: 32,
    justifyContent: 'center'
  },
  activatorIcon: {
    marginTop: IOS ? 2 : 0,
    alignSelf: 'center'
  },
  scrimLayer: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },
  scrimLayerIcon: {
    position: 'absolute',
    top: 12, right: 16
  }
})

const elevationStyle = {
  shadowColor: 'black',
  shadowOpacity: 0.25,
  shadowRadius: 6 * .75,
  shadowOffset: { height: 6 * .45 },
  elevation: 6,
}
