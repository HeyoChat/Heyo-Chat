import { Alert, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useLayoutEffect, useState, useEffect, useRef } from 'react'
import { StatusBar } from 'expo-status-bar';
import ActionSheet from '@alessiocancian/react-native-actionsheet';
import { Avatar } from 'react-native-elements';
import {AntDesign, Ionicons, FontAwesome} from "@expo/vector-icons";
import { auth, db } from '../firebase';
import firebase from "firebase/compat/app";
import Moment from 'moment';
import * as Clipboard from 'expo-clipboard';
import Message from '../compoments/Message';

const ChatScreen = ({navigation, route}) => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [photoURL, setPhotoURL] = useState("/");
    const [lastDoc, setLastDoc] = useState(null);
    const [firstDoc, setFirstDoc] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionId, setActionId] = useState(null);
    const [isReply, setIsReply] = useState(false);
    const [replyDoc, setReplyDoc] = useState(null);
    const [replyId, setReplyId] = useState(null)
    let actionSheetSender = useRef();
    let scrollRef = useRef();
    var optionArraySender = ['Copy', 'Cancel'];
    let actionSheetReciever = useRef();
    var optionArrayReciever = ['Copy', 'Delete', 'Cancel'];
    const showActionSheetSender = (id) => {
        //To show the Bottom ActionSheet
        setActionId(id)
        actionSheetSender.current.show();
    };
    const showActionSheetReciever = (id) => {
        //To show the Bottom ActionSheet
        setActionId(id)
        actionSheetReciever.current.show();
    };
    const copyToClipboard = async (text) => {
        await Clipboard.setStringAsync(text);
    };
    
    const onSwipe = (id) => {
        const doc = messages.find(x => x.id == id)
        setReplyDoc(doc);
        setReplyId(id);
        setIsReply(true);
    }
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
    useEffect(() => {
        //Write Reached Data
        messages.forEach(element => {
            if(element.data.reached[auth.currentUser.uid] === undefined){
                const docRef = db
                .collection("chats")
                .doc(route.params.id)
                .collection("messages")
                .doc(element.id)
                
                
                docRef.set({reached: {[auth.currentUser.uid]: new Date()}},{merge: true})
            }
        });
    }, [messages]) 
    const sendMessage = () => {
        if(input.trim() != ""){
            if(isReply){
                db.collection("chats").doc(route.params.id).collection("messages").add({
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    message: input,
                    phoneNumber: auth.currentUser.phoneNumber,
                    reached: {[auth.currentUser.uid]: new Date()},
                    reply: replyId
                });
            }else{
                db.collection("chats").doc(route.params.id).collection("messages").add({
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    message: input,
                    phoneNumber: auth.currentUser.phoneNumber,
                    reached: {[auth.currentUser.uid]: new Date()}
                });
            }
            
            setInput("");
            closeReply();
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
    const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >=
          contentSize.height - paddingToBottom;
      };
    const loadMore = async () => {
        if(isLoading) return;
        if(lastDoc){
            setIsLoading(true)
            let messagesRef = db
            .collection("chats")
            .doc(route.params.id)
            .collection("messages")
            .orderBy("timestamp", "desc")
            .startAfter(lastDoc)

            messagesRef
            .limit(10)
            .get()
            .then(snapshot => {
                const newMessages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    data: doc.data(),
                }));

                setMessages(prevMessages => [
                    ...prevMessages,
                    ...newMessages,
                ]);

                if (snapshot.docs.length > 0) {
                    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
                } else {
                    setLastDoc(null);
                }

                setIsLoading(false);
            });
        }
        
    }
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
        .limit(20)
        .onSnapshot(snapshot => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                data: doc.data(),
                }))
            setMessages(data)
            if(!lastDoc){
                if (snapshot.docs.length > 0) {
                    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
                  } else {
                    setLastDoc(null);
                  }
            }
            //FIXME: yeni mesaj geldiğinde eskiler gidiyor yenileri öne ekle eskiler de kalsın bu şekilde ama yeni geldiklerine emin ol! 
            // if (snapshot.docs.length > 0) {
            //     setFirstDoc(snapshot.docs[0]);
            // }
            
        }
        );
        return unsubscribe;
    }, [route]);
    
    const closeReply = () => {
        setIsReply(false);
        setReplyDoc(null);
        setReplyId(null);
    }

    const openCamera = () => {
        navigation.navigate("Camera", {id: route.params.id, chatName: route.params.chatName})
    }

    return (
        <SafeAreaView style={{flex:1, backgroundColor: "white"}}>
            <StatusBar style='light'/>
            <ActionSheet
            ref={actionSheetSender}
            options={optionArraySender}
            cancelButtonIndex={1}
            onPress={(index) => {
                if(index == 0) {
                    const copyMessage = messages.find(message => message.id == actionId)
                    copyToClipboard(copyMessage.data.message)
                }
            }}
            />
            <ActionSheet
            ref={actionSheetReciever}
            options={optionArrayReciever}
            cancelButtonIndex={2}
            destructiveButtonIndex={1}
            onPress={(index) => {
                if(index == 0) {
                    const copyMessage = messages.find(message => message.id == actionId)
                    copyToClipboard(copyMessage.data.message)
                }else if(index == 1){
                    const docRef = db
                    .collection("chats")
                    .doc(route.params.id)
                    .collection("messages")
                    .doc(actionId)
                    
                    docRef.update({deleted: true})
                }
            }}
            />
            <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS == 'ios' ? 'padding' : 'margin'}
            enabled
            keyboardVerticalOffset= {90}
            >
                <>
                    <ScrollView 
                        ref={scrollRef}
                        onScroll={({nativeEvent}) => {
                            if (isCloseToBottom(nativeEvent)) {
                              loadMore();
                            }
                          }}
                        scrollEventThrottle={400}  
                        contentContainerStyle={{paddingTop: 15, paddingLeft: 15}}
                        >
                        {messages.map(({data,id},index,arrayObj)=>(
                            
                            data.phoneNumber === auth.currentUser.phoneNumber ? (
                                <Message
                                    key={id}
                                    id={id}
                                    routeId={route.params.id}
                                    chatName={route.params.chatName}
                                    isLeft={false}
                                    text={data.message}
                                    msgPhoto={data.photo}
                                    photo={auth.currentUser.photoURL}
                                    timeStamp={data.timestamp}
                                    deleted={data.deleted}
                                    reply={data.reply}
                                    onSwipe={onSwipe}
                                    onHold={showActionSheetReciever}
                                    isNew={arrayObj[index+1]?.data.phoneNumber != data.phoneNumber }
                                ></Message>
                                    
                            ) : (
                                
                                <Message
                                    key={id}
                                    id={id}
                                    routeId={route.params.id}
                                    chatName={route.params.chatName}
                                    isLeft={true}
                                    text={data.message}
                                    msgPhoto={data.photo}
                                    photo={photoURL}
                                    timeStamp={data.timestamp}
                                    deleted={data.deleted}
                                    reply={data.reply}
                                    onSwipe={onSwipe}
                                    onHold={showActionSheetSender}
                                    isNew={arrayObj[index+1]?.data.phoneNumber != data.phoneNumber }
                                ></Message>
                            )
                        ))}
                    </ScrollView>
                    {isReply && (
                        <View style={styles.replyContainer}>
                            <TouchableOpacity
                                onPress={closeReply}
                                style={styles.closeReply}
                            >
                                <FontAwesome name="close" color="grey" size={20} />
                            </TouchableOpacity>
                                <Text style={styles.title}>
                                    {replyDoc.data.phoneNumber === auth.currentUser.phoneNumber ? "Me" : route.params.chatName}
                                </Text>
                            <Text style={styles.reply}>{!replyDoc.data.deleted ? replyDoc.data.message : "This message deleted!"}</Text>
                        </View>
                    )}
                    
                    <View style={styles.footer}>
                        <View style={styles.textInput}>
                            <TextInput multiline={true} style={{width: "80%"}} placeholder='Type a massage ...' value={input} onChangeText={(text)=>setInput(text)} />
                            <TouchableOpacity onPress={openCamera} activeOpacity={0.5}>
                                <Ionicons name='camera' size={24} color="grey" />
                            </TouchableOpacity>
                        </View>
                        
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
        justifyContent: "center",
        width: "100%",
        padding: 15,
    },
    textInput: {
        flexDirection: "row",
        justifyContent: "space-between",
        bottom: 0,
        height: "auto",
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
    recieverDeletedText: {
        color: "black",
        fontWeight: "200",
        marginLeft: 10,
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
    senderDeletedText: {
        color: "black",
        fontWeight: "200",
        marginLeft: 10,
    },
    timeStamp: {
        left: 10,
        paddingRight: 10,
        fontSize: 10,
        color: "grey",
    },
    replyContainer: {
		paddingHorizontal: 10,
		marginHorizontal: 10,
		justifyContent: "center",
		alignItems: "flex-start",
        backgroundColor: "lightgrey",
        borderRadius: 5,
        marginTop: 10,
        paddingBottom: 10
	},
	title: {
		marginTop: 5,
		fontWeight: "bold",
	},
	closeReply: {
		position: "absolute",
		right: 10,
		top: 5,
	},
	reply: {
		marginTop: 5,
	},
})