import { Keyboard, KeyboardAvoidingView, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useLayoutEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { Avatar } from 'react-native-elements';
import {AntDesign, Ionicons, FontAwesome} from "@expo/vector-icons";
import { auth, db } from '../firebase';
import firebase from "firebase/compat/app";
import Moment from 'moment';

const ChatScreen = ({navigation, route}) => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    useLayoutEffect(() => {
        navigation.setOptions({
            title: "Chat",
            headerBackTitleVisible: false,
            headerTitleAlign: 'left',
            headerTitle: () => (
                <View style={{flexDirection: "row", alignItems: "center",}}>
                    
                    <Text style={{color: "white", marginLeft: 10, fontWeight: "700"}}>{route.params.chatName}</Text>
                </View>
            ),
            headerLeft: () => (
                <TouchableOpacity style={{flexDirection: "row", alignItems: "center",}} onPress={() => navigation.navigate("Home")}>
                    <AntDesign style={{marginRight: 10}} name='arrowleft' size={25} color="white" />
                    <Avatar rounded source={{uri: messages[0]?.data.photoURL}} />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <View style={{flexDirection: "row", justifyContent: "space-between", width: 80, marginRight: 10,}}>
                    <TouchableOpacity>
                        <FontAwesome name='video-camera' size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name='call' size={24} color="white" />
                    </TouchableOpacity>
                </View>
            ),
        })
    }, [navigation, messages]); 
    const sendMessage = () => {
        db.collection("chats").doc(route.params.id).collection("messages").add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            message: input,
            displayName: auth.currentUser.displayName,
            phoneNumber: auth.currentUser.phoneNumber,
            photoURL: auth.currentUser.photoURL,
        });
        setInput("");
    };
    useLayoutEffect(() => {
        const unsubscribe = db
        .collection("chats")
        .doc(route.params.id)
        .collection("messages")
        .orderBy("timestamp", "desc")
        .onSnapshot(snapshot => setMessages(snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data(),
        }))));
        return unsubscribe;
    }, [route]);
    return (
        <SafeAreaView style={{flex:1, backgroundColor: "white"}}>
            <StatusBar style='light'/>
            <KeyboardAvoidingView
            behavior={Platform.OS == "ios" ? "padding" : "height"}
            style={styles.container}
            enabled
            keyboardVerticalOffset= {90}
            >
                <>
                    <ScrollView contentContainerStyle={{paddingTop: 15, paddingLeft: 15}}>
                        {messages.map(({id,data})=>(
                            data.phoneNumber === auth.currentUser.phoneNumber ? (
                                <View key={id} style={styles.reciever}>
                                    <Avatar 
                                    position="absolute"
                                    rounded
                                    containerStyle={{
                                        position: "absolute",
                                        bottom: -15,
                                        right: -5,
                                    }}
                                    bottom={-15}
                                    right={-5}
                                    size={30}
                                    source={{
                                        uri: data.photoURL
                                    }}
                                    />
                                    <Text style={styles.recieverText}>{data.message}</Text>
                                    <Text style={styles.senderName}>{Moment(data.timestamp.toDate()).format('H:m')}</Text>
                                </View>
                            ) : (
                                <View key={id} style={styles.sender}>
                                    <Avatar 
                                    position="absolute"
                                    rounded
                                    containerStyle={{
                                        position: "absolute",
                                        bottom: -15,
                                        left: -5,
                                    }}
                                    bottom={-15}
                                    left={-5}
                                    size={30}
                                    source={{
                                        uri: data.photoURL
                                    }}
                                    />
                                    <Text style={styles.senderText}>{data.message}</Text>
                                    <Text style={styles.senderName}>{Moment(data.timestamp.toDate()).format('H:m')}</Text>
                                </View>
                            )
                        ))}
                    </ScrollView>
                    <View style={styles.footer}>
                        <TextInput placeholder='Type a massage ...' style={styles.textInput} value={input} onChangeText={(text)=>setInput(text)} />
                        <TouchableOpacity style={{backgroundColor: "#2B6BE6", padding: 7.5, borderRadius: 30}} onPress={sendMessage} activeOpacity={0.5}>
                            <Ionicons name='send' size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    
                </>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default ChatScreen

const styles = StyleSheet.create({
    container:{
        flex: 1,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        padding: 15,
    },
    textInput: {
        bottom: 0,
        height: 40,
        flex: 1,
        marginRight: 15, 
        backgroundColor: "#ECECEC",
        padding: 10,
        color: "grey",
        borderRadius: 30
    },
    reciever: {
        padding: 15,
        backgroundColor: "#ECECEC",
        alignSelf: "flex-end",
        borderRadius: 20,
        marginRight: 15,
        marginBottom: 20,
        maxWidth: "80%",
        position: "relative",
    },
    recieverText: {
        color: "black",
        fontWeight: "500",
        marginLeft: 10,
        marginBottom: 15,
    },
    sender: {
        padding: 15,
        backgroundColor: "#ECECEC",
        alignSelf: "flex-start",
        borderRadius: 20,
        marginRight: 15,
        marginBottom: 20,
        maxWidth: "80%",
        position: "relative",
    },
    senderText: {
        color: "black",
        fontWeight: "500",
        marginLeft: 10,
        marginBottom: 15,
    },
    senderName: {
        left: 10,
        paddingRight: 10,
        fontSize: 10,
        color: "white",
    },
})