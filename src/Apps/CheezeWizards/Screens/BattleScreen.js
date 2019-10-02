import React from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {NavigationBar} from "../../../AliceCore/Components/NavigationBar";
import {BasicTournament} from '../ABIs/BasicTournament';
import colors from "../Utils/colors";
import WizardCard from "../Components/WizardCard";
import {switchcase} from "../Utils";

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false
};

const { height, width } = Dimensions.get('window');

export default class BattleScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { navigate } = navigation;
    return {
      header: null,
      tabBarVisible: false,
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      scannedWizard: null,
      users: '',
      wizard: {},
      instantiated: false,
      receivedChallenge: null,
      footerColor: '#ffffff'
    };
  }

  componentDidMount() {
    const { wizard, challengedWizard } = this.props.navigation.state.params;
    this.getColor(wizard)
  }

  getColor = wizard => {
    const color = switchcase({
      1: () => this.setState({footerColor: colors.neutralMainColor}),
      2: () => this.setState({footerColor: colors.fireMainColor}),
      3: () => this.setState({footerColor: colors.waterMainColor}),
      4: () => this.setState({footerColor: colors.windMainColor}),
    });
    return color(wizard.affinity)();
  };

  render() {
    const { wizard, challengedWizard } = this.props.navigation.state.params;
    return (
      <View style={{flex: 1, backgroundColor: this.state.footerColor, alignItems: 'center', justifyContent: 'flex-start'}}>
        <NavigationBar/>
        <ImageBackground source={require('../Assets/battle-background.png')} style={{flex: 1, width, alignItems: 'center',}}>
          <View style={{flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <WizardCard style={{width: 175, height: 260}} wizard={wizard}/>
            <Image source={require('../Assets/vs-ribbon.png')} style={{ width: 50, height: 50, resizeMode: 'contain', position: 'absolute', zIndex: 100}}/>
            <WizardCard style={{width: 175, height: 260}} wizard={challengedWizard}/>
          </View>
        </ImageBackground>
      </View>)
  }
}

const styles = StyleSheet.create({
  sharpShadow: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowRadius: 0,
    shadowOpacity: 1,
  }
});
