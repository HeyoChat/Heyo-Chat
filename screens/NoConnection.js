import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, { useEffect, useLayoutEffect } from 'react'
import { Image, } from 'react-native-elements'
import NetInfo from '@react-native-community/netinfo';

const NoConnection = ({navigation}) => {
  useLayoutEffect(() => {
    navigation.setOptions({
        headerShown: false,
    }) 
  }, [navigation])
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
        if(state.isConnected){
          navigation.replace("Loading");
        }
      });
      return unsubscribe;   
  }, [])
  return (
    <View style={{flexDirection: 'column',justifyContent: 'center', alignItems: 'center', padding: 10,flex: 1,}} >
      <Image source={require('../assets/noConnection.png')} style={{width: 150, height: 150}} />
      <Text>There is no network connection!</Text>
    </View>
  )
}

export default NoConnection