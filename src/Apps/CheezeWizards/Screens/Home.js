import React from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View, RefreshControl, AppState
} from "react-native";
import {NavigationBar} from "../../../AliceCore/Components/NavigationBar";
import Button from '../Components/Button'
import WizardCard from '../Components/WizardCard'
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { Settings, Wallet, WalletConnect } from "../../../AliceSDK/Web3";
import FirebaseService from '../Services/FirebaseService';

import wizardsService from '../Services/WizardsService';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false
};

const { height, width } = Dimensions.get('window');

import db from '../../../AliceSDK/Socket'
import { isIphoneX } from "react-native-iphone-x-helper";

export default class CheezeWizardsHome extends React.Component {

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
      // loading: false,
      loading: true,
      pressed: false,
      actionList: [],
      wizards: [],
      network: '',
      fetching: false,
      balance: null,
      appState: AppState.currentState,

    };
  }

  componentDidMount() {
    this.getUser();
    this.getNetwork();
    AppState.addEventListener('change', this._handleAppStateChange);
    const aliceEventEmitter = Wallet.aliceEvent()
    aliceEventEmitter.addListener(
      "aliceEvent",
      (event) => {
        if (event.network) {
          const parsedEvent = JSON.parse(event.network);
          this.setState({network: parsedEvent.name, networkColor: parsedEvent.color}, this.fetchWizards);
        }
      }
    );
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    console.log('APPSTATE: ', nextAppState)
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
    }
    this.setState({appState: nextAppState});
  };

  // twitterLink = () => {
  //   let twitterUrl = `https://twitter.com/intent/tweet?text=${Wallet.getAddress()} Requesting Rinkeby ETH to play CheezeWizards at devcon 🧀🧙‍♂️`;
  //   Linking.openURL(twitterUrl).catch((err) => console.error('An error occurred with twitter link: ', err));
  // };
  //
  // faucetLink = () => {
  //   let faucetUrl = "https://faucet.rinkeby.io/";
  //   Settings.openBrowser("https://faucet.rinkeby.io/");
  //   // Linking.openURL(faucetUrl).catch((err) => console.error('An error occurred with faucet link: ', err));
  // };

  _refresh = () => {
    this.fetchWizards();
    this.setState({fetching: true})
  };

  getNetwork = async () => {
    const networkInfo = await Wallet.getNetwork();
    this.setState({ network: networkInfo.name }, this.fetchWizards);
  };

  getUser = async () => {
    try {
      db.collection("users")
        .onSnapshot((snapshot) => {
          let orders = [];
          console.log('USERS: ', snapshot);
          snapshot.forEach((doc) => {
            console.log('user: ', doc.id)
          });
        });
    } catch(e) {
      console.log('FIREBASE ERROR HOME : ', e)
    }
  };

  animate = () => {
    ReactNativeHapticFeedback.trigger("selection", options);
    this.setState({pressed: !this.state.pressed});
  };

  finishedLoading = async (network, wizards) => {
    FirebaseService.upsertWizards(network, wizards);
    this.setState({loading: false, fetching: false});
  };

  fetchWizards = async () => {
      const wizards = await wizardsService.getMyWizards();
      console.log("MY WIZARDS:", wizards);
      this.setState({wizards}, () => this.finishedLoading(this.state.network.toLowerCase(), wizards));
  };

  openMap = () => {
    ReactNativeHapticFeedback.trigger("selection", options);
    this.props.navigation.navigate('CheezeWizards/Map');
  };

  enterDuelMode = wizard => {
    ReactNativeHapticFeedback.trigger("selection", options);
    this.props.navigation.navigate('CheezeWizards/WizardScreen', {wizard});
  };


  render() {
    const { navigation } = this.props;

    return (
      <View style={{flex: 1, backgroundColor: '#fef064', alignItems: 'center', justifyContent: 'flex-start'}}>
        <NavigationBar/>
          {this.state.loading === true ? <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
          }}>
            <Image source={require('../Assets/landing.png')} style={{
              width,
              resizeMode: 'contain',
            }}/>
          </View> : <View style={{ flex: 1, width, backgroundColor: '#000', alignItems: 'center', }}>
            <Image source={require('../Assets/melting-cheese.png')} style={{
              resizeMode: 'contain',
              height: 250,
              position: 'absolute', top: 0
            }}/>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'space-around',}}>
              <View style={{flexDirection: 'row', position: 'absolute',  top: isIphoneX() ? 70 : 57, zIndex: 9999, flex: 1, alignItems: 'center', justifyContent: 'space-around'}}>
                <View style={{marginHorizontal: 5,paddingVertical: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, borderWidth: 1, borderColor: 'black', backgroundColor: 'white', ...styles.sharpShadow}}>
                  <Text style={{fontSize: 20, fontFamily: 'Exocet'}}>CHOOSE A WIZARD TO BATTLE</Text>
                </View>
              </View>
              {/*<TouchableOpacity onPress={() => this.twitterLink()} style={{backgroundColor: 'white', padding: 20}}><Text>WalletConnect</Text></TouchableOpacity>*/}
              {/*<TouchableOpacity onPress={() => WalletConnect.sendDataObject({"bob": "trap"})} style={{backgroundColor: 'white', padding: 20}}><Text>SendDataObject</Text></TouchableOpacity>*/}
              <ScrollView contentContainerStyle={{width: width -40, justifyContent: 'space-between', alignItems: 'center', paddingTop: 150}} showsVerticalScrollIndicator={false} refreshControl={
                <RefreshControl
                  refreshing={this.state.fetching}
                  onRefresh={this._refresh}
                />}
              >
                {this.state.network === 'Rinkeby' || this.state.network === 'Main' && this.state.wizards.length === 0 && <View style={{marginTop: 100}}>
                  <Text style={{color: 'white', fontSize: 20, fontFamily: 'Menlo-Regular'}}>You're seriously lacking some cheeze steeze. Click on the cow's udder to summon yoself a wizard from another gizzard</Text>
                  <Button onPress={() => this.props.navigation.navigate("CheezeWizards/Summon")} style={{width: 40, height: 45, marginBottom: 100}}>
                    <Image source={require('../Assets/udder.png')} style={{
                      resizeMode: 'contain',
                      width: 40,
                      height: 45
                    }}/>
                  </Button>
                </View>}
                {this.state.network !== 'Rinkeby' && this.state.network !== 'Main' && <View style={{marginTop: 100}}>
                  <Text style={{color: 'white', fontSize: 20, fontFamily: 'Menlo-Regular'}}>You're on the {this.state.network} Ethereum Network right now, CheezeWizards is only available on Main and Rinkeby 👉 tap on the Settings button, Click on Switch Network, and then tap Main or Rinkeby.</Text>
                  <Button onPress={Settings.settingsPopUp} style={{width: 40, height: 45, marginBottom: 20}}>
                    <Image source={require('../Assets/settings-icon.png')} style={{
                      resizeMode: 'contain',
                      width: 50,
                      height: 50
                    }}/>
                  </Button>
                </View>}
                {this.state.wizards.map((wizard, i) => {
                  return (
                    <TouchableOpacity style={{marginVertical: 10}} key={i} onPress={() => this.enterDuelMode(wizard)}>
                      <WizardCard style={{height: width - 10, width: width-80}} wizard={wizard}/>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
              <Button onPress={() => this.props.navigation.navigate("CheezeWizards/Summon")} style={{flex: 1, position: 'absolute', bottom: 20, right: 5, zIndex: 9999,}}>
                <Image source={require('../Assets/udder.png')} style={{
                  resizeMode: 'contain',
                  width: 40,
                  height: 45
                }}/>
              </Button>
            </View>
          </View>}
      </View>

    );
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

