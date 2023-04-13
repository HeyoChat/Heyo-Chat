import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import {
	FlingGestureHandler,
	Directions,
	State,
    TouchableOpacity,
    GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
	withSpring,
	useAnimatedStyle,
	useAnimatedGestureHandler,
	useSharedValue,
    runOnJS
} from "react-native-reanimated";
import { Avatar } from 'react-native-elements';
import Moment from 'moment';
import { auth, db } from '../firebase';

const Message = ({id,routeId,chatName,text,timeStamp,photo,isLeft,deleted,reply,onSwipe,onHold,isNew}) => {
    const [replyDoc, setReplyDoc] = useState(null);
    const startingPosition = 0;
	const x = useSharedValue(startingPosition);
    const eventHandler = useAnimatedGestureHandler({
		onStart: (event, ctx) => {

		},
		onActive: (event, ctx) => {
			x.value = 50;
		},
		onEnd: (event, ctx) => {
			x.value = withSpring(startingPosition);
		}
	});
    const uas = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: x.value }]
		}
	});

    useEffect(() => {
        if(reply){
            db.collection("chats")
            .doc(routeId)
            .collection("messages")
            .doc(reply)
            .get()
            .then(snapshot => {
                setReplyDoc(snapshot.data())
            }
            );
        }
    }, []);
  return (
    <GestureHandlerRootView >
    <FlingGestureHandler
        direction={Directions.RIGHT}
        onGestureEvent={eventHandler}
        onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE) {
                onSwipe(id);
            }
        }}
    >
        <Animated.View style={uas}>
            <TouchableOpacity  onLongPress={()=>{ if(!deleted) onHold(id)}} activeOpacity={0.8} >
            <View style={ isLeft ? styles.sender : styles.reciever}>
                {isNew && (
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
                        uri: photo
                    }}
                    />
                )}
            {!deleted ? (
            <>
                <Text style={isLeft ? styles.senderText : styles.recieverText}>{text}</Text>
                <Text style={styles.timeStamp}>{Moment(timeStamp?.toDate()).format('H:m')}</Text>
                </>
            ): (
                <Text style={styles.recieverDeletedText}>This message deleted!</Text>
            )}
            {replyDoc && (
                <TouchableOpacity>
                    <View style={styles.replyContainer}>
                        <Text style={styles.title}>
                            {replyDoc.phoneNumber == auth.currentUser.phoneNumber ? "Me" : chatName}
                        </Text>
                        <Text style={styles.reply}>{replyDoc.deleted ? "This message was deleted!" : replyDoc.message}</Text>
                    </View>
                </TouchableOpacity>
            )}
            </View>
            </TouchableOpacity>
        </Animated.View>
    </FlingGestureHandler>
    </GestureHandlerRootView>
  )
}

export default Message

const styles = StyleSheet.create({
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
        fontWeight: "400",
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
        fontWeight: "400",
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