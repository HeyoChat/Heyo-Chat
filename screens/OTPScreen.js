import { FirebaseRecaptchaVerifier, FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Button, Input } from 'react-native-elements';
import CustomText from '../compoments/CustomText';
import CustomTextInput from '../compoments/CustomTextInput';
import FullButtonComponent from '../compoments/FullButtonCompoment';
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { initializeApp, getApp } from 'firebase/app';
import { auth,db } from '../firebase';


const OTPScreen = function ({ route: { params: { phoneNumber } }, navigation }) {
  const [otpArray, setOtpArray] = React.useState(['', '', '', '']);
  const [submittingOtp, setSubmittingOtp] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [confirm, setConfirm] = React.useState(null);
  const [verificationId, setVerificationId] = React.useState();
  const recaptchaVerifier = React.useRef(null);
  const app = getApp();
  const firebaseConfig = app ? app.options : undefined;
  const attemptInvisibleVerification = true;

  const firstTextInputRef = useRef(null);
  const secondTextInputRef = useRef(null);
  const thirdTextInputRef = useRef(null);
  const fourthTextInputRef = useRef(null);
  const fivthTextInputRef = useRef(null);
  const sixthTextInputRef = useRef(null);

  const refCallback = textInputRef => node => {
    textInputRef.current = node;
  };

  useEffect(() => {
    signInWithPhoneNumber();
  }, [])

  async function signInWithPhoneNumber() {
    try{
        const phoneProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneProvider.verifyPhoneNumber(
          phoneNumber,
          recaptchaVerifier.current
        );
        setVerificationId(verificationId);
        setErrorMessage('Verification code has been sent to your phone.');
     }catch(e){
      alert(e);
      navigation.goBack();
    }
   }
 
   async function confirmCode() {
     try{
      
     const code = otpArray.join("");
     console.log(code)
     const credential = PhoneAuthProvider.credential(
              verificationId,
              code
            );
     const response = await signInWithCredential(auth, credential);
     if(response){
      db.collection("users").where("phoneNumber", "==", phoneNumber)
      .get()
      .then(querySnapshot => {  
        if(querySnapshot.empty){
          navigation.replace("Register", {phoneNumber});
        }else{
          updateLogin(querySnapshot);
        } 
      })
     }
     } catch(e){
       alert(e);
     }
   }
   const updateLogin = (querySnapshot) => {
    const data = querySnapshot.docs.map((doc) => doc.data());
    const userNow = auth.currentUser;
    userNow.updateProfile({
      phoneNumber: phoneNumber, 
      displayName: data[0].displayName,
      photoURL: data[0].photoURL
    });
    navigation.navigate("Home");
   }
  const onOtpChange = index => {
    return value => {
      if (isNaN(Number(value))) {
        return;
      }
      const otpArrayCopy = otpArray.concat();
      otpArrayCopy[index] = value;
      setOtpArray(otpArrayCopy);
      if (value !== '') {
        if (index === 0) {
          secondTextInputRef.current.focus();
        } else if (index === 1) {
          thirdTextInputRef.current.focus();
        } else if (index === 2) {
          fourthTextInputRef.current.focus();
        } else if (index === 3) {
          fivthTextInputRef.current.focus();
        } else if (index === 4) {
          sixthTextInputRef.current.focus();
          setSubmittingOtp(false);
        }
      }
    };
  };

  const onOtpKeyPress = (index) => {
    return ({ nativeEvent: { key: value } }) => {
      if (value === 'Backspace' && otpArray[index] === '') {
        if (index === 1) {
          firstTextInputRef.current.focus();
        } else if (index === 2) {
          secondTextInputRef.current.focus();
        } else if (index === 3) {
          thirdTextInputRef.current.focus();
        } else if (index === 4) {
          fourthTextInputRef.current.focus();
        } else if (index === 5) {
          fivthTextInputRef.current.focus();
        }
        if (Platform.OS === 'android' && index > 0) {
          const otpArrayCopy = otpArray.concat();
          otpArrayCopy[index - 1] = '';
          setOtpArray(otpArrayCopy);
        }
      }
    };
  };

  return (
      <View style={styles.container}>
        <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        attemptInvisibleVerification={false}
        />
        <CustomText>
          Enter code sent to your{' ' + phoneNumber}
        </CustomText>
        <View style={{flexDirection: 'row', alignItems: 'center', marginTop:20}}>
          {[
            firstTextInputRef,
            secondTextInputRef,
            thirdTextInputRef,
            fourthTextInputRef,
            fivthTextInputRef,
            sixthTextInputRef,
          ].map((textInputRef, index) => (
            <CustomTextInput
              containerStyle={{flex:1,marginRight:20}}
              style={styles.otpText}
              value={otpArray[index]}
              onKeyPress={onOtpKeyPress(index)}
              onChangeText={onOtpChange(index)}
              keyboardType={'numeric'}
              maxLength={1}
              autoFocus={index === 0 ? true : undefined}
              refCallback={refCallback(textInputRef)}
              key={index}
            />
          ))}
        </View>

        {errorMessage ? (
          <CustomText
            style={{color:"red",marginRight:20,marginTop:20,textAlign:"center"}}>
            {errorMessage}
          </CustomText>
        ) : null}
    
        <FullButtonComponent
          buttonStyle={{marginTop:20}}
          type={'fill'}
          text={'Submit'}
          textStyle={styles.submitButtonText}
          onPress={() => confirmCode()}
          disabled={submittingOtp}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    alignItems: 'center',
    paddingTop: 130,
  },
  submitButtonText: {
    color: "white",
  },
});

export default OTPScreen;