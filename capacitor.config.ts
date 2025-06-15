
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d7360491a2494f6e9474c67ad3a482a2',
  appName: 'faith-flow-mobile',
  webDir: 'dist',
  bundledWebRuntime: false,
  // Remove the server configuration for native builds
  // The server config is only needed for live reload during development
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;
