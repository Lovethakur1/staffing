import { registerRootComponent } from 'expo';

// Register background tasks BEFORE app component loads
import './src/services/backgroundLocation';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
