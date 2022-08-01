import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useLayoutEffect, useState, useEffect } from 'react'
import { Button, Icon, Input } from 'react-native-elements'
import * as Contacts from 'expo-contacts';
import { db } from '../firebase';
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
                      console.log("No match");
                      return;
                    }else{
                      const deneme = querySnapshot.docs;
                      deneme.forEach((doc) => {
                        setContacts(...contacts, querySnapshot.docs.map(doc => ({
                          id: doc.id,
                          data: doc.data(),
                        })));
                      });
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
    const createChat = async () => {
        await  db.collection("chats").add({
            chatName: input
        }).then(() => {
            navigation.goBack();
        }).catch((error) => alert(error));
    };
    return (
      <SafeAreaView>
      <ScrollView style={styles.container}>
        {console.log(contacts)}
        {contacts.map(({id, data: {displayName}})=>(
          <CustomListItem key={id} id={id} chatName={displayName} enterChat={createChat} />
        ))}
      </ScrollView>
    </SafeAreaView>
    
  ) 
}

export default AddChatScreen

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        padding: 30,
        height: "100%",
    },
})