import { View, Text, Image, StyleSheet, Alert, Linking } from 'react-native';
import React, { useLayoutEffect, useState } from 'react'
import { auth, db } from '../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { async } from '@firebase/util';
import * as ImagePicker from 'expo-image-picker';
import uuid from "uuid";
import { TouchableOpacity } from 'react-native-gesture-handler';
import {AntDesign, SimpleLineIcons} from "@expo/vector-icons";
import { Avatar, Button } from 'react-native-elements';
import { deleteUser } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

const UserSettings = ({navigation}) => {
    const [imageUrl, setImageUrl] = useState(auth?.currentUser?.photoURL)
    const [isLoading, setIsLoading] = useState(false);

    const signOut = () => {
        auth.signOut().then(() => {
            navigation.replace("Login");
        });
    };
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
          setIsLoading(true);
          const uploadUrl = await uploadImageAsync(pickerResult.uri);
          setImageUrl(uploadUrl);
          setIsLoading(false);
          console.log(uploadUrl)
        }
    }
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
      
        const link = await getDownloadURL(fileRef);
        db.collection("users").doc(auth.currentUser.uid).update("photoURL", link)
        auth.currentUser.updateProfile({
          photoURL: link,
       })
       console.log(auth.currentUser)
        return link
    }
    const deleteAccount = () => {
      Alert.alert(
        'Deletin Account',
        'Are you sure you want to delete your account? This action is irreversible and you will no longer be able to access your messages.',
        [
          {text: 'Cancel', onPress: () => {}, style: 'cancel'},
          {text: 'Delete', onPress: () => {
            const phoneNumber = auth.currentUser.phoneNumber
            navigation.navigate('OTP', {"phoneNumber": phoneNumber, "operation": "Deletion"});
          }},
        ],
        {cancelable: false},
      );
    }
    useLayoutEffect(() => {
      navigation.setOptions({
          headerBackTitle: "Chats",
          title: "User Settings",
      })
    }, [navigation]);    
    return (
      <View style={styles.container}>
        <View style={styles.container}>
        <SimpleLineIcons onPress={() => signOut() } name='logout' size={24} color="black" />
          <View style={styles.avatarContainer}> 
          <TouchableOpacity onPress={openImagePickerAsync}>
              <Avatar size="xlarge" rounded source={{uri: imageUrl}}>
                <Avatar.Accessory size={24}/>
              </Avatar>
            </TouchableOpacity>
            <Text style={styles.name}>
                {auth?.currentUser?.displayName}
            </Text>
            <Text style={styles.infoValue}>{auth?.currentUser?.phoneNumber}</Text>
            <Button
              title="Delete Your Account"
              buttonStyle={{ backgroundColor: 'rgba(214, 61, 57, 1)' }}
              containerStyle={{
                height: 40,
                marginHorizontal: 50,
                marginVertical: 10,
              }}
              onPress={deleteAccount}
              titleStyle={{ color: 'white', marginHorizontal: 20 }}
            />
          </View>
          
        </View>
        <SafeAreaView style={styles.footer}>
          <Text> <Text style={{color: 'blue'}} onPress={() => Linking.openURL('https://heyochat.github.io/PublicWeb/privacypolicy.html')}>Privacy Policy</Text> & <Text style={{color: 'blue'}} onPress={() => Linking.openURL('https://heyochat.github.io/PublicWeb/termofuse.html')}>Terms of Use</Text></Text>
        </SafeAreaView>
      </View>
      );
}

export default UserSettings


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  infoContainer: {
    marginTop: 20,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  infoValue: {
    marginTop: 5,
  },
  footer: {
    alignItems: "center"
  }
});