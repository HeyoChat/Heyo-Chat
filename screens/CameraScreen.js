import { Image, ImageBackground, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {AntDesign, SimpleLineIcons, FontAwesome, Ionicons, Entypo} from "@expo/vector-icons";
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import Spinner from 'react-native-loading-spinner-overlay';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { async } from '@firebase/util';
import { auth, db } from '../firebase';
import firebase from "firebase/compat/app";
import uuid from "uuid";

const CameraScreen = ({navigation, route}) => {
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [image, setImage] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
    const [isLoading, setIsLoading] = useState(false);
    const cameraRef = useRef(null);

    useEffect(() => {
        (async () => {
            MediaLibrary.requestPermissionsAsync();
            const cameraStatus = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraStatus.status === "granted");
        })();
    })

    useLayoutEffect(() => {
        navigation.setOptions({headerShown: false})
      }, [navigation]);

      const toBack = () => {
        navigation.goBack()
      }

      const takePicture = async () => {
        if(cameraRef){
            try{
                const data = await cameraRef.current.takePictureAsync()
                console.log(data)
                setImage(data.uri)
            }catch(e){
                console.log(e)
            }
        }
      }

      const toggleCameraType = () => {
        setType(current => (current === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back))
      }

      async function openImagePickerAsync(){
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
          setImage(pickerResult.uri);
        }
    }
    async function uploadImageAsync(uri) {
        setIsLoading(true);
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
      
        const link = await getDownloadURL(fileRef);
        db.collection("chats").doc(route.params.id).collection("messages").add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            photo: link,
            phoneNumber: auth.currentUser.phoneNumber,
            reached: {[auth.currentUser.uid]: new Date()}
        });
        
        setIsLoading(false);
        navigation.goBack();
    }

    const cancelPhoto = () => {
        setImage(null);
    } 

      if(hasCameraPermission === false) {
        return <Text>No access to camera!</Text>
      }
  return (
    <View style={styles.container}>
        <Spinner
          //visibility of Overlay Loading Spinner
          visible={isLoading}
          //Text with the Spinner
          textContent={'Media Processing...'}
          //Text style of the Spinner Text
          textStyle={styles.spinnerTextStyle}
        />
        {!image ? (
            <Camera style={styles.camera} type={type} flashMode={flash} ref={cameraRef} >
                <SafeAreaView>
                    <TouchableOpacity style={[styles.otherButtons, {width: 40, height: 40}]} onPress={image ? cancelPhoto : toBack}>            
                        <Entypo name="cross" size={24} color="white" />
                    </TouchableOpacity>
                </SafeAreaView>
                <SafeAreaView>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity style={styles.otherButtons} onPress={openImagePickerAsync}>            
                            <Ionicons name="albums" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.takePicture} onPress={takePicture}>            
                            <SimpleLineIcons name='fire' size={32} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.otherButtons} onPress={toggleCameraType}>            
                            <Entypo name="cycle" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Camera>
        ) : (
            <ImageBackground source={{uri: image}} style={[styles.camera, {resizeMode: "stretch"}]} >
                <SafeAreaView style={{flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0}} >
                    <TouchableOpacity style={[styles.otherButtons, {width: 40, height: 40}]} onPress={image ? cancelPhoto : toBack}>            
                        <Entypo name="cross" size={24} color="white" />
                    </TouchableOpacity>
                </SafeAreaView>
                <SafeAreaView>
                    <View style={styles.bottomContainer}>
                        <View style={styles.toWhoBox}>
                            <Text style={{color: "white", fontWeight: "500"}}>{route.params.chatName}</Text>
                        </View>
                        <View style={styles.sendingGroup}>
                                
                            <TouchableOpacity style={[styles.sendButton, {marginLeft: 20}]} onPress={() => {uploadImageAsync(image)}}>            
                                <Ionicons name="send" size={32} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        )}
    </View>
  )
}

export default CameraScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    camera: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between"
    },
    bottomContainer: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 10,
        marginBottom: 10,
    },
    takePicture: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "orange",
        width: 80,
        height: 80,
        borderRadius: 25,
        padding: 0,
        shadowColor: "#000",
        shadowOffset: {
            width: 4,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,

        elevation: 4,
    },
    otherButtons: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "lightgrey",
        width: 50,
        height: 50,
        borderRadius: 25,
        padding: 0
    },
    sendButton: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "orange",
        width: 60,
        height: 60,
        borderRadius: 20,
        padding: 0,
        shadowColor: "#000",
        shadowOffset: {
            width: 4,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,

        elevation: 4,
    },
    toWhoBox: {
        width: "auto",
        height: 40,
        backgroundColor: "grey",
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
    },
    sendingGroup: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
    },
    spinnerTextStyle: {
        color: '#FFF',
    },
})