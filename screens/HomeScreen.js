import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useLayoutEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import CustomListItem from '../compoments/CustomListItem'
import { Avatar } from 'react-native-elements'
import { auth } from '../firebase';
import {AntDesign, SimpleLineIcons} from "@expo/vector-icons";

const HomeScreen = ({navigation}) => {
  const signOut = () => {
    auth.signOut().then(() => {
      navigation.replace("Login");
    });
  };
  useLayoutEffect(() => {
    navigation.setOptions({
        title: "Signal",
        headerStyle: {backgroundColor: "#fff"},
        headerTitleStyle: {color: "black"},
        headerTintColor: "black",
        headerLeft: ()=> (<View style={{marginLeft: 20}}>
          <TouchableOpacity activeOpacity={0.5}>
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
  return (
    <SafeAreaView>
      <ScrollView>
        <CustomListItem />
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({})