import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import CustomListItem from '../compoments/CustomListItem'
import { Avatar, Image, Button, Icon } from 'react-native-elements'
import { auth, db } from '../firebase';
import {AntDesign, SimpleLineIcons} from "@expo/vector-icons";
import AddChatScreen from './AddChatScreen'

const HomeScreen = ({navigation}) => {
  const [chats, setChats] = useState([]);

  const signOut = () => {
    auth.signOut().then(() => {
      navigation.replace("Login");
    });
  };
  useEffect(() => {
    const unsubscribe = db.collection("chats").where("whoIs", "array-contains-any", [auth.currentUser.phoneNumber]).onSnapshot(snapshot => {
      setChats(snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data(),
      })))
    });
    return unsubscribe;
  }, []);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser)=>{
        if(!authUser) {
          navigation.replace("Loading");
        }
    });
    return unsubscribe;
  }, [])
  useLayoutEffect(() => {
    navigation.setOptions({
        title: "Hey-O",
        headerStyle: {backgroundColor: "#fff"},
        headerTitleStyle: {color: "black"},
        headerTintColor: "black",
        headerLeft: ()=> (<View style={{marginLeft: 20}}>
          <TouchableOpacity onPress={()=>{auth.signOut()}} activeOpacity={0.5}>
          <Avatar rounded source={{uri: auth?.currentUser?.photoURL }} />
          </TouchableOpacity>
        </View>
        ),
        headerRight: () => (
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: 80,
            marginRight: 20
          }} >
            <TouchableOpacity>
              <AntDesign name='camerao' size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity>
              <SimpleLineIcons onPress={() => navigation.navigate("AddChat") } name='pencil' size={24} color="black" />
            </TouchableOpacity>
          </View>
        ),
    }) 
  }, [navigation])
  const enterChat = (id, chatName) => {
    navigation.navigate("Chat", {
      id,
      chatName,
    });
  };
  const navigateToAdd = () => {
    navigation.navigate("AddChat");
  }
  return (
    <SafeAreaView>
      {chats.length>0 ?
      (
      <ScrollView style={styles.container}>
        {chats.map(({id, data: {chatName1,chatName2,whoIs}})=>(
          <CustomListItem key={id} id={id} chatName={whoIs[0]==auth.currentUser.phoneNumber?chatName2:chatName1} phoneNumber={whoIs[0]==auth.currentUser.phoneNumber?whoIs[1]:whoIs[0]} enterChat={enterChat} />
        ))}
      </ScrollView>
      ):(
        <View style={styles.noChat}>
        <Image style={styles.noChat} source={{
            uri: "https://www.shareicon.net/download/2015/09/07/97135_face_512x512.png",
        }} style={{width: 150, height: 150}} />
        <Text> There is no chat started!</Text>
        </View>
      )
      }
    </SafeAreaView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    height: "100%"
  },
  noChat: {
    alignItems: "center",
    justifyContent: "center",
  },
})