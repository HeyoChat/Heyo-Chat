import { StyleSheet, Text, View } from 'react-native'
import { ListItem, Avatar, } from 'react-native-elements'
import React, { useEffect, useState } from 'react'
import { ListItemContent } from '@rneui/base/dist/ListItem/ListItem.Content'
import { db } from '../firebase'

const CustomListItem = ({id,chatName,phoneNumber,enterChat}) => {
    const [chatMessages, setChatMessages] = useState([]);
    useEffect(() => {
        const unsubscribe = db
        .collection("chats")
        .doc(id)
        .collection("messages")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => setChatMessages(snapshot.docs.map((doc) => doc.data())));
        return unsubscribe;
    });
  return (
    <ListItem onPress={() => enterChat(id,chatName,phoneNumber)} key={id} bottomDivider>
        <Avatar rounded source={{uri: chatMessages?.[0]?.photoURL || "https://www.seekpng.com/png/detail/110-1100707_person-avatar-placeholder.png"}} />
        <ListItem.Content>
            <ListItem.Title style={{fontWeight: "800"}}>
                {chatName}
            </ListItem.Title>
            <ListItem.Subtitle numberOfLines={1} ellipsizeMode="tail">
                {
                    chatMessages?.[0]?.displayName === undefined ? "" : chatMessages?.[0]?.displayName+": "+chatMessages?.[0]?.message
                }
            </ListItem.Subtitle>
        </ListItem.Content>
    </ListItem>
  )
}

export default CustomListItem

const styles = StyleSheet.create({})