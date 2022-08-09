import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, { useEffect, useLayoutEffect } from 'react'
import { auth } from '../firebase'

const LoadingScreen = ({navigation}) => {
  useLayoutEffect(() => {
    navigation.setOptions({
        headerShown: false,
    }) 
  }, [navigation])
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser)=>{
        if(authUser) {
          navigation.replace("Home");
        }else{
          navigation.replace("Login");
        }
    });
    return unsubscribe;
  }, [])
  return (
    <View style={{flexDirection: 'row',justifyContent: 'space-around',padding: 10,flex: 1,}} >
      <ActivityIndicator size="large" />
    </View>
  )
}

export default LoadingScreen