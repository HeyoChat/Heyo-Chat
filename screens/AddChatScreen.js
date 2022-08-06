import { SafeAreaView, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, { useLayoutEffect, useState, useEffect } from 'react'
import { Button, Icon, Input, Image } from 'react-native-elements'
import * as Contacts from 'expo-contacts';
import { auth, db } from '../firebase';
import CustomListItem from '../compoments/CustomListItem';

const AddChatScreen = ({navigation}) => {
    const [input, setInput] = useState("");
    const [contacts, setContacts] = useState([]);
    const dataJSON = require('../assets/CountryCodes.json');
    const [isLoading, setIsLoading] = useState(false);
    var contactPhones = [];
    var countrCodes = [];
    var mergedPhone = [];
    useEffect(() => { 
        (async () => {
          const { status } = await Contacts.requestPermissionsAsync();
          if (status === 'granted') {
            const { data } = await Contacts.getContactsAsync({
              fields: [Contacts.Fields.PhoneNumbers],
            });
    
            if (data.length > 0) {
              setIsLoading(true);
              for(var i = 0; i<data.length; i++){
                contactPhones[i] = data[i]["phoneNumbers"][0]["digits"];
                var code = data[i]["phoneNumbers"][0]["countryCode"].toUpperCase();
                for (var j = 0; j<dataJSON.length; j++){
                    if(dataJSON[j].code === code){
                        countrCodes[i] = dataJSON[j].dial_code;
                    }
                }
                
              }
              for(var i = 0; i<contactPhones.length; i++){
                  mergedPhone[i] = countrCodes[i]+contactPhones[i];
                  db.collection("users").where("phoneNumber", "==", mergedPhone[i])
                  .get()
                  .then(querySnapshot => {  
                    if(querySnapshot.empty){
                    }else{
                      const result = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        data: doc.data(),
                      }));
                      if (result[0].data.phoneNumber != auth.currentUser.phoneNumber){
                          setContacts(old => [...old, result[0]]);
                      }
                    }                    
                  })
                  .catch(function(error) {
                      console.log("Error getting documents: ", error);
                  });
                  
              }
              setIsLoading(false);
            }
          }
        })();
      }, []);
    useLayoutEffect(() => {
        navigation.setOptions({
            headerBackTitle: "Chats",
            title: "Add a New Chat",
        })
    }, [navigation]);  
    const createChat = async (id,displayName,phoneNumber) => {
      var chatName2 = "";
      var isHave = false;
      const who = [auth.currentUser.phoneNumber,phoneNumber]
      await db.collection("chats").where("whoIs", "array-contains", phoneNumber)
      .get()
      .then(querySnapshot => {
        if(!querySnapshot.empty){
          isHave = true;
          const chatData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data(),
          }));
          const id = chatData[0].id;
          const chatName = chatData[0].data.whoIs[0] == auth.currentUser.phoneNumber ? chatData[0].data.chatName2 : chatData[0].data.chatName1;  
          navigation.navigate("Chat", {
            id,
            chatName,
          });  
        }
      });
      if(!isHave){
        await db.collection("users").where("phoneNumber", "==", phoneNumber)
        .get()
        .then(querySnapshot => {
          const data = querySnapshot.docs.map((doc) => doc.data());  
          chatName2 = data[0].displayName;
        });
        await  db.collection("chats").add({
            chatName1: auth.currentUser.displayName,
            chatName2: chatName2,
            whoIs: who
        }).then(() => {
            navigation.goBack();
        }).catch((error) => alert(error));
      }
    };
    return (
      <SafeAreaView>
      {
          isLoading ?
          (
            <View style={{flexDirection: 'row',justifyContent: 'space-around',padding: 10,flex: 1,}} >
              <ActivityIndicator size="large" />
            </View>
          )
          : contacts.length>0 ?
          (
            <ScrollView style={styles.container}>
              {contacts.map(({id, data: {displayName,phoneNumber}})=>(
                <CustomListItem key={id} id={id} chatName={displayName} phoneNumber={phoneNumber} enterChat={createChat} />
              ))}
            </ScrollView>
          )
          :
          (
            <View style={styles.noChat}>
              <Image style={styles.noChat} source={{
                  uri: "https://www.shareicon.net/download/2015/09/07/97135_face_512x512.png",
              }} style={{width: 150, height: 150}} />
              <Text>There is no one registered in your contacts!</Text>
              <ActivityIndicator style={{marginTop: 50,}} size="large" />
            </View>
          )
        }      
    </SafeAreaView>
  ) 
}

export default AddChatScreen

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        height: "100%",
    },
    noChat: {
      alignItems: "center",
      justifyContent: "center",
    },
})