import { StyleSheet, Text, View, KeyboardAvoidingView } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Button, Input, Image, Icon } from 'react-native-elements'
import PhoneInput from 'react-native-phone-input'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { auth } from '../firebase'
import { FirebaseRecaptchaVerifierModal, FirebaseRecaptchaBanner } from 'expo-firebase-recaptcha'
import NetInfo from '@react-native-community/netinfo';

const LoginScreen = ({navigation}) => {
  const [email,setEmail] = useState("");
  const [password,setPassword ] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("")
  const phoneRef = useRef(undefined);
  useLayoutEffect(() => {
    navigation.setOptions({
        headerBackVisible: false,
    }) 
  }, [navigation]);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if(!state.isConnected){
        navigation.replace("NoConnection");
      }
    });
    return unsubscribe;    
  }, []);
  const signIn = () => {
    if(phoneNumber && phoneNumber.length > 12){
        navigation.navigate('OTP', {phoneNumber});
        }
        else
        alert("Please enter 10 digit phone number");
  };
  return (
    <KeyboardAvoidingView behavior='padding' enabled style={styles.container}>
        <StatusBar style='light' />
        <Image source={require("../assets/login-icon.png")} style={{width: 150, height: 150}} />
        <View style={styles.inputContainer}>
            <PhoneInput
                style={styles.phoneInput} 
                ref={phoneRef}
                value={phoneNumber}
                initialCountry={'tr'}
                onChangePhoneNumber={setPhoneNumber} 
            />
        </View>
        <Button containerStyle={styles.button} onPress={signIn} title={<><Text style={{color: "white", fontWeight: "500"}}>Next</Text><Icon name="arrow-right" size={24} color="white" /></>} /> 
        <View style={{height:100}} />
    </KeyboardAvoidingView>
  )
}

export default LoginScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 10,

    },
    inputContainer: {
        width: 300,
        paddingTop: 50,
    },
    button: {
        width: 200,
        marginTop: 10,
    },
    phoneInput: {
        borderColor: '#ddd',
        borderWidth: 2,
        borderRadius: 2,
        padding: 16
      },
})