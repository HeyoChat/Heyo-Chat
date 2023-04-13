import { StyleSheet, Text, View } from 'react-native'
import { ListItem, Avatar, Image, } from 'react-native-elements'
import React, { useEffect, useState } from 'react'
import { ListItemContent } from '@rneui/base/dist/ListItem/ListItem.Content'
import { db, auth } from '../firebase'

const CustomListItem = ({id,chatName,phoneNumber,enterChat,isListed}) => {
    const [chatMessages, setChatMessages] = useState([]);
    const [photoURL, setPhotoURL] = useState([]);
    useEffect(() => {
        const unsubscribe = db
        .collection("chats")
        .doc(id)
        .collection("messages")
        .orderBy("timestamp", "desc")
        .limit(1)
        .onSnapshot((snapshot) => {
            const lastMessage = snapshot.docs.map(doc => doc.data());
            setChatMessages(lastMessage)
        });
        return unsubscribe;
    });
    useEffect(() => {
        const unsubscribe = db
        .collection("users")
        .where("phoneNumber", "==", phoneNumber)
        .onSnapshot((snapshot) => {
            setPhotoURL(snapshot.docs.map((doc) => doc.data().photoURL))
        });
        return unsubscribe;
    });
  return (
    <ListItem onPress={() => enterChat(id,chatName,phoneNumber)} key={id} bottomDivider>
        <Avatar rounded source={{uri: photoURL[0] || "https://www.seekpng.com/png/detail/110-1100707_person-avatar-placeholder.png"}} />
        <ListItem.Content>
            <ListItem.Title style={chatMessages?.[0]?.reached[auth.currentUser.uid] === undefined && isListed ? {fontWeight: "800"} : {fontWeight: "500"}}>
                {chatName}
            </ListItem.Title>
            <ListItem.Subtitle numberOfLines={1} ellipsizeMode="tail">
                {chatMessages?.[0]?.reached[auth.currentUser.uid] === undefined && isListed ? 
                chatMessages.length > 0 ?
                (
                    <View style={styles.subtitleContainer} >
                        <View style={styles.box}></View>
                        <Text style={styles.notification}>New Message</Text>
                    </View>
                ) : (
                    <View style={styles.subtitleContainer} >
                        <Image style={{width: 20, height: 20}} source={{uri: "https://firebasestorage.googleapis.com/v0/b/chat-app-uey.appspot.com/o/hi-hand.gif?alt=media&token=ea2c7eb2-592c-4b59-a5b0-217c8f8fd1a4"}} ></Image>
                        <Text> Say hi to {chatName}</Text>
                    </View>
                ) :chatMessages?.[0]?.message }
                
            </ListItem.Subtitle>
        </ListItem.Content>
    </ListItem>
  )
}

export default CustomListItem

const styles = StyleSheet.create({
    box: {
        width: 15,
        height: 15,
        backgroundColor: "orange",
        borderRadius: 5,
    },
    notification: {
        color: "orange",
        fontWeight: "700",
        left: 10
    },
    subtitleContainer:{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        marginTop: 10
    }
})