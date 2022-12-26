import { SafeAreaView, ScrollView, StyleSheet, Text, View, ActivityIndicator, Platform } from 'react-native'
import React, { useLayoutEffect, useState, useEffect } from 'react'
import { Button, Icon, Input, Image } from 'react-native-elements'
import * as Contacts from 'expo-contacts';
import { auth, db } from '../firebase';
import CustomListItem from '../compoments/CustomListItem';

const AddChatScreen = ({navigation}) => {
    const [input, setInput] = useState("");
    const [contacts, setContacts] = useState([]);
    const dataJSON = require('../assets/CountryCodes.json');
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
              for(var i = 0; i<data.length; i++){
                if (Platform.OS == "ios"){
                  contactPhones[i] = data[i]["phoneNumbers"][0]["digits"];
                  var code = data[i]["phoneNumbers"][0]["countryCode"].toUpperCase();
                  for (var j = 0; j<dataJSON.length; j++){
                    if(dataJSON[j].code === code){
                        !contactPhones[i].startsWith("+") ?
                        countrCodes[i] = dataJSON[j].dial_code :
                        countrCodes[i] = "";
                    }
                  }
                }else if(Platform.OS == "android"){
                  const number = data[i].phoneNumbers && data[i].phoneNumbers[1] && data[i].phoneNumbers[1].number && data[i].phoneNumbers[0] && data[i].phoneNumbersgit[0].number
                  
                  number != undefined ? mergedPhone[i] = number : mergedPhone[i] = "";
                  mergedPhone[i] = mergedPhone[i].replace(/ /g, '');
                  if(mergedPhone[i].startsWith("0")){
                    mergedPhone[i] = "+9"+mergedPhone[i]
                  }
                  console.log(mergedPhone[i])
                }
                
              }
              for(var i = 0; Platform.OS == "ios" ? i<contactPhones.length : i<mergedPhone.length; i++){
                  if(Platform.OS == "ios"){
                    mergedPhone[i] = countrCodes[i]+contactPhones[i];
                  }
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
          contacts.length>0 ?
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
              <Image style={styles.noChat} source={require('../assets/face.png')} style={{width: 150, height: 150}} />
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