import { Alert, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useLayoutEffect, useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import { Avatar } from 'react-native-elements';
import {AntDesign, Ionicons, FontAwesome} from "@expo/vector-icons";
import { auth, db } from '../firebase';
import firebase from "firebase/compat/app";
import Moment from 'moment';

const ChatScreen = ({navigation, route}) => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [photoURL, setPhotoURL] = useState("/");
    useLayoutEffect(() => {
        navigation.setOptions({
            title: "Chat",
            headerBackTitleVisible: false,
            headerBackVisible:false,
            headerTitleAlign: 'left',
            headerTitle: () => (
                <View style={{flexDirection: "row", alignItems: "center",}}>
                    
                    <Text style={{color: "white", marginLeft: 10, fontWeight: "700"}}>{route.params.chatName}</Text>
                </View>
            ),
            headerLeft: () => (
                <TouchableOpacity style={{flexDirection: "row", alignItems: "center",}} onPress={() => navigation.navigate("Home")}>
                    <AntDesign style={{marginRight: 10}} name='arrowleft' size={25} color="white" />
                    <Avatar rounded source={{uri: photoURL}} />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <View style={{flexDirection: "row", justifyContent: "flex-end", width: 80, marginRight: 10,}}>
                    <TouchableOpacity onPress={sendReport}>
                        <FontAwesome name='flag' size={24} color="white" />
                    </TouchableOpacity>
                </View>
            ),
        })
    }, [navigation, messages]); 
    const sendMessage = () => {
        if(input.trim() != ""){
            db.collection("chats").doc(route.params.id).collection("messages").add({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                message: input,
                phoneNumber: auth.currentUser.phoneNumber,
            });
            setInput("");
        }
    };
    const sendReport = async () => {
        Alert.alert(
            'Report Chat',
            'You are reporting this chat. Chat content will be shared with the rewiew team. Are you sure?',
            [
              {text: 'Cancel', onPress: () => {}, style: 'cancel'},
              {text: 'Send Report', onPress: () => {
                db.collection("reports")
                .where("chatId", "==", route.params.id)
                .where("reporterPhone", "==", auth.currentUser.phoneNumber)
                .where("status", "==", 0)
                .get().then((snapshot) => {
                    const reports = snapshot.docs
                    console.log(reports)
                    if(reports.length>0){
                        Alert.alert(
                            'You have report',
                            'You have reported this chat and we are on it. Please be patient!',
                            [{text: 'OK', onPress: () => {},}],
                            {cancelable: true},
                        );
                        return
                    }else{
                        db.collection("reports")
                        .add({
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            chatId: route.params.id,
                            reporterPhone: auth.currentUser.phoneNumber,
                            status: 0,
                        });
                        Alert.alert(
                            'Report Send',
                            'Your report sended. Review team working on it!',
                            [{text: 'OK', onPress: () => {},}],
                            {cancelable: true},
                        );
                    }
                });
                
              }},
            ],
            {cancelable: false},
          );
    };
    useEffect(() => {
        const unsubscribe = db
        .collection("users")
        .where("phoneNumber", "==", route.params.phoneNumber)
        .onSnapshot((snapshot) => {
            snapshot.docs.map((doc) => {
                setPhotoURL(doc.data().photoURL)
            })
        });
        return unsubscribe;
    });
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
            style={styles.container}
            behavior={Platform.OS == 'ios' ? 'padding' : 'margin'}
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
                                        uri: auth.currentUser.photoURL
                                    }}
                                    />
                                    <Text style={styles.recieverText}>{data.message}</Text>
                                    <Text style={styles.timeStamp}>{Moment(data.timestamp?.toDate()).format('H:m')}</Text>
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
                                        uri: photoURL
                                    }}
                                    />
                                    <Text style={styles.senderText}>{data.message}</Text>
                                    <Text style={styles.timeStamp}>{Moment(data.timestamp?.toDate()).format('H:m')}</Text>
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
    timeStamp: {
        left: 10,
        paddingRight: 10,
        fontSize: 10,
        color: "grey",
    },
})