 import { KeyboardAvoidingView, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native'
 import React, { useEffect, useLayoutEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { Avatar, Accessory, Button, Input, Text} from 'react-native-elements'
import {AntDesign, SimpleLineIcons} from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { auth,db } from '../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { async } from '@firebase/util';
import uuid from "uuid";
import Spinner from 'react-native-loading-spinner-overlay';
 
 const RegisterScreen = ({ route: { params: { phoneNumber } }, navigation }) => {
   const [name, setName] = useState("");
   const [imageUrl, setImageUrl] = useState("https://www.seekpng.com/png/detail/110-1100707_person-avatar-placeholder.png");
   const [isLoading, setIsLoading] = useState(false);
   
   useLayoutEffect(() => {
     navigation.setOptions({
         headerBackVisible: false,
         headerLeft: () => (
          <TouchableOpacity style={{flexDirection: "row", alignItems: "center",}} onPress={() => navigation.navigate("Login")}>
              <AntDesign style={{marginRight: 10}} name='arrowleft' size={25} color="white" />
              <Text size={25} style={{color:"white",}}>Back to Login</Text>
          </TouchableOpacity>
      ),
         
     })
   }, [navigation]);

   let openImagePickerAsync = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!pickerResult.cancelled) {
      //FIXME: use effect çalışmıyor usestate anlık güncellemiyor!
      setIsLoading(true);
      const uploadUrl = await uploadImageAsync(pickerResult.uri);
      setImageUrl(uploadUrl);
      setIsLoading(false);
      console.log(uploadUrl)
    }
  }

   const register = () => {
     if(name.length<3){
       alert("İsim en az 3 karakter olabilir");
     }else{
        db.collection("users").add({
          phoneNumber: phoneNumber,
          displayName: name,
          photoURL: imageUrl
        });
        const userNow = auth.currentUser;
        userNow.updateProfile({
          phoneNumber: phoneNumber, 
          displayName: name,
          photoURL: imageUrl,
         })
        navigation.navigate("Home")
     }
   };
   
  async function uploadImageAsync(uri) {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
  
    const fileRef = ref(getStorage(), uuid.v4());
    const result = await uploadBytes(fileRef, blob);
  
    // We're done with the blob, close and release it
    blob.close();
  
    return await getDownloadURL(fileRef);
  }

   return (
     <>
     {isLoading ? (
        <View style={{flexDirection: 'row',justifyContent: 'space-around',padding: 10,flex: 1,}} >
          <ActivityIndicator size="large" />
        </View>
     ):
     (
      <KeyboardAvoidingView behavior='padding' style={styles.contaner}>
       <StatusBar style='light' />
       <Text h3 style={{marginBottom: 50,}}>Create a Hey-O Account</Text>
       <View style={styles.inputContainer }> 
             <TouchableOpacity onPress={openImagePickerAsync}>
              <Avatar size="xlarge" rounded source={{uri: imageUrl}}>
                <Avatar.Accessory size={24}/>
              </Avatar>
            </TouchableOpacity>
            <Input placeholder='Full Name' style={{textAlign:'center'}} autoFocus type="text" onChangeText={(text)=>{setName(text)}} value={(name)} />            
       </View>
       <Button style={styles.button} raised onPress={register} title="Finish" />
       <View style={{height:100}} />
     </KeyboardAvoidingView>
     )
    }
     </>
   )
 }
 
 export default RegisterScreen
 
 const styles = StyleSheet.create({
     contaner: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        padding: 10,
        paddingTop:30,
        backgroundColor: "white",
     },
     inputContainer: {
        alignItems: "center",
        width: 300,
     },
     button: {
        width: 200,
        marginTop: 10,
     },
 })