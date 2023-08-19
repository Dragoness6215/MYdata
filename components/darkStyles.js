import { StyleSheet } from "react-native"
import { Dimensions } from 'react-native';

let light="#e6e3e1";
let highlight="#45ad6a";
let midtone = "#3da662";
let dark="#3b3b3b";
let warning = "#ed5b34";
let textColor=light;
let darkTextColor=light;
let backgroundColor= dark;

let pink="#c740d6";
let red="#d64040";
let yellow="#d6b640";
let green="#4ea66d";
let blue="#438ab0";
let teal="#43b0a9";
let indigo="#6243b0"

let largeFontSize=32;
let mediumFontSize=25;
let smallFontSize=20;
let tinyFontSize=18;

let minorFont='Gogh-ExtraBold';
let majorFont='goodlight';
let baseWidth = Dimensions.get("window").width;
let baseHeight = Dimensions.get("window").height;

// stylesheet, dark style
export default StyleSheet.create({
    container: {
        flex: 1,
        padding: baseWidth * .05,
        backgroundColor: backgroundColor,
    },
    
    buttonBox: {
        flex: 1,
        paddingHorizontal: baseWidth*.15,
        backgroundColor: backgroundColor,
    },
    
    fixToText: {
        flexDirection: 'row',
        flex: 1,
        margin: baseWidth * (1/45),
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: "wrap",
    },
    
    bottomLine:{
        borderBottomColor: textColor,
        borderBottomWidth: 3,
    },
    
    background:{
        flex: 1,
        backgroundColor: backgroundColor,
    },
    
    scrollView: {
        flex: 1,
    },
    
    border:{
        borderWidth:10,
        borderColor:highlight,
        alignItems: 'center',
        backgroundColor: backgroundColor,
    },
    
    title: {
        alignItems: 'center',
        color: textColor,
        textAlign: "center",
        fontSize: largeFontSize,
        fontFamily: majorFont,
        letterSpacing:3,
        flexWrap:'wrap',
        overflow: 'visible', 
        borderBottomColor: textColor,
        borderBottomWidth: 3,
    },
    
    header:{
        color: textColor,
        textAlign: "center",
        fontSize: mediumFontSize,
        margin:10,
        fontFamily: majorFont,
        flexWrap:'wrap',
        position:'relative',
        overflow: 'visible', 
    },
    
    subheader:{
        color: textColor,
        textAlign: "center",
        fontSize: smallFontSize,
        margin:5,
        fontFamily: majorFont,
        flexWrap:'wrap',
        position:'relative',
        overflow: 'visible', 
    },
    
    regularText:{
        alignItems: 'center',
        color: textColor,
        textAlign: "center",
        fontSize: smallFontSize,
        fontFamily: minorFont,
        flexWrap:'wrap',
        overflow: 'visible', 
    },
    
    taskItem:{
        color: textColor,
        fontSize: tinyFontSize,
        margin: 6,
        fontFamily: minorFont,
        alignItems: 'center',
    },
    
    taskTitle:{
        backgroundColor:highlight,
        padding: 10,
        elevation: 4,
        margin: 10,
        color: backgroundColor,
        fontSize: tinyFontSize,
        margin: 6,
        fontFamily: majorFont,
        letterSpacing:2,
    },
    
    barLine:{
        borderBottomColor: textColor,
        borderBottomWidth: 1,
    },
   
    tinyText:{
        alignItems: 'center',
        color: textColor,
        textAlign: "center",
        fontSize: tinyFontSize,
        fontFamily: minorFont,
        flexWrap:'wrap',
        overflow: 'visible', 
    },

    timelineText:{
        color: textColor,
        textAlign: "left",
        fontSize: tinyFontSize,
        fontFamily: minorFont,
    },
    
    smallLightText:{
        textAlign: "center",
        color: darkTextColor,
        fontSize: smallFontSize,
        paddingHorizontal:10,
        fontFamily: majorFont,
        flexWrap:'wrap',
        overflow: 'hidden',
    },
    
    tinyLightText:{
        textAlign: "center",
        color: darkTextColor,
        fontSize: tinyFontSize,
        paddingHorizontal:10,
        fontFamily: minorFont,
        flexWrap:'wrap',
        overflow: 'hidden',  
    },
    
    input:{
        marginBottom:10,
        borderWidth:4,
        color: darkTextColor,
        borderColor:highlight,
        textAlign: "center",
        borderRadius:15,
        fontSize: smallFontSize,
        overflow: 'hidden',
        fontFamily: minorFont,
        flexWrap:'wrap',
    },
    
    button: {
        alignItems: 'center',
        backgroundColor: midtone,
        color: darkTextColor,
        textAlign: "center",
        fontSize: mediumFontSize,
        borderRadius:15,
        padding:5,
        margin: 10,
        borderColor:midtone,
        paddingHorizontal:10,
        fontFamily: minorFont,
        flexWrap:'wrap',
        overflow: 'hidden', 
    },
    
    smallButton: {
        alignItems: 'center',
        backgroundColor: midtone,
        color: darkTextColor,
        textAlign: "center",
        fontSize: tinyFontSize,
        borderRadius:15,
        margin:5,
        padding:5,
        borderWidth:1,
        borderColor:midtone,
        paddingHorizontal:10,
        fontFamily: minorFont,
        flexWrap:'wrap',
        overflow: 'hidden', 
    },
    
    warningButton:{
        alignItems: 'center',
        backgroundColor: warning,
        color: darkTextColor,
        textAlign: "center",
        fontSize: smallFontSize,
        borderRadius:15,
        padding:5,
        margin: 5,
        borderColor:warning,
        paddingHorizontal:10,
        fontFamily: minorFont,
        flexWrap:'wrap',
        overflow: 'hidden',
        
    },
    
    lightButton:{
        alignItems: 'center',
        backgroundColor: highlight,
        color: darkTextColor,
        textAlign: "center",
        fontSize: smallFontSize,
        borderRadius:15,
        padding:5,
        margin: 5,
        borderColor:highlight,
        paddingHorizontal:10,
        fontFamily: minorFont,
        flexWrap:'wrap',
        overflow: 'hidden',
    },
    
    blueButton:{
        alignItems: 'center',
        backgroundColor: blue,
        color: darkTextColor,
        textAlign: "center",
        fontSize: smallFontSize,
        borderRadius:15,
        padding:5,
        margin: 5,
        borderColor:highlight,
        paddingHorizontal:10,
        fontFamily: minorFont,
        flexWrap:'wrap',
        overflow: 'hidden',
    },
    
    deleteButton:{
        alignItems: 'center',
        backgroundColor: warning,
        color: darkTextColor,
        textAlign: "center",
        fontSize: tinyFontSize,
        borderRadius:15,
        borderWidth:1,
        borderColor:warning,
        paddingHorizontal:10,
        fontFamily: minorFont,
        flexWrap:'wrap',
        overflow: 'hidden', 
    },
    
    bigButton:{
        alignItems: 'center',
        backgroundColor: midtone,
        color: darkTextColor,
        textAlign: "center",
        fontSize: largeFontSize,
        borderRadius:25,
        padding:10,
        margin: 10,
        borderColor:midtone,
        paddingHorizontal:10,
        fontFamily: majorFont,
        flexWrap:'wrap',
        overflow: 'hidden', 
    },
    
    bigBlueButton:{
        alignItems: 'center',
        backgroundColor: blue,
        color: darkTextColor,
        textAlign: "center",
        fontSize: mediumFontSize,
        borderRadius:25,
        padding:10,
        margin: 10,
        borderColor:midtone,
        paddingHorizontal:10,
        fontFamily: majorFont,
        flexWrap:'wrap',
        overflow: 'hidden', 
    },
    
    buttonTask:{
        backgroundColor: blue,
        borderRadius:15,
        margin: 5,
        color: darkTextColor,
    },

    tableHead: {
        backgroundColor: highlight,
        flex: 1, 
        flexWrap: 'wrap',
        fontSize: tinyFontSize,
        fontFamily: minorFont,
        textAlign: "center",
    },

    tableHeadText: {
        color: darkTextColor,
        fontSize: tinyFontSize,
        fontFamily: minorFont,
        textAlign: "center",
    },
    
    tableText: { 
        color: textColor,
        fontSize: tinyFontSize,
        margin: 6,
        fontFamily: minorFont,
        textAlign: "center",
        flex: 1, 
        flexWrap: 'wrap',
    },

    tinyLogo: {
        width: 320*1.2,
        height: 100*1.2,
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    
    titleLogo:{
        width: 225/3,
        height: 100/3,
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    

    alert:{
        color: textColor,
        textAlign: "center",
        fontFamily: majorFont,
        backgroundColor: backgroundColor,
        borderRadius:15,
        borderColor:highlight,
        borderWidth:5,
    },
    
    alertBody:{
        color: textColor,
        textAlign: "center",
        fontFamily: minorFont,
        fontSize:10,
        backgroundColor: backgroundColor,
        overflow: 'hidden', 
    },
    
    alertText:{
        color: textColor,
        textAlign: "center",
        fontFamily: majorFont,
        fontSize:tinyFontSize,
        backgroundColor: backgroundColor,
        overflow: 'hidden', 
    },
    
    modalBox:{
        alignItems: 'center',
        flex: 1,
        width:baseWidth*.8,
        backgroundColor: backgroundColor,
        borderColor:highlight,
        borderWidth:5,
        borderRadius:15,
        position: 'absolute', 
        top: baseHeight*.2, 
        left: baseWidth*.1, 
    },
    
    dayInput:{
        width:baseWidth*.25,
        marginBottom:10,
        borderWidth:4,
        color: textColor,
        borderColor:highlight,
        textAlign: "center",
        borderRadius:15,
        fontSize: smallFontSize,
        overflow: 'hidden',
        fontFamily: minorFont,
        flexWrap:'wrap',
    },

    picker:{ 
        backgroundColor: midtone, 
        color: backgroundColor, 
        fontFamily: minorFont, 
        fontSize:smallFontSize,
        borderRadius:15,
        overflow: 'hidden', 
        textAlign: "center",
        padding: 5,
        margin: 10,
    },
    
    pickerDropdown:{
        backgroundColor: highlight, 
        color: backgroundColor, 
        fontFamily: minorFont, 
        fontSize:smallFontSize,
        borderRadius:15,
        overflow: 'hidden', 
        textAlign: "center",
        padding: 5,
        margin: 10,
    },
    
    headerIcon:{
        alignSelf:'center', 
        width: 30, 
        height: 30,
    },
    
    graphIcon:{
        alignSelf:'center',
        width: baseWidth * (7.5/18), 
        height: (baseWidth * (7.5/18)) * (2/3),
    },
    
    graphIconBig:{
        alignSelf:'center',
        width: baseWidth * (11/16),
        height: (baseWidth * (11/16)) * (2/3),
    },
    
    backgroundImage:{
        alignSelf:'center',
        width: 380,
        height: 380,
    }
})

