import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { styles } from "../theme/styles";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {}

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loaderWrap}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>Restart the app and try again. Your plan stays saved locally on this device.</Text>
        </View>
      </SafeAreaView>
    );
  }
}
